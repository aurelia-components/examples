import {inject, customElement, bindable, bindingMode} from 'aurelia-framework';

@customElement('filter-button')
@inject(Element)
export class FilterButton {
  @bindable disabled = false;
  @bindable onClick = null;
  @bindable({defaultBindingMode: bindingMode.twoWay}) isActive = false;
  name = '';
  type = 'btn-default';

  constructor(element) {
    this.element = element;
  }

  bind() {
    this.isActiveChanged();
  }

  isActiveChanged() {
    if (this.isActive == true) {
      this.name = 'Скрий филтър';
      this.type = 'btn-success';
    } else {
      this.name = 'Покажи филтър';
      this.type = 'btn-default';
    }
  }

  buttonClicked() {
    if (typeof this.onClick === 'function') {
      this.onClick();
    }

    this._toggleFilter();
  }

  _toggleFilter() {
    this.isActive = !this.isActive;
  }
}

