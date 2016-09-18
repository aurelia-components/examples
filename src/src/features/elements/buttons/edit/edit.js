import {inject, customElement, bindable} from 'aurelia-framework';

@customElement('edit-button')
@inject(Element)
export class EditButton {
  @bindable disabled = false;
  @bindable onClick = null;
  @bindable title = 'Редакция';
  @bindable name = '';

  constructor(element) {
    this.element = element;
  }

  buttonClicked() {
    if (typeof this.onClick === 'function') {
      this.onClick();
    }
  }
}

