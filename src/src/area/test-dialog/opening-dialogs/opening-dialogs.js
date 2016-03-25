import {inject, bindable} from 'aurelia-framework';
import {I18N} from 'aurelia-i18n';
import {Logger} from 'service';
import {DialogService} from 'dialog';
import {EditPerson} from './../edit-person-dialog/edit-person';

@inject(Logger, DialogService, I18N)
export class OpeningDialogs {
  constructor(logger, dialogService, i18n) {
    this.dialogService = dialogService;
    this.logger = logger;
    this.i18n = i18n;

    this.firstName = 'Wade';
    this.lastName = 'Watts';
  }

  get fullName() {
    return this.firstName + ' ' + this.lastName;
  }

  openDialog() {
    let options = {
      model: {
        firstName: this.firstName,
        lastName: this.lastName
      },
      viewModel: EditPerson
    };

    this.dialogService.openDialog(options).then((response)=> {
      if (!response.wasCancelled) {
        console.log('ok - ' + response.output);
        this.firstName = response.output.firstName;
        this.lastName = response.output.lastName;
      } else {
        console.log('cancel');
      }
    });
  }

  canDeactivate() {
    if (this.dialogService.hasOpenDialogs()) {
      this.logger.error(this.i18n.tr('common.pleaseCloseAllDialogs'));
      return false;
    }

    return true;
  }
}
