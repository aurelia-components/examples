import {inject, customElement, bindable} from 'aurelia-framework';

@customElement('loading-mask')
@inject(Element)
export class LoadingMask {
  @bindable title = 'Зареждане';
  @bindable showMask = false;

  constructor(element) {
    this.element = element;

    this.titleStyleObject = {
      color: '#ffffff',
      opacity: 1,
      fontSize: '2.5em'
    };
  }

  attached() {
    this.spinnerElement = this.element.children[0];
  }

  showMaskChanged(newValue, oldValue) {
    if (newValue === true) {
      this._showLoadingMask();
    } else {
      this._hideLoadingMask();
    }
  }

  _showLoadingMask() {
    this.spinnerElement.style.display = 'block';
  }

  _hideLoadingMask() {
    this.spinnerElement.style.display = 'none';
  }
}
