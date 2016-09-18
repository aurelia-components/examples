import {inject, customElement, bindable} from 'aurelia-framework';

@customElement('base-button')
@inject(Element)
export class BaseButton {
  @bindable disabled = false;
  @bindable onClick = null;
  @bindable title = '';
  @bindable name = '';
  @bindable icon = null;
  @bindable type = 'btn-default';

  constructor(element) {
    this.element = element;
    this.element.style.display = 'inline-block';
  }

  buttonClicked() {
    if (this.disabled === true) {
      return;
    }

    if (typeof this.onClick === 'function') {
      this.onClick();
    }
  }
}

