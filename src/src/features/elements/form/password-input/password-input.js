import {inject, customElement, bindable, bindingMode} from 'aurelia-framework';

@customElement('password-input-form')
@inject(Element)
export class PasswordInput {
  id = 'auto-getn-' + Math.random();
  @bindable disabled = false;
  @bindable required = false;
  @bindable label = '';
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = '';
}
