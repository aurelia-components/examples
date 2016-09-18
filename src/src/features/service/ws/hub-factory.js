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

    // todo: low priority: optimize
    this.hubMap = new Map();
    this.hubNotDispatchingEventsMap = new Map();

    this.isConnected = false;

    this.url = Config.wsOpts.hubHost + Config.wsOpts.hubHostSuffix;
    this.transport = Config.wsOpts.transport;
    Config.wsOpts.hubs.forEach(hubName => this.registerHub(hubName));

    // todo: remove! be aware that onConnected callback won't be fired at hub
    this.getHub(hub.usersSessionManagementHub).subscribe('x', x => {
      console.log('fuck off');
    });
  }

  connect(authToken) {
    $.connection.hub.stop();
    $.connection.hub.qs = { auth_token: authToken};
    $.connection.hub.url = this.url;
    $.connection.hub.logging = true;
    const conn = $.connection.hub.start({
      transport: this.transport
    }).done(() => {
      this.isConnected = true;
      $.connection.hub.log('My id: ' + $.connection.hub.id);
    }).fail(error => {
      this.logger.error('Connection failed!');
      if (error.context.status === 401) {
        this.eventAggregator.publish(new HttpSessionTimedOutMessage());
      }
    });

    return new Promise(function(resolve, reject) {
      conn.done(resolve);
      conn.fail(reject);
    });
  }

  disconnect() {
    $.connection.hub.stop();
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

    this.hubMap.set(hubName, this._createHub(proxyHub, true));
    this.hubNotDispatchingEventsMap.set(hubName, this._createHub(proxyHub, false));
  }

  _createHub(proxyHub, dispatchEvents) {
    const proxyHubFunctions = Object.keys(proxyHub.server);
    const hub = proxyHubFunctions.reduce((acc, funcName) => {
      acc[funcName] = (...args) => {
        if (dispatchEvents) {
          // todo: create separate event
          this.eventAggregator.publish(new HttpRequestStartedMessage());
        }

        const proxyPromise = proxyHub.server[funcName].apply(null, args);
        const promise = new Promise(function(resolve, reject) {
          proxyPromise.done(resolve);
          proxyPromise.fail(reject);
        }).then(response => {
          if (dispatchEvents) {
            // todo: create separate event
            this.eventAggregator.publish(new HttpRequestFinishedMessage());
          }

          return response;
        });

        promise.catch(error => {
          this._errorHandler.bind(error, dispatchEvents);
        });

        return promise;
      };

      return acc;
    }, {});


    hub.subscribe = (name, callback) => {
      proxyHub.on(name, callback);
    };

    hub.unsubscribe = (name, callback) => {
      proxyHub.off(name);
    };

    return hub;
  }

  getHub(hubName, opts) {
    const doNotDispatchEvents = opts && opts.dispatchEvents === false;
    let hub;
    if (doNotDispatchEvents) {
      hub = this.hubNotDispatchingEventsMap.get(hubName);
    } else {
      hub = this.hubMap.get(hubName);
    }

    if (hub === undefined) {
      throw new Error(`Argument Exception. There is no hub with name: ${hubName}`);
    }

    return hub;
  }


  _errorHandler(error, dispatchEvents) {
    if (dispatchEvents) {
      // todo: create separate event
      this.eventAggregator.publish(new HttpRequestFinishedMessage());
    }

    this.eventAggregator.publish(new HttpBadRequestMessage(error.message));
    //this.eventAggregator.publish(new HttpServerErrorRequestMessage(errors));
    //this.eventAggregator.publish(new HttpSessionTimedOutMessage());
  }
}
