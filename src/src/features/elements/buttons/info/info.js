import {inject, customElement, bindable} from 'aurelia-framework';

@customElement('info-button')
@inject(Element)
export class InfoButton {
  @bindable disabled = false;
  @bindable onClick = null;
  @bindable title = 'Информация';
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
