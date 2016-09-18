import {customElement} from 'aurelia-framework';
import {DialogController} from './dialog-controller';

@customElement('ai-dialog-header')
export class AiDialogHeader {
  static inject = [DialogController];

  constructor(controller) {
    this.controller = controller;
  }
}
