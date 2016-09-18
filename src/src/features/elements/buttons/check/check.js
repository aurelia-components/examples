import {inject, customElement, bindable, bindingMode} from 'aurelia-framework';

@customElement('check-button')
@inject(Element)
export class CheckButton {
  @bindable disabled = false;
  @bindable onClick = null;
  @bindable({defaultBindingMode: bindingMode.twoWay}) isActive = false;
  @bindable name = '';

  icon = '';
  type = 'btn-default';

  constructor(element) {
    this.element = element;
  }

  bind() {
    this.isActiveChanged();
  }

  isActiveChanged() {
    if (this.isActive == true) {
      this.icon = 'fa-check-square-o';
    } else {
      this.icon = 'fa-square-o';
    }
  }

  buttonClicked() {
    if (typeof this.onClick === 'function') {
      this.onClick();
    }

    this._toggle();
  }

  _toggle() {
    this.isActive = !this.isActive;
  }
}

