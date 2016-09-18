import {inject, customElement, bindable, computedFrom, bindingMode, BindingEngine} from 'aurelia-framework';
import {customElementHelper} from 'utils';

@customElement('autocomplete')
@inject(Element, BindingEngine)
export class Autocomplete {
  @bindable items = [];
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = null;
  @bindable disabled = false;
  @bindable options = {};

  defaultOptions = {
    caption: 'start typing'
  };

  constructor(element, bindingEngine, taskQueue) {
    this.element = element;
    this.bindingEngine = bindingEngine;
  }

  bind() {
    this.opts = Object.assign(this.defaultOptions, this.options);
  }
}
