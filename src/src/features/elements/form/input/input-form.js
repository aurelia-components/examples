import {inject, customElement, bindable, bindingMode} from 'aurelia-framework';

@customElement('input-form')
@inject(Element)
export class InputForm {
  id = 'auto-getn-' + Math.random();
  @bindable disabled = false;
  @bindable required = false;
  @bindable label = '';
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = '';
}
