import {ChildRouter} from 'libs/child-router/child-router';
import {Session} from 'service';
import {inject, useView} from 'aurelia-framework';
import {I18N} from 'aurelia-i18n';

@inject(Session, I18N)
@useView('libs/child-router/tabs-router.html')
export class TestDialog extends ChildRouter {
  constructor(session, i18n) {
    super(session);
    this.i18n = i18n;
    this.navModel = [{
      route: '',
      redirect: 'playing-with-dialogs'
    }, {
      route: 'playing-with-dialogs',
      name: 'playing-with-dialogs',
      moduleId: './playing-with-dialogs/playing-with-dialogs',
      title: 'Playing with dialogs',
      nav: true
    }, {
      route: 'dialog-settings',
      name: 'dialog-settings',
      moduleId: './dialog-settings/dialog-settings',
      title: 'Dialog settings',
      nav: true
    }, {
      route: 'opening-dialogs',
      name: 'opening-dialogs',
      moduleId: './opening-dialogs/opening-dialogs',
      title: 'Opening dialogs',
      nav: true
    }];
  }
}
