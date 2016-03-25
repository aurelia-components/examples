import {inject} from 'aurelia-framework';
import {DialogController} from 'dialog';

@inject(DialogController)
export class EditPerson {
  person = {};

  constructor(controller) {
    this.controller = controller;
  }

  activate(person) {
    this.person = person;
  }
}
