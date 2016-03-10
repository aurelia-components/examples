import $ from 'jquery';
import bootstrap from 'twbs/bootstrap';

import {hostConsts} from './libs/host-consts';

export function configure(aurelia) {
  const hosts = {};
  hosts[hostConsts.cssSystem] = 'http://localhost:58619/api';

  aurelia.use
    .standardConfiguration()
    .developmentLogging()
    .plugin('aurelia-animator-css')
    .plugin('aurelia-validation', (config) => {
      config.useLocale('bg-BG');
    })
    .plugin('aurelia-i18n', (instance) => {
      // adapt options to your needs (see http://i18next.com/pages/doc_init.html)
      instance.setup({
        detectFromHeaders: false,
        lng: 'bg',
        fallbackLng: 'bg',
        ns: 'app',
        resGetPath: 'assets/locales/__lng__/__ns__.json',
        attributes: ['t', 'i18n'],
        useCookie: false,
        getAsync: false,
        debug: false
      });
    })
    .feature('features/service', (config) => {
      config.useLocale('bg-BG');
      config.setHttpService({
        authHost: 'http://localhost:2222',
        serviceHost: 'http://localhost:2222',
        serviceApiPrefix: '/api/',
        requestTimeout: 30000, // milliseconds
        hosts: hosts
      });
      config.routerAuthStep({
        loginRoute: 'login'
      });
      config.setLoggerService({
        positionClass: 'toast-top-right'
      });
    })
    .feature('features/dialog')
    .feature('features/utils')
    .feature('features/value-converters')
    .feature('features/attributes/popover')
    .feature('features/elements/assign')
    .feature('features/elements/buttons')
    .feature('features/elements/date-time-picker')
    .feature('features/elements/grid')
    .feature('features/elements/tree-view')
    .feature('features/elements/loading-mask')
    .feature('features/elements/popover')
    .feature('features/elements/select3')
    .feature('features/elements/splitter')
    .feature('features/elements/tabs');

  aurelia.start().then(a => a.setRoot());
}
