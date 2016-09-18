import {inject, customElement, bindable, computedFrom, bindingMode, BindingEngine} from 'aurelia-framework';
import {customElementHelper} from 'utils';

@customElement('assign')
@inject(Element, BindingEngine)
export class Assign {
  @bindable({defaultBindingMode: bindingMode.twoWay}) leftItems = [];
  @bindable({defaultBindingMode: bindingMode.twoWay}) rightItems = [];
  @bindable leftHeading;
  @bindable rightHeading;
  @bindable selectedItem; // for syncing assign with outside world
  @bindable _selectedItem; // for syncing outside world with assign (via events)

  constructor(element, bindingEngine) {
    this.element = element;
    this.bindingEngine = bindingEngine;

    this.moveLeftDisabled = true;
    this.moveRightDisabled = true;

    this._selectedItem = null;
  }

  unbind() {
    this._unsubscribe(this.leftItemsCollectionSubscription);
    this._unsubscribe(this.rightItemsCollectionSubscription);
  }

  recalculateMoveLeftRightDisabled() {
    this.moveRightDisabled = this.leftItems.indexOf(this._selectedItem) === -1;
    this.moveLeftDisabled = this.rightItems.indexOf(this._selectedItem) === -1;
  }

  selectedItemChanged(newValue, oldValue) {
    if (newValue === oldValue) {
      return;
    }

    if (newValue && newValue.id) {
      this.select(this.selectedItem);
    } else {
      this.deselect(this._selectedItem, true);
    }
  }

  _selectedItemChanged() {
    this.recalculateMoveLeftRightDisabled();
  }

  leftItemsChanged() {
    if (!(this.leftItems instanceof Array)) {
      this.leftItems = [];
    }
    this._subscribeToLeftItemsCollectionChanges();
    this.recalculateMoveLeftRightDisabled();
  }

  rightItemsChanged() {
    if (!(this.rightItems instanceof Array)) {
      this.rightItems = [];
    }
    this._subscribeToRightItemsCollectionChanges();
    this.recalculateMoveLeftRightDisabled();
  }

  select(item, noEventNeeded) {
    this._selectedItem = item;

    if (noEventNeeded !== true) {
      customElementHelper.dispatchEvent(this.element, 'select-assign-item', {
        item: item
      });
    }
  }

  deselect(item, noEventNeeded) {
    this._selectedItem = null;

    if (noEventNeeded !== true) {
      customElementHelper.dispatchEvent(this.element, 'deselect-assign-item', {
        item: item
      });
    }
  }

  moveLeft() {
    let fromCollection = this.rightItems;
    let toCollection = this.leftItems;

    let item = this._remove(fromCollection, this._selectedItem);
    this._add(toCollection, item);

    customElementHelper.dispatchEvent(this.element, 'move-left-click', {
      item: this._selectedItem
    });

    this._selectedItem = undefined;
  }

  moveRight() {
    let fromCollection = this.leftItems;
    let toCollection = this.rightItems;

    let item = this._remove(fromCollection, this._selectedItem);
    this._add(toCollection, item);

    customElementHelper.dispatchEvent(this.element, 'move-right-click', {
      item: this._selectedItem
    });

    this._selectedItem = undefined;
  }

  moveAllLeft() {
    let allItems = this.leftItems.concat(this.rightItems);


    this._selectedItem = undefined;

    this.leftItems = allItems;
    this.rightItems = [];

    customElementHelper.dispatchEvent(this.element, 'move-all-left-click', {});
  }

  moveAllRight() {
    let allItems = this.leftItems.concat(this.rightItems);

    this._selectedItem = undefined;

    this.rightItems = allItems;
    this.leftItems = [];

    customElementHelper.dispatchEvent(this.element, 'move-all-right-click', {});
  }

  _add(toContainer, item) {
    toContainer.push(item);
  }

  _remove(fromContainer, item) {
    let index = fromContainer.findIndex(i => {
      return i === item;
    });

    let removedItem;
    if (index > -1) {
      removedItem = fromContainer.splice(index, 1);
    }

    return removedItem[0];
  }

  _subscribeToLeftItemsCollectionChanges() {
    this._unsubscribe(this.leftItemsCollectionSubscription);

    this.leftItemsCollectionSubscription = this.bindingEngine
      .collectionObserver(this.leftItems)
      .subscribe(items => {
        this.recalculateMoveLeftRightDisabled();
      });
  }

  _subscribeToRightItemsCollectionChanges() {
    this._unsubscribe(this.rightItemsCollectionSubscription);

    this.rightItemsCollectionSubscription = this.bindingEngine
      .collectionObserver(this.rightItems)
      .subscribe(items => {
        this.recalculateMoveLeftRightDisabled();
      });
  }

  _unsubscribe(subscription) {
    if (subscription !== undefined) {
      subscription.dispose();
    }
  }
}
