import {inject, customElement, bindable} from 'aurelia-framework';

@customElement('tab')
@inject(Element)
export class Tab {
  @bindable name;
  @bindable badge;
  @bindable active = false;
  @bindable headingStyleObject = {};

  constructor(element) {
    this.element = element;
  }

  attached() {
  }

  bind() {
    /*
    if (this.active === 'active') {
      this.active = true;
    } else {
      this.active = false;
    }
     */
  }

  setInnerScroll() {
    this.element.style.height = '100%';
    this.element.style['overflow-y'] = 'auto';
    this.element.style.display = 'block';
  }

  show() {
    this.active = true;
    this.element.classList.remove('aurelia-hide');
  }

  hide() {
    this.element.classList.add('aurelia-hide');
    this.active = false;
  }
}
