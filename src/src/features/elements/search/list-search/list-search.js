import {inject, customElement, bindable} from 'aurelia-framework';
import {searchOperator} from '../search-operator';
import {customElementHelper} from 'utils';

@customElement('list-search')
@inject(Element)
export class ListSearch {
  @bindable entity = '';
  @bindable property = '';
  @bindable columns = [];
  @bindable models = [];
  @bindable isSelected = false;

  constructor(element) {
    this.element = element;
    this.selectedIds = [];
  }

  onRowSelect(model) {
    this.selectedIds.push(model.id);
    this.isSelected = true;
  }

  onRowDeselected(model) {
    var index = this.selectedIds.indexOf(model.id);

    if (index > -1) {
      this.selectedIds.splice(index, 1);
    }

    this.isSelected = this.selectedIds.length !== 0;
  }

  getResult() {
    let result = [];

    if (this.selectedIds.length === 0) {
      return result;
    }

    result.push({
        entity: this.entity,
        criteria: {
          name: this.property,
          value: this.selectedIds,
          operator: searchOperator.Contains
        }
      }
    );

    return result;
  }

  isSelectedChanged(newValue, oldValue) {
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
    return this.isSelected === true;
  }
}
