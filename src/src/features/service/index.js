import {Config} from './config';

export {Logger} from './logger';
export {Session} from './session';

export {Http} from './http-client/http';
export {HubFactory} from './ws/hub-factory';
export {HttpRequestStartedMessage, HttpRequestFinishedMessage,
  HttpBadRequestMessage, HttpServerErrorRequestMessage,
  HttpSessionTimedOutMessage} from './http-client/http-client-messages';

export {UserLoggedInEvent} from './event/user-logged-in-event';
export {UserLoggedOutEvent} from './event/user-logged-out-event';

export {AccessRightsAuthorizeStep, RolesAuthorizeStep} from './authorize-steps';

export function configure(aurelia, configCallback) {
  const config = new Config();

  if (configCallback !== undefined && typeof(configCallback) === 'function') {
    configCallback(config);
  }

  return config.locale();
}
