import {inject, customElement, bindable} from 'aurelia-framework';

@customElement('delete-button')
@inject(Element)
export class DeleteButton {
  @bindable disabled = false;
  @bindable onClick = null;
  @bindable title = 'Изтрий';
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

