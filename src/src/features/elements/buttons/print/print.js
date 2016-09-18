import {inject, customElement, bindable} from 'aurelia-framework';

@customElement('print-button')
@inject(Element)
export class SaveButton {
  @bindable disabled = false;
  @bindable onClick = null;
  @bindable title = 'Отпечатай';
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

