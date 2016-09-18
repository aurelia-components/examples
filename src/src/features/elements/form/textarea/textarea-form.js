import {inject, customElement, bindable, bindingMode} from 'aurelia-framework';

@customElement('textarea-form')
@inject(Element)
export class TextareaForm {
  id = 'auto-getn-' + Math.random();
  @bindable disabled = false;
  @bindable required = false;
  @bindable label = '';
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = '';
}
