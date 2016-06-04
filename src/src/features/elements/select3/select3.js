import {inject, customElement, bindable, bindingMode, BindingEngine, TaskQueue} from 'aurelia-framework';
import {Tokenizers} from './tokenizers';
import {Datum} from './datum';
import {KEYS} from './keys';
import {customElementHelper} from 'utils';
import {UtilsHelper} from './utils-helper';

@customElement('select3')
@inject(Element, BindingEngine, TaskQueue, UtilsHelper)
export class Select3 {
  @bindable items = [];
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = null;
  @bindable disabled = false;
  @bindable options = {};

  @bindable searchedItem = '';
  @bindable filteredData = [];
  isDropdownOpen = false;
  selectedItemName = '';
  hoveredDatum = null;
  filteredDataShort = [];
  filteredDataShortStartIndex = 0;
  filteredDataShortEndIndex = 0;
  draggerTop = 0;
  draggerHeight = 0;
  isScrollbarDragging = false;
  previousMouseEvent = undefined;
  scrollUpIntervalId = null;
  scrollDownIntervalId = null;

  opts = {
    id: 'id',
    name: 'name',
    modelValueBind: false,
    caption: 'Изберете',
    noResultsMessage: 'Няма намерени резултати',
    sort: false,
    sortField: '',
    //sortDirection: 'asc', // todo: implement
    disableClear: false,
    emptyValue: null, // ??? or undefined???
    selectHoveredOnCloseDropdown: false,
    debounceSearch: 150,
    visibleItemsCount: 11, // better if odd number
    scrollStep: 1,
    scrollInterval: 30,
    scrollTimeout: 300
  };

  constructor(element, bindingEngine, taskQueue, utilsHelper) {
    this.element = element;
    this.bindingEngine = bindingEngine;
    this.taskQueue = taskQueue;
    this.utilsHelper = utilsHelper;

    this.parseInt = parseInt;
  }

  bind() {
    this.opts = Object.assign(this.opts, this.options);
    this.filteredDataShortStartIndex = 0;
    this.filteredDataShortEndIndex = this.opts.visibleItemsCount - 1;
    this.itemsChanged();
  }

  unbind() {
    if (this.itemsCollectionSubscription !== undefined) {
      this.itemsCollectionSubscription.dispose();
    }
  }

  attached() {
    this.documentMousemoveHandler = this.onScrollbarDragging.bind(this);
    this.documentMouseupHandler = this.stopScrollbarDragging.bind(this);

    document.addEventListener('mousemove', this.documentMousemoveHandler);
    document.addEventListener('mouseup', this.documentMouseupHandler);

    this.scrollbar = this.element.querySelector('.select3-scrollbar');
    this.draggerContainer = this.element.querySelector('.select3-scrollbar-dragger-container');
    this.dragger = this.element.querySelector('.select3-scrollbar-dragger');
    this.searchInput = this.element.querySelector('.select3-search-box');
    this.valueInput = this.element.querySelector('.select3-value-box');
    this.dropdown = this.element.querySelector('.select3-dropdown');

    if (this.opts.hasFocus && this.items.length > 0) {
      this.openDropdown();
    }
  }

  detached() {
    document.removeEventListener('mousemove', this.documentMousemoveHandler);
    document.removeEventListener('mouseup', this.documentMouseupHandler);
  }

  valueChanged(newValue, oldValue) {
    if (this.value === undefined || this.value === this.opts.emptyValue) {
      this.selectedItemName = null;
    } else {
      let valueId = this.opts.modelValueBind ? this.value[this.opts.id] : this.value;

      //todo: optimize check for "are all ids numbers?"
      if (isNaN(valueId) === false && this.filteredData.every(x => Number.isInteger(x.item[this.opts.id]))) {
        valueId = parseInt(valueId, 10);
      }

      let selectedDatum = this.filteredData.find(datum => {
        return datum.item[this.opts.id] === valueId;
      });

      if (selectedDatum) {
        this.selectedItemName = selectedDatum.item[this.opts.name];
      } else {
        this.selectedItemName = null;
        this.value = this.opts.emptyValue;
      }
    }

    this.taskQueue.queueMicroTask(()=> {
      customElementHelper.dispatchEvent(this.element, 'change', {
        value: newValue,
        oldValue: oldValue
      });
    });
  }

  itemsChanged() {
    this._subscribeToItemsCollectionChanges();
    this._reconstructItems();
    this.valueChanged();
  }

  searchedItemChanged(newValue, oldValue) {
    if (!this.debounceSearch) {
      this.debounceSearch = customElementHelper.debounce(() => {
        // this.search(this.searchedItem);
        this.filteredData = this.searchEngine.search(this.searchedItem, this.items, this.opts);
      }, this.opts.debounceSearch);
    }

    this.debounceSearch();
  }

  filteredDataChanged() {
    this.scrollToHoveredDatum();
  }

  _subscribeToItemsCollectionChanges() {
    if (this.itemsCollectionSubscription !== undefined) {
      this.itemsCollectionSubscription.dispose();
    }

    this.itemsCollectionSubscription = this.bindingEngine
      .collectionObserver(this.items)
      .subscribe(items => {
        this._reconstructItems();
      });
  }

  _reconstructItems() {
    this.items.forEach(i => {
      i._escapedName = this.utilsHelper._escapeHtml(i[this.opts.name]);
    });
    // this.search(this.searchedItem);
    this.filteredData = this.searchEngine.search(this.searchedItem, this.items, this.opts);
  }


  // scrolling

  scrollDropdown(e) {
    let delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

    if (delta < 0) {
      this.scrollDown();
    } else {
      this.scrollUp();
    }
  }

  scrollUp(count) {
    if (count === undefined) {
      count = this.opts.scrollStep;
    }

    // can scroll at least once
    if (this.filteredDataShortStartIndex > 0) {
      // can scroll desired times
      if (this.filteredDataShortStartIndex - count >= 0) {
        this.filteredDataShortStartIndex -= count;
        this.filteredDataShortEndIndex -= count;
        this._refillFilteredDataShort();
      } else { // scroll as many times as possible
        count = this.filteredDataShortStartIndex;
        if (count > 0) {
          this.scrollUp(count);
        } else {
          this.stopScrollUp();
        }
      }
    } else {
      this.stopScrollUp();
    }
  }

  scrollDown(count) {
    if (count === undefined) {
      count = this.opts.scrollStep;
    }

    // can scroll at least once
    if (this.filteredDataShortEndIndex < this.filteredData.length - 1) {
      // can scroll desired times
      if (this.filteredDataShortEndIndex + count < this.filteredData.length) {
        this.filteredDataShortStartIndex += count;
        this.filteredDataShortEndIndex += count;
        this._refillFilteredDataShort();
      } else { // scroll as many times as possible
        count = this.filteredData.length - 1 - this.filteredDataShortEndIndex;
        if (count > 0) {
          this.scrollDown(count);
        } else {
          this.stopScrollDown();
        }
      }
    } else {
      this.stopScrollDown();
    }
  }

  scrollToHoveredDatum() {
    const halfCount = Math.floor(this.opts.visibleItemsCount / 2);
    const fullCount = this.opts.visibleItemsCount;
    let hoveredDatumIndex = this.filteredData.indexOf(this.hoveredDatum);
    let isInFirstHalfCount = hoveredDatumIndex < halfCount;
    let isInLastHalfCount = hoveredDatumIndex > this.filteredData.length - 1 - halfCount;

    let start, end;
    if (this.filteredData.length <= this.opts.visibleItemsCount) {
      // take all
      start = 0;
      end = this.filteredData.length - 1;
    } else if (isInFirstHalfCount && !isInLastHalfCount) {
      // take first fullCount
      start = 0;
      end = fullCount - 1;
    } else if (!isInFirstHalfCount && isInLastHalfCount) {
      // take last fullCount
      end = this.filteredData.length - 1;
      start = end - (fullCount - 1);
    } else {// !isInFirstHalfCount && !isInLastHalfCount
      //take halfCount before and halfCount after
      start = hoveredDatumIndex - halfCount;
      end = hoveredDatumIndex + halfCount;
    }

    this.filteredDataShortStartIndex = start;
    this.filteredDataShortEndIndex = end;

    this._refillFilteredDataShort();
  }

  _refillFilteredDataShort() {
    this.filteredDataShort = this.filteredData.slice(this.filteredDataShortStartIndex, this.filteredDataShortEndIndex + 1);

    this.taskQueue.queueTask(() => {
      this._calculateDraggerPosition();
    });
  }

  _calculateDraggerPosition() {
    if (this.filteredDataShort.length === this.filteredData.length) {
      this.scrollbar.style.display = 'none';
    } else {
      this.scrollbar.style.display = '';
      const minDraggerHeight = 15;
      let availableHeight = this.draggerContainer.offsetHeight;
      let draggerHeight = availableHeight * (this.opts.visibleItemsCount / this.filteredData.length);
      let draggerTop = availableHeight * (this.filteredDataShortStartIndex / this.filteredData.length);

      const isDraggerHeightInsufficient = draggerHeight < minDraggerHeight;
      if (isDraggerHeightInsufficient) {
        draggerHeight = minDraggerHeight;

        const isDraggerOnTop = draggerTop - minDraggerHeight / 2 < 0;
        const isDraggerOnBottom = draggerTop + minDraggerHeight / 2 > availableHeight;

        if (isDraggerOnTop) {
          draggerTop = 0;
        } else if (isDraggerOnBottom) {
          draggerTop = availableHeight - minDraggerHeight;
        } else {
          draggerTop -= minDraggerHeight / 2;
        }
      }

      this.draggerHeight = draggerHeight;
      this.draggerTop = draggerTop;
    }
  }

  _calculateVisibleItemsPosition() {
    let availableHeight = this.draggerContainer.offsetHeight;

    let itemsByPixel = (this.filteredData.length - this.opts.visibleItemsCount) / (availableHeight - this.draggerHeight);
    let newStartIndex = Math.round(itemsByPixel * this.draggerTop);

    let diff = newStartIndex - this.filteredDataShortStartIndex;
    let newEndIndex = this.filteredDataShortEndIndex + diff;

    if (newStartIndex < 0) {
      newEndIndex = newEndIndex + (0 - newStartIndex);
      newStartIndex = 0;
    }

    if (newEndIndex > this.filteredData.length - 1) {
      newStartIndex = newStartIndex + (this.filteredData.length - 1 - newEndIndex);
      newEndIndex = this.filteredData.length - 1;
    }

    this.filteredDataShortStartIndex = newStartIndex;
    this.filteredDataShortEndIndex = newEndIndex;
    this.filteredDataShort = this.filteredData.slice(this.filteredDataShortStartIndex, this.filteredDataShortEndIndex + 1);
  }

  startScrollbarDragging() {
    this.isScrollbarDragging = true;
  }

  stopScrollbarDragging() {
    this.isScrollbarDragging = false;
    this.previousMouseEvent = undefined;
  }

  onScrollbarDragging(event) {
    if (this.isScrollbarDragging) {
      const movementY = event.movementY || (this.previousMouseEvent !== undefined ? event.screenY - this.previousMouseEvent.screenY : 0);

      let newDraggerTop = this.draggerTop + movementY;

      const availableHeight = this.draggerContainer.offsetHeight;
      const minDraggerTop = 0;
      const maxDraggerTop = availableHeight - this.draggerHeight;

      newDraggerTop = Math.min(maxDraggerTop, Math.max(minDraggerTop, newDraggerTop));

      this.draggerTop = newDraggerTop;
      this._calculateVisibleItemsPosition();

      this.previousMouseEvent = event;
    }
  }

  onDraggerContainerClick(event) {
    if (event.target === this.dragger) {
      return;
    }

    const availableHeight = this.draggerContainer.offsetHeight;
    var draggerPosition = this.dragger.getBoundingClientRect();
    let diff = event.clientY - (draggerPosition.top + (draggerPosition.height / 2));
    const minDraggerTop = 0;
    const maxDraggerTop = availableHeight - this.draggerHeight;
    let newDraggerTop = this.draggerTop + diff;
    newDraggerTop = Math.min(maxDraggerTop, Math.max(minDraggerTop, newDraggerTop));
    this.draggerTop = newDraggerTop;
    this._calculateVisibleItemsPosition();
  }

  startScrollUp() {
    this.stopScrollDown();
    this.stopScrollUp();
    if (this.filteredDataShortStartIndex > 0) {
      this.scrollUp();

      this.scrollUpIntervalId = window.setTimeout(() => {
        this.stopScrollUp();
        this.scrollUpIntervalId = window.setInterval(() => {
          this.scrollUp();
        }, this.opts.scrollInterval);
      }, this.opts.scrollTimeout);
    }
  }

  stopScrollUp() {
    this.scrollUpIntervalId = window.clearTimeout(this.scrollUpIntervalId);
    this.scrollUpIntervalId = window.clearInterval(this.scrollUpIntervalId);
  }

  startScrollDown() {
    this.stopScrollUp();
    this.stopScrollDown();
    if (this.filteredDataShortStartIndex < this.filteredData.length - 1) {
      this.scrollDown();

      this.scrollDownIntervalId = window.setTimeout(() => {
        this.stopScrollDown();
        this.scrollDownIntervalId = window.setInterval(() => {
          this.scrollDown();
        }, this.opts.scrollInterval);
      }, this.opts.scrollTimeout);
    }
  }

  stopScrollDown() {
    this.scrollDownIntervalId = window.clearTimeout(this.scrollDownIntervalId);
    this.scrollDownIntervalId = window.clearInterval(this.scrollDownIntervalId);
  }


  // hovering

  moveSelectionUp() {
    if (this.filteredData.length === 0) {
      return;
    }

    let hoveredIndex = this.filteredData.indexOf(this.hoveredDatum);
    if (hoveredIndex === -1) {
      // nothing is hovered -> hover last
      this.hoveredDatum = this.filteredData[this.filteredData.length - 1];
      this.scrollToHoveredDatum();
    } else if (hoveredIndex === 0) {
      // first is hovered -> hover last
      this.hoveredDatum = this.filteredData[this.filteredData.length - 1];
      this.scrollToHoveredDatum();
    } else {
      // hover previous
      this.hoveredDatum = this.filteredData[hoveredIndex - 1];
      if (hoveredIndex - 1 < this.filteredDataShortStartIndex) {
        this.scrollUp(1);
      }
    }
  }

  moveSelectionDown() {
    if (this.filteredData.length === 0) {
      return;
    }

    let hoveredIndex = this.filteredData.indexOf(this.hoveredDatum);
    if (hoveredIndex === -1) {
      // nothing is hovered -> hover first
      this.hoveredDatum = this.filteredData[0];
      this.scrollToHoveredDatum();
    } else if (hoveredIndex === this.filteredData.length - 1) {
      // last is hovered -> hover first
      this.hoveredDatum = this.filteredData[0];
      this.scrollToHoveredDatum();
    } else {
      // hover next
      this.hoveredDatum = this.filteredData[hoveredIndex + 1];
      if (hoveredIndex + 1 > this.filteredDataShortEndIndex) {
        this.scrollDown(1);
      }
    }
  }

  setHover(datum) {
    this.hoveredDatum = datum;
  }


  // selecting

  selectItem(datum) {
    if (datum === null || datum === undefined) {
      return;
    }

    this.value = this.opts.modelValueBind ? datum.item : datum.item[this.opts.id];
    if (this.isDropdownOpen === true) {
      this.closeDropdown();
    }
  }

  selectHoveredItem() {
    this.selectItem(this.hoveredDatum);
  }

  clearValue() {
    if (!this.opts.disableClear) {
      this.value = this.opts.emptyValue;
    }
  }


  // control dropdown

  openDropdown() {
    this.isDropdownOpen = true;

    this.taskQueue.queueTask(()=> {
      this._reorientDropdownIfNeeded();
      this._calculateDraggerPosition();
      this.searchInput.focus();
      this.searchInput.select();
    });
  }

  closeDropdown(focusOnValue = true) {
    this.isDropdownOpen = false;

    if (this.opts.selectHoveredOnCloseDropdown === true) {
      this.selectHoveredItem();
    }

    if (focusOnValue && this.value !== this.opts.emptyValue) {
      this.taskQueue.queueTask(() => {
        this.valueInput.focus();
      });
    }
  }

  toggleDropdown() {
    if (!this.disabled) {
      if (this.isDropdownOpen) {
        this.closeDropdown();
      } else {
        this.openDropdown();
      }
    }
  }

  _reorientDropdownIfNeeded() {
    let currentBottomStyle = this.dropdown.style.bottom;
    let rect = this.dropdown.getBoundingClientRect();
    if (currentBottomStyle == 'auto' || !currentBottomStyle) {
      let viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      let enoughRoomBelow = viewportHeight >= this.dropdown.clientHeight + rect.top;
      if (!enoughRoomBelow) {
        this.dropdown.style.bottom = '25px';
      }
    } else {
      let enoughRoomAbove = rect.bottom - this.dropdown.clientHeight >= 0;
      if (!enoughRoomAbove) {
        this.dropdown.style.bottom = 'auto';
      }
    }
  }

  onValueInputFocus() {
    if (this.value === this.opts.emptyValue) {
      this.openDropdown();
    } else {
      if (this.isDropdownOpen) {
        this.closeDropdown();
      }
    }
  }

  onValueInputKeyPressed(event) {
    event = window.event ? window.event : event;
    let keyCode = event.keyCode ? event.keyCode : event.which;
    switch (keyCode) {
    case KEYS.ENTER:
      this.openDropdown();
      break;
    default:
      // bubble up
      return true;
    }
  }

  onSearchInputKeyPressed(event) {
    event = window.event ? window.event : event;
    let keyCode = event.keyCode ? event.keyCode : event.which;
    switch (keyCode) {
    case KEYS.UP:
      this.moveSelectionUp();
      break;
    case KEYS.DOWN:
      this.moveSelectionDown();
      break;
    case KEYS.ENTER:
      this.selectHoveredItem();
      break;
    case KEYS.ESC:
      this.closeDropdown();
      break;
    default:
      // bubble up
      return true;
    }
  }

  _queryTokenizer(query) {
    return Tokenizers.nonword(query);
  }
}
