// todo: migrate to aurelia-fetch-client
import {HttpClient} from 'aurelia-http-client';
import $ from 'jquery';
import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {HttpRequestStartedMessage, HttpRequestFinishedMessage,
  HttpBadRequestMessage, HttpServerErrorRequestMessage,
  HttpSessionTimedOutMessage, BusinessRuleValidationException} from './http-client-messages';

import {Session} from '../session';
import {Logger} from '../logger';
import {Locale} from '../locale';
import {Config} from '../config';

@inject(Session, Logger, EventAggregator)
export class Http {
  constructor(session, logger, eventAggregator) {
    this.session = session;
    this.logger = logger;
    this.authHttp = undefined;
    this.locale = Locale.Repository.default;
    this.eventAggregator = eventAggregator;

    this.host = Config.httpOpts.serviceHost;
    this.origin = this.host + Config.httpOpts.serviceApiPrefix;
    this.authOrigin = Config.httpOpts.authHost;
    this.hosts = Config.httpOpts.hosts || {};
    // todo: this is unused
    this.loadingMaskDelay = Config.httpOpts.loadingMaskDelay || 1000;
    this.requestTimeout = Config.httpOpts.requestTimeout;

    if (this.session.userRemembered()) {
      this.initAuthHttp(this.session.rememberedToken());
    }
  }

  _showLoadingMask() {
    this.eventAggregator.publish(new HttpRequestStartedMessage());
  }

  _hideLoadingMask() {
    this.eventAggregator.publish(new HttpRequestFinishedMessage());
  }

  _createQueryString(data) {
    return Object.keys(data).map(function (key) {
      let d = data[key];
      if (Array.isArray(d)) {
        return d.map(value => {
          return '' + key + '=' + value;
        }).join('&');
      } else {
        return '' + key + '=' + data[key];
      }
    }).join('&');
  }

  get(url, data) {
    this._showLoadingMask();
    let urlWithProps = url;
    if (data !== undefined) {
      urlWithProps += '?' + this._createQueryString(data);
    }

    const promise = this.authHttp.get(urlWithProps).then(response => {
      this._hideLoadingMask();
      return JSON.parse(response.response);
    });
    promise.catch(this.errorHandler.bind(this));
    return promise;
  }

  post(url, content = {}) {
    this._showLoadingMask();
    const promise = this.authHttp.post(url, content).then(response => {
      this._hideLoadingMask();
      if (response.response !== '') {
        return JSON.parse(response.response);
      }

      return undefined;
    });
    promise.catch(this.errorHandler.bind(this));

    return promise;
  }


  put(url, content = {}) {
    this._showLoadingMask();
    const promise = this.authHttp.put(url, content).then(response => {
      this._hideLoadingMask();
      if (response.response !== '') {
        return JSON.parse(response.response);
      }

      return undefined;
    });
    promise.catch(this.errorHandler.bind(this));

    return promise;
  }

  delete(url) {
    const promise = this.authHttp.delete(url).then(response => this._hideLoadingMask());
    promise.catch(this.errorHandler.bind(this));
    return promise;
  }

  multipartFormPost(url, data) {
    let requestUrl = this.origin + url;
    return this.multipartForm(requestUrl, data, 'POST');
  }

  multipartFormPut(url, data) {
    let requestUrl = this.origin + url;
    return this.multipartForm(requestUrl, data, 'PUT');
  }

  multipartForm(url, data, method) {
    this._showLoadingMask();
    let self = this;
    let req = $.ajax({
      url: url,
      data: data,
      processData: false,
      contentType: false,
      type: method,
      headers: {
        'Authorization': 'Bearer ' + this.token
      }
    });

    return new Promise(function (resolve, reject) {
      req.done(resolve);
      req.fail(reject);
      self._hideLoadingMask();
    }).catch(this.errorHandler.bind(this));
  }

  postDownloadFile(url, data) {
    return this.downloadFile(url, 'POST', data);
  }

  getDownloadFile(url, data) {
    let urlWithProps = url;
    if (data !== undefined) {
      urlWithProps += '?' + this._createQueryString(data);
    }

    return this.downloadFile(urlWithProps, 'GET');
  }

  downloadFile(url, method, data) {
    let self = this;
    this._showLoadingMask();
    const urlAddress = this.origin + url;
    const authHeaderValue = `Bearer ${this.token}`;
    const promise = new Promise((resolve, reject) => {
      const xmlhttp = new XMLHttpRequest();
      xmlhttp.open(method, urlAddress, true);
      xmlhttp.timeout = this.requestTimeout;
      xmlhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      xmlhttp.setRequestHeader('Authorization', authHeaderValue);
      xmlhttp.responseType = 'blob';

      xmlhttp.onload = function (oEvent) {
        if (this.status !== 200) {
          var reader = new FileReader();
          let statusCode = this.status;
          reader.addEventListener("loadend", function() {
            self.errorHandler({
              statusCode: statusCode,
              response: reader.result
            });
          });
          reader.readAsText(this.response);
          return;
        }

        const blob = xmlhttp.response;
        const windowUrl = window.URL || window.webkitURL;
        const url = windowUrl.createObjectURL(blob);
        const filename = this.getResponseHeader('Content-Disposition').match(/^attachment; filename=\"(.+)\";/)[1];

        const anchor = $('<a></a>');
        anchor.prop('href', url);
        anchor.prop('download', filename);
        $('body').append(anchor);
        anchor.get(0).click();
        windowUrl.revokeObjectURL(url);
        anchor.remove();
      };

      xmlhttp.ontimeout = function () {
        reject({timeout: true});
      };

      xmlhttp.addEventListener('error', () => {
        reject();
      });
      xmlhttp.addEventListener('load', () => {
        resolve();
        this._hideLoadingMask();
      });

      if (method === 'GET') {
        xmlhttp.send();
      } else if (method === 'POST') {
        xmlhttp.send(JSON.stringify(data));
      } else {
        throw new Error('Unsuported method call!');
      }
    });

    promise.catch(this.errorHandler.bind(this));
    return promise;
  }

  loginBasicAuth(email, pass) {
    let client = new HttpClient();
    let encodedData = window.btoa(email + ':' + pass);
    let promise = client.createRequest('token')
      .asGet()
      .withBaseUrl(this.authOrigin)
      .withHeader('Authorization', 'Basic ' + encodedData)
      .send();
    promise.then(this.loginHandle.bind(this));
    promise.catch(this.errorHandler.bind(this));

    return promise;
  }

  loginResourceOwner(email, pass, clientId) {
    this._showLoadingMask();
    let data = {
      grant_type: 'password',
      client_id: clientId,
      username: email,
      password: pass
    };

    let client = new HttpClient()
      .configure(x => {
        x.withBaseUrl(this.authOrigin);
        x.withHeader('Content-Type', 'application/x-www-form-urlencoded');
      });

    // todo: refactor out $.param
    const promise = client.post('token', $.param(data));
    promise.then(this.loginHandle.bind(this));
    promise.catch(this.errorHandler.bind(this));

    return promise;
  }

  initAuthHttp(token) {
    this.token = token;
    this.authHttp = new HttpClient().configure(x => {
      x.withBaseUrl(this.origin);
      x.withHeader('Authorization', `Bearer ${this.token}`);
      x.withHeader('Content-Type', 'application/json');
      x.withHeader('Accept', '*/*');
    });
  }

  getAuthHttpFor(hostName) {
    let authHttp = new HttpClient().configure(x => {
      x.withBaseUrl(this.hosts[hostName]);
      x.withHeader('Authorization', `Bearer ${this.token}`);
      x.withHeader('Content-Type', 'application/json');
      x.withHeader('Accept', '*/*');
    });

    return authHttp;
  }

  _convertToArray(value) {
    let result = value || [];
    if (typeof result === 'string') {
      return result.split(',');
    }

    return result;
  }

  loginHandle(response) {
    this._hideLoadingMask();
    const data = JSON.parse(response.response);
    let token = data.access_token;
    this.initAuthHttp(token);

    let claims = data.userClaims || [];
    if (typeof claims === 'string') {
      claims = JSON.parse(claims);
    }

    this.session.loginUser({
      token: token,
      userName: data.userName || 'please give me a name!',
      userClaims: claims,
      userRoles: this._convertToArray(data.userRoles),
      userAccessRights: this._convertToArray(data.userAccessRights)
    });
  }

  // TODO: use as in aurelia-validation
  errorHandler(response) {
    this._hideLoadingMask();

    if (response.statusCode === 400) {
      const error = JSON.parse(response.response);
      this.eventAggregator.publish(new HttpBadRequestMessage(error.message));
    } else if (response.statusCode === 418) {
      const errors = JSON.parse(response.response);
      this.eventAggregator.publish(new HttpServerErrorRequestMessage(errors));
    } else if (response.statusCode === 401) {
      this.eventAggregator.publish(new HttpSessionTimedOutMessage());
      this.logger.warn(this.locale.translate('sessionTimedOut'));
    } else if (response.statusCode === 403) {
      this.logger.warn(this.locale.translate('accessDenied'));
    } else if (response.statusCode === 500) {
      // todo: show and/or log error
      /*
{
  "success": false,
  "error": "AtikInLib.Exceptions.BusinessRuleValidationException: Please add laboratory environment data first for today(Saturday, 10 September 2016)\n   at AtikInLib.Validation.EnsureBusinessValidationRule(Boolean isViolatingBusinessRule, String errorMsg)\n   at GlobalTest.QueryStack.Services.RequestIndicatorService.GetRequestIndicatorResult(Int32 requestIndicatorId)\n   at GlobalTest.Server.Controllers.RequestIndicatorController.GetRequestIndicatorResult(Int32 requestIndicatorId)\n   at lambda_method(Closure , Object , Object[] )\n   at Microsoft.AspNetCore.Mvc.Internal.ControllerActionInvoker.<InvokeActionFilterAsync>d__28.MoveNext()\n--- End of stack trace from previous location where exception was thrown ---\n   at Microsoft.AspNetCore.Mvc.Internal.ControllerActionInvoker.<InvokeAsync>d__18.MoveNext()\n--- End of stack trace from previous location where exception was thrown ---\n   at System.Runtime.CompilerServices.TaskAwaiter.ThrowForNonSuccess(Task task)\n   at System.Runtime.CompilerServices.TaskAwaiter.HandleNonSuccessAndDebuggerNotification(Task task)\n   at Microsoft.AspNetCore.Builder.RouterMiddleware.<Invoke>d__4.MoveNext()\n--- End of stack trace from previous location where exception was thrown ---\n   at System.Runtime.CompilerServices.TaskAwaiter.ThrowForNonSuccess(Task task)\n   at System.Runtime.CompilerServices.TaskAwaiter.HandleNonSuccessAndDebuggerNotification(Task task)\n   at Microsoft.AspNetCore.Builder.Extensions.MapMiddleware.<Invoke>d__3.MoveNext()\n--- End of stack trace from previous location where exception was thrown ---\n   at System.Runtime.CompilerServices.TaskAwaiter.ThrowForNonSuccess(Task task)\n   at System.Runtime.CompilerServices.TaskAwaiter.HandleNonSuccessAndDebuggerNotification(Task task)\n   at Microsoft.AspNetCore.Authentication.AuthenticationMiddleware`1.<Invoke>d__18.MoveNext()\n--- End of stack trace from previous location where exception was thrown ---\n   at Microsoft.AspNetCore.Authentication.AuthenticationMiddleware`1.<Invoke>d__18.MoveNext()\n--- End of stack trace from previous location where exception was thrown ---\n   at System.Runtime.CompilerServices.TaskAwaiter.ThrowForNonSuccess(Task task)\n   at System.Runtime.CompilerServices.TaskAwaiter.HandleNonSuccessAndDebuggerNotification(Task task)\n   at Microsoft.AspNetCore.Cors.Infrastructure.CorsMiddleware.<Invoke>d__7.MoveNext()\n--- End of stack trace from previous location where exception was thrown ---\n   at System.Runtime.CompilerServices.TaskAwaiter.ThrowForNonSuccess(Task task)\n   at System.Runtime.CompilerServices.TaskAwaiter.HandleNonSuccessAndDebuggerNotification(Task task)\n   at System.Runtime.CompilerServices.TaskAwaiter.GetResult()\n   at GlobalTest.Server.Middleware.HttpExceptions.HttpExceptionMiddleware.<Invoke>d__4.MoveNext()"
}
*/
      this.logger.error(this.locale.translate('internalServerError'));
    } else if (response.statusCode === 501) {
      const error = JSON.parse(response.response);
      this.eventAggregator.publish(new BusinessRuleValidationException(error.error));
    } else if (response.timeout === true) {
      this.logger.error(this.locale.translate('requestTimeout'));
    } else {
      this.logger.error(this.locale.translate('errorHappend'));
    }
  }
}
