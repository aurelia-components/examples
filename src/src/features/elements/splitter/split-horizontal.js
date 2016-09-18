import {inject, customElement, bindable, useView} from 'aurelia-framework';
import {split} from './split';

@customElement('split-horizontal')
@inject(Element)
@useView('./split-view.html')
export class SplitHorizontal {
  @bindable sizes;
  @bindable minSizes;

  constructor(element) {
    this.element = element;
  }

  attached() {
    split(this.element.children, 'horizontal', this.sizes, this.minSizes);
  }
}
