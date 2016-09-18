import {inject, customElement, bindable, useView} from 'aurelia-framework';
import {split} from './split';

@customElement('split-vertical')
@inject(Element)
@useView('./split-view.html')
export class SplitVertical {
  @bindable sizes;
  @bindable minSizes;

  constructor(element) {
    this.element = element;
  }

  attached() {
    split(this.element.children, 'vertical', this.sizes, this.minSizes);
  }
}

