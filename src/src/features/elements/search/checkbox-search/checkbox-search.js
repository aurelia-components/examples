import {inject, customElement, bindable} from 'aurelia-framework';
import {customElementHelper} from 'utils';

@customElement('checkbox-search')
@inject(Element)
export class CheckboxSearch {
  @bindable entity = '';
  @bindable property = '';
  @bindable operator = '';
  @bindable value = '';
  @bindable isChecked = false;

  constructor(element) {
    this.element = element;
  }

  getResult() {
    let result = [];

    if (this.isChecked === false) {
      return result;
    }

    result.push({
        entity: this.entity,
        criteria: {
          name: this.property,
          value: this.value,
          operator: this.operator
        }
      }
    );

    return result;
  }

  isCheckedChanged(newValue, oldValue) {
    if (!this.debounce) {
      this.debounce = customElementHelper.debounce(() => {
        customElementHelper.dispatchEvent(this.element, 'search-control-dirty-state', {
          dirty: this.isDirty(),
          hash: this.getHash()
        });
      }, 100);
    }

    this.debounce();
  }

  getHash() {
    return this.entity + this.property;
  }

  isDirty() {
    return this.isChecked !== false;
  }
}
