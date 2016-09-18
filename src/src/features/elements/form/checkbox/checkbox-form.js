import {inject, customElement, bindable, bindingMode} from 'aurelia-framework';

@customElement('checkbox-form')
@inject(Element)
export class CheckboxForm {
  @bindable disabled = false;
  @bindable required = false;
  @bindable label = '';
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = '';
}
