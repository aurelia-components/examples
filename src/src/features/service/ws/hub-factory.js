import {inject, computedFrom} from 'aurelia-framework';
import $ from 'jquery';
// IMPORTANT! needs to be uncommented if used!
//import 'libs/jquery.signalR';
//import 'libs/hubs';
import {EventAggregator} from 'aurelia-event-aggregator';
import {
  HttpRequestStartedMessage, HttpRequestFinishedMessage,
  HttpBadRequestMessage, HttpServerErrorRequestMessage,
  HttpSessionTimedOutMessage
} from '../http-client/http-client-messages';

import {Config} from '../config';

import {Logger} from 'service';

@inject(EventAggregator, Logger)
export class HubFactory {
  constructor(eventAggregator, logger) {
    this.eventAggregator = eventAggregator;
    this.logger = logger;

    this.requestsCount = 0;
    this.loadingMaskDelay = Config.httpOpts.loadingMaskDelay || 1000;

    this.hubMap = new Map();

    this.isConnected = false;
  }

  connect(authToken, url) {
    $.connection.hub.qs = { auth_token: authToken};
    $.connection.hub.url = url;
    $.connection.hub.logging = true;
    const conn = $.connection.hub.start({
      // todo: windows 7 :(... needs to be enabled for prod
      //transport: 'webSockets'
    }).done(() => {
      this.isConnected = true;
      $.connection.hub.log('My id: ' + $.connection.hub.id);
      this.logger.info('Connection succesfull!');
    }).fail(() => {
      this.logger.error('Connection failed!');
    });

    return new Promise(function(resolve, reject) {
      conn.done(resolve);
      conn.fail(reject);
    });
  }

  registerHub(hubName, subscriptions) {
    if (this.isConnected) {
      throw new Error('Hubs must be registered before connection!');
    }

    const proxyHub = $.connection[hubName];
    if (proxyHub === undefined) {
      throw new Error(`Argument Exception. There is no hub with name: ${hubName}`);
    }

    Object.assign(proxyHub.client, subscriptions || {});

    const proxyHubFunctions = Object.keys(proxyHub.server);
    const hub = proxyHubFunctions.reduce((acc, funcName) => {
      acc[funcName] = (...args) => {
        this._showLoadingMask();
        const proxyPromise = proxyHub.server[funcName].apply(null, args);
        const promise = new Promise(function(resolve, reject) {
          proxyPromise.done(resolve);
          proxyPromise.fail(reject);
        }).then(response => {
          this._hideLoadingMask();
          return response;
        });

        promise.catch(this._errorHandler.bind(this));

        return promise;
      };

      acc.subscribe = (name, callback) => {
        proxyHub.on(name, callback);
      };

      acc.unsubscribe = (name, callback) => {
        proxyHub.off(name);
      };

      return acc;
    }, {});

    this.hubMap.set(hubName, hub);
  }

  getHub(hubName) {
    const hub = this.hubMap.get(hubName);
    if (hub === undefined) {
      throw new Error(`Argument Exception. There is no hub with name: ${hubName}`);
    }

    return hub;
  }

  _showLoadingMask() {
    this.requestsCount += 1;
    if (this.requestsCount === 1) {
      if (this.loadingMaskDelay > 0) {
        this._queryTimeout = window.setTimeout(() => {
          this.eventAggregator.publish(new HttpRequestStartedMessage());
        }, this.loadingMaskDelay);
      } else {
        this.loadingMask.show();
      }
    }
  }

  _hideLoadingMask() {
    this.requestsCount -= 1;
    if (this.requestsCount <= 0) {
      if (this._queryTimeout) {
        window.clearTimeout(this._queryTimeout);
      }

      this.eventAggregator.publish(new HttpRequestFinishedMessage());
      this.requestsCount = 0;
    }
  }

  _errorHandler(error) {
    this._hideLoadingMask();

    this.eventAggregator.publish(new HttpBadRequestMessage(error.message));
    //this.eventAggregator.publish(new HttpServerErrorRequestMessage(errors));
    //this.eventAggregator.publish(new HttpSessionTimedOutMessage());
  }
}
