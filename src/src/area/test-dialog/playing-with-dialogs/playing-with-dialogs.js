import {inject, bindable} from 'aurelia-framework';
import {I18N} from 'aurelia-i18n';
import {Logger} from 'service';
import {DialogService} from 'dialog';
import {EditPerson} from './../edit-person-dialog/edit-person';

@inject(Logger, DialogService, I18N)
export class PlayingWithDialogs {
  isDraggable = true;
  isModal = false;
  lock = true;
  centerHorizontalOnly = false;
  title = 'Внимание!';
  msg = 'Сигурни ли сте?';
  icon = '';
  okBtnClass = 'btn-secondary';
  okBtnText = 'Oк';
  cancelBtnText = 'Отказ';
  showCancelButton = true;

  valueTypes = [{value: true, name: 'true'}, {value: false, name: 'false'}, {value: undefined, name: 'default'}];

  defaultOptions = [{
    type: 'Custom (change the options yourself)',
    defaults: {}
  }, {
    type: 'Dialog',
    defaults: {
      isDraggable: true,
      isModal: false,
      lock: true,
      centerHorizontalOnly: false
    }
  }, {
    type: 'ModalDialog',
    defaults: {
      isDraggable: true,
      isModal: true,
      lock: true,
      centerHorizontalOnly: false
    }
  }, {
    type: 'ConfirmDialog',
    defaults: {
      isDraggable: true,
      isModal: true,
      lock: true,
      centerHorizontalOnly: false,
      title: 'Внимание!',
      icon: '',
      okBtnClass: 'btn-secondary',
      okBtnText: 'Oк',
      cancelBtnText: 'Отказ',
      showCancelButton: true
    }
  }, {
    type: 'ConfirmDeleteDialog',
    defaults: {
      isDraggable: true,
      isModal: true,
      lock: true,
      centerHorizontalOnly: false,
      title: 'Внимание!',
      icon: 'fa-trash-o',
      okBtnClass: 'btn-danger',
      okBtnText: 'Изтрий',
      cancelBtnText: 'Отказ',
      showCancelButton: true
    }
  }];

  @bindable useDefaultOptionsFor = this.defaultOptions[0];

  useDefaults = {
    isDraggable: true,
    isModal: true,
    lock: true,
    centerHorizontalOnly: true,
    title: true,
    msg: true,
    icon: true,
    okBtnClass: true,
    okBtnText: true,
    cancelBtnText: true,
    showCancelButton: true
  };

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

  bind() {
    this.useDefaultOptionsForChanged();
  }

  useDefaultOptionsForChanged() {
    Object.keys(this.useDefaults).forEach(option => {
      this.useDefaults[option] = false;
    });

    Object.keys(this.useDefaultOptionsFor.defaults).forEach(option => {
      this[option] = this.useDefaultOptionsFor.defaults[option];
      this.useDefaults[option] = true;
    });
  }

  openDialog() {
    let options = this._getOptions();
    options.model = {
      firstName: this.firstName,
      lastName: this.lastName
    };
    options.viewModel = EditPerson;
    this.dialogService.openDialog(options).then(this._dialogCallback.bind(this));
  }

  openModalDialog() {
    let options = this._getOptions();
    options.model = {
      firstName: this.firstName,
      lastName: this.lastName
    };
    options.viewModel = EditPerson;
    this.dialogService.openModalDialog(options).then(this._dialogCallback.bind(this));
  }

  openConfirmDialog() {
    if (!this.msg) {
      this.logger.error('Please enter a message for the dialog!');
    } else {
      let options = this._getConfirmDialogOptions();
      this.dialogService.openConfirmDialog(options).then(this._confirmDialogCallback.bind(this));
    }
  }

  openConfirmDeleteDialog() {
    if (!this.msg) {
      this.logger.error('Please enter a message for the dialog!');
    } else {
      let options = this._getConfirmDialogOptions();
      this.dialogService.openConfirmDeleteDialog(options).then(this._confirmDialogCallback.bind(this));
    }
  }

  _getOptions() {
    let optionNames = ['isDraggable', 'isModal', 'lock', 'centerHorizontalOnly'];
    let options = {};
    optionNames.forEach(o => {
      if (this[o] !== undefined) {
        options[o] = this[o];
      }
    });

    return options;
  }

  _getConfirmDialogOptions() {
    let optionNames = ['title', 'msg', 'icon', 'okBtnClass', 'okBtnText', 'cancelBtnText', 'showCancelButton'];
    let confirmOptions = {};
    optionNames.forEach(o => {
      if (this[o] !== undefined && this[o] !== '') {
        confirmOptions[o] = this[o];
      }
    });

    let dialogOptions = this._getOptions();

    let options = Object.assign(confirmOptions, dialogOptions);

    return options;
  }

  _dialogCallback(response) {
    if (!response.wasCancelled) {
      console.log('ok - ' + response.output);
      this.firstName = response.output.firstName;
      this.lastName = response.output.lastName;
    } else {
      console.log('cancel');
    }
  }

  _confirmDialogCallback(response) {
    if (response) {
      console.log('yes - ' + response.output);
    } else {
      console.log('no');
    }
  }

  canDeactivate() {
    if (this.dialogService.hasOpenDialogs()) {
      this.logger.error(this.i18n.tr('common.pleaseCloseAllDialogs'));
      return false;
    }

    return true;
  }
}
