import { inject, BindingEngine } from 'aurelia-framework';
import { moment } from 'moment';

@inject(BindingEngine)
export class Grid {
  constructor(bindingEngine) {
    this.bindingEngine = bindingEngine;
    this.pageSize = 10;
    this.page = 1;
    this.columns = [];
    this.columnDefinitions = [];
    this.read = null;
    this.data = null;
    this.pagable = true;
    this.filterable = true;
    this.sortable = true;
    this.parent = {
      'filter-items.bind': ''
    };
  }

  refresh() {}

  changeSort() {}
}

export class Pager {
  update(a, b, c) {}
}

export class Column {

  constructor(field, filterValue) {
    this.field = field;
    this.filterValue = filterValue;
    this.type = filterValue.from || filterValue.to ? 'date' : (!isFinite(
      filterValue) ? 'input' : 'num');
  }

  getFieldName() {
    return this.field;
  }

  hasFilter(){
    return true;
  }

  matchFilter(filteredValue) {
    switch (this.type) {
      case 'input':
        return this.filterValue === '' || filteredValue.toString()
          .indexOf(this.filterValue) > -1;
      case 'date':
        return (this.filterValue.from ? this.filterValue.from <=
          filteredValue : true) && (this.filterValue.to ? filteredValue <=
          this.filterValue.to : true);
      default:
        return this.filterValue === '' || filteredValue == this.filterValue;
    }
  }

  changeSortDirection() {
    switch (this.sortDirection) {
      case 'asc':
        this.sortDirection = 'desc';
        break;
      case 'desc':
        this.sortDirection = undefined;
        break;
      default:
        this.sortDirection = 'asc';
        break;
    }
  }

  setSortDirection() {
    this.sortDirection = 'asc';
    let sort = {
      name: this.field,
      value: this.sortDirection,
      column: this
    };

    return sort;
  }
}
