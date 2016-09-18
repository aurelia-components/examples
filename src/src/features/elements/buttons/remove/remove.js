import {inject, customElement, bindable} from 'aurelia-framework';

@customElement('remove-button')
@inject(Element)
export class RemoveButton {
  @bindable disabled = false;
  @bindable onClick = null;
  @bindable title = 'Премахни';
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
