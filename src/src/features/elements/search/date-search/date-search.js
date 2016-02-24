import {inject, customElement, bindable} from 'aurelia-framework';
import {searchOperator} from '../search-operator';
import {customElementHelper} from 'utils';

@customElement('date-search')
@inject(Element)
export class DateSearch {
  @bindable entity = '';
  @bindable property = '';
  @bindable startDate = false;
  @bindable endDate = false;

  constructor(element) {
    this.element = element;
  }

  getResult() {
    let result = [];

    if (this.startDate === false && this.endDate === false) {
      return result;
    }

    if (this.startDate !== false) {
      result.push({
        entity: this.entity,
        criteria: {
          name: this.property,
          value: this.startDate.toISOString(),
          operator: searchOperator.GreaterThanOrEqual
        }
      });
    }

    if (this.endDate !== false) {
      result.push({
        entity: this.entity,
        criteria: {
          name: this.property,
          value: this.endDate.toISOString(),
          operator: searchOperator.LessThan
        }
      });
    }

    return result;
  }

  startDateChanged(newValue, oldValue) {
    this.dateChanged();
  }

  endDateChanged(newValue, oldValue) {
    this.dateChanged();
  }

  dateChanged() {
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
    return this.startDate !== false || this.endDate !== false;
  }
}
