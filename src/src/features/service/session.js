import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {Router} from 'aurelia-router';
import {Logger} from './logger';
import {UserLoggedInEvent} from './event/user-logged-in-event';
import {UserLoggedOutEvent} from './event/user-logged-out-event';

const constant = {
  appData: 'appData'
};

@inject(Router, Logger, EventAggregator)
export class Session {

  constructor(router, logger, eventAggregator) {
    this.router = router;
    this.logger = logger;
    this.eventAggregator = eventAggregator;

    this.initUserData();

    if (this.userRemembered()) {
      this.restoreData();
    }
  }

  initUserData() {
    this.userName = null;
    this.userClaims = [];
    this.userRoles = [];
    this.userAccessRights = [];

    this.isLoggedIn = false;
    this.isBusy = false;
  }

  loginUser(data) {
    // todo: check data params
    if (data) {
      localStorage[constant.appData] = JSON.stringify(data);
      this.restoreData();
    } else {
      throw new Error('Argument Exception!');
    }
  }

  logoutUser() {
    localStorage.clear();
    this.initUserData();
    this.eventAggregator.publish(new UserLoggedOutEvent());
  }

  userHasAccessRight(requiredAccessRight) {
    return this.userAccessRights[requiredAccessRight] === true;
  }

  userHasAllAccessRights(requiredAccessRights) {
    return requiredAccessRights.every(accessRight => {
      return this.userHasAccessRight(accessRight);
    });
  }

  userHasRole(requredRole) {
    return this.userRoles[requredRole] === true;
  }

  userHasAtLeastOneRole(requiredRoles) {
    return requiredRoles.some(requiredRole => {
      return this.userHasRole(requiredRole);
    });
  }

  getUserClaim(claimType) {
    return this.userClaims[claimType];
  }

  isUserLoggedIn() {
    return this.isLoggedIn === true;
  }

  userRemembered() {
    let isInLocalStorage = localStorage[constant.appData] !== undefined;
    return isInLocalStorage;
  }

  restoreData() {
    const data = JSON.parse(localStorage[constant.appData]);

    this.userName = data.userName;
    this.userClaims = data.userClaims.reduce(function(hash, userClaim) {
      hash[userClaim.type] = userClaim.value;
      return hash;
    }, {});
    this.userRoles = data.userRoles.reduce((hash, userRole) => {
      hash[userRole] = true;
      return hash;
    }, {});
    this.userAccessRights = data.userAccessRights.reduce((hash, accessRight) => {
      hash[accessRight] = true;
      return hash;
    }, {});

    // todo: delete
    this.userAccessRights['access'] = true;

    this.isLoggedIn = true;
    this.token = data.token;
    this.eventAggregator.publish(new UserLoggedInEvent(data.token));
  }

  rememberedToken() {
    const token = JSON.parse(localStorage[constant.appData]).token;
    return token;
  }

  getUserName() {
    return this.userName;
  }
}

