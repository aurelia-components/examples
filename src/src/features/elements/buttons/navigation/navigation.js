import {inject, customElement, bindable, computedFrom} from 'aurelia-framework';

@customElement('navigation-button')
@inject(Element)
export class NavigationButton {
  @bindable disabled = false;
  @bindable onClick = null;
  @bindable title = '';
  @bindable icon = '';
  @bindable selected = false;

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

