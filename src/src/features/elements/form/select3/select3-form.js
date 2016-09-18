import {inject, customElement, bindable, bindingMode} from 'aurelia-framework';

@customElement('select3-form')
@inject(Element)
export class Select3Form {
  @bindable disabled = false;
  @bindable required = false;
  @bindable label = '';
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = '';
  @bindable items = [];
  @bindable options = {};
}
