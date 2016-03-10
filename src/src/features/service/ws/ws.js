import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {
  HttpRequestStartedMessage, HttpRequestFinishedMessage,
  HttpBadRequestMessage, HttpServerErrorRequestMessage,
  HttpSessionTimedOutMessage
} from '../http-client/http-client-messages';

import {Config} from '../config';

import {Logger} from 'service';

@inject(EventAggregator, Logger)
export class WS {
  constructor(eventAggregator, logger) {
    this.eventAggregator = eventAggregator;
    this.logger = logger;

    this.isConnected = false;

    this.url = Config.wsOpts.hubHost + Config.wsOpts.hubHostSuffix;
  }

  connect(authToken) {
    if (this.isConnected) {
      throw new Error('You must disconnect first!');
    }

    let promise = new Promise((resolve, reject) => {
      this._connect(0, resolve, reject);
    });

    return promise;
  }

  disconnect() {
  }

  _connect(attempt, resolve, reject) {
    var connectionAttempt = attempt;
    var socket = new WebSocket(this.url);

    socket.onmessage = (event) => {
      console.log(event);
      var data = JSON.parse(event.data);
      console.log(data.text);
    };

    socket.onopen = () => {
      connectionAttempt = 1;
      socket.send('subscribe');
      resolve(socket);
    };

    socket.onclose = () => {
      if (connectionAttempt <= 3) {
        console.warn('WARNING: Lost server connection, attempting to reconnect. Attempt number ' + connectionAttempt);
        window.setTimeout(() => {
          this._connect(connectionAttempt + 1);
        }, 5000);
      } else {
        console.warn('The connection with the server was lost.');
      }
    };
  }

}
