import {BaseStore} from './base-store';

export class RemoteStore extends BaseStore {
  constructor(read, settings) {
    super(settings);

    this.read = read;
    if (typeof read !== 'function') {
      throw new Error('Argument Exception: "read" must be a function for loading data returning promise!');
    }
  }

  getFiltersValuesAsQueryString() {
    var filters = [];
    for (let i = this.columnDefinitions.length - 1; i >= 0; i--) {
      let col = this.columnDefinitions[i];
      let filterQueryString = col.getQueryString();
      if (filterQueryString !== undefined) {
        filters.push(filterQueryString);
      }
    }

    return filters;
  }

  getFiltersValues() {
    let filters = [];
    for (let i = this.columnDefinitions.length - 1; i >= 0; i--) {
      let col = this.columnDefinitions[i];
      filters = filters.concat(col.getFilterValue());
    }

    return filters;
  }

  getSorters() {
    return this.sortProcessingOrder.map(sorter => {
      return {
        name: sorter.name,
        direction: sorter.value === 'asc' ? 1 : 2
      };
    });
  }

  getData() {
    const queryValues = {
        filter: this.getFiltersValues().reduce((acc, el) => {
            acc[el.name] = el.value;
            return acc;
        }, {}),
      pager: {
        page: this.page,
        count: window.Number(this.pageSize, 10)
      },
      sorter: {
        sorters: this.getSorters()
      }
    };

    return this.read(queryValues).then(result => {
      this.data = result.data;
      this.count = result.totalCount;
      this.updatePager();

      return (this.data);
    });
  }
}
