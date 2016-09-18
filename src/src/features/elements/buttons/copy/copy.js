import {inject, customElement, bindable} from 'aurelia-framework';

@customElement('copy-button')
@inject(Element)
export class CopyButton {
  @bindable disabled = false;
  @bindable onClick = null;
  @bindable title = 'Копирай';
  @bindable name = '';
  @bindable type = 'btn-primary';

  constructor(element) {
    this.element = element;
  }

  buttonClicked() {
    if (typeof this.onClick === 'function') {
      this.onClick();
    }
  }
}

