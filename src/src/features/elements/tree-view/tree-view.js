import {inject, customElement, ViewResources, bindable, BindingEngine} from 'aurelia-framework';
import {ListItem} from './list-item';
import {customElementHelper} from 'utils';


@customElement('tree-view')
@inject(Element, ViewResources, BindingEngine)
export class TreeView {
  @bindable data = [];
  @bindable filterFunc = null;
  @bindable filter = false;
  @bindable selectedItem;

  constructor(element, viewResources, bindingEngine) {
    this.element = element;
    this.viewResources = viewResources;
    this.bindingEngine = bindingEngine;
  }

  created(owningView, myView) {}

  // todo: make this work
  _subscribeToDataCollectionChanges() {
    this.dataCollectionSubscription = this.bindingEngine
      .collectionObserver(this.data)
      .subscribe(collectionChangeInfo => {
        this.refresh();
      });
  }

  bind(bindingContext, overrideContext) {
    this._subscribeToDataCollectionChanges();
    this.dataPropertySubscription = this.bindingEngine
      .propertyObserver(this, 'data')
      .subscribe((newItems, oldItems) => {
        this.dataCollectionSubscription.dispose();
        this._subscribeToDataCollectionChanges();
        this.refresh();
      });

    this.refresh();

    if (this.filter === true) {
      this.filterChanged(this.filter);
    }

    if (this.selectedItem) {
      this.selectedItemChanged(this.selectedItem);
    }
  }

  attached() {}

  detached() {}

  unbind() {
    this.dataPropertySubscription.dispose();
    this.dataCollectionSubscription.dispose();
  }

  filterFuncChanged(newFunc, oldFunc) {
    this.treeData.forEach(li => li.filter = newFunc);
    if (this.filter === true) {
      this.filterChanged(this.filter);
    }
  }

  filterChanged(newValue, oldValue) {
    if (newValue !== oldValue) {
      if (newValue) {
        this.treeData.forEach(li => li.applyFilter());
      } else {
        this.treeData.forEach(li => li.clearFilter());
      }
    }
  }

  selectedItemChanged(newValue, oldValue) {
    if (newValue) {
      if (newValue !== oldValue) {
        let listItem = this.listItemMap.get(newValue);
        if (listItem) {
          this.listItemClicked(listItem);
        }
      }
    } else {
      if (this.currentSelectedListItem) {
        this.currentSelectedListItem.setSelectedStatus(false);
      }
    }
  }

  refresh() {
    this.treeData = processData(this.data, this.filterFunc);
    this.listItemMap = new WeakMap();
    this.treeData.forEach(li => this.listItemMap.set(li.item, li));
  }

  listItemClicked(listItem) {
    customElementHelper.dispatchEvent(this.element, 'select', {
      $item: listItem.item
    });

    if (this.currentSelectedListItem) {
      this.currentSelectedListItem.setSelectedStatus(false);
    }

    listItem.setSelectedStatus(true);
    this.currentSelectedListItem = listItem;
  }
}


function processData(data, filterFunc) {
  let listItems = data.map(d => new ListItem(d, {filter: filterFunc}));
  return flatten(listItems);
}

function flatten(arr) {
  return arr.reduce((acc, listItem) => {
    acc = acc.concat(listItem);
    if (listItem.hasChildren) {
      acc = acc.concat(flatten(listItem.getChildren()));
    }

    return acc;
  }, []);
}

