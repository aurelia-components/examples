import {DialogController} from './dialog-controller';
import {inject} from 'aurelia-framework';

@inject(DialogController)
export class DialogOptions {
  constructor(controller) {
    this.controller = controller;
  }

  activate(opts) {
    opts = opts || {};

    this.title = opts.title;
    this.msg = opts.msg;

    this.okBtnType = opts.okBtnClass;
    this.okBtnText = opts.okBtnText;

    this.cancelBtnText = opts.cancelBtnText;
    this.showCancelButton = opts.showCancelButton;

    this.viewModel = opts.viewModel;
    this.model = opts.model;

    this.icon = opts.icon;
  }
}
