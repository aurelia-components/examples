import {inject, customElement, bindable} from 'aurelia-framework';

@customElement('download-button')
@inject(Element)
export class DownloadButton {
  @bindable disabled = false;
  @bindable onClick = null;
  @bindable title = 'Свали';
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

