import {inject, customElement, bindable, bindingMode, BindingEngine, TaskQueue} from 'aurelia-framework';
import {Tokenizers} from './tokenizers';
import {Datum} from './datum';
import {KEYS} from './keys';
import {customElementHelper} from 'utils';

@customElement('select3')
@inject(Element, BindingEngine, TaskQueue)
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
    disableClear: false,
    emptyValue: null, // ??? or undefined???
    selectHoveredOnCloseDropdown: false,
    debounceSearch: 150,
    visibleItemsCount: 11, // better if odd number
    scrollStep: 1,
    scrollInterval: 30,
    scrollTimeout: 300
  };

  constructor(element, bindingEngine, taskQueue) {
    this.element = element;
    this.bindingEngine = bindingEngine;
    this.taskQueue = taskQueue;

    this.parseInt = parseInt;
  }

  bind() {
    this.opts = Object.assign(this.opts, this.options);
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

  searchedItemChanged() {
    if (!this.debounceSearch) {
      this.debounceSearch = customElementHelper.debounce(() => {
        this.search(this.searchedItem);
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
      i._escapedName = this._escapeHtml(i[this.opts.name]);
    });
    this.search(this.searchedItem);
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
      start = end - fullCount;
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
    } else if (hoveredIndex === 0) {
      // first is hovered -> hover last
      this.hoveredDatum = this.filteredData[this.filteredData.length - 1];
    } else {
      // hover previous
      this.hoveredDatum = this.filteredData[hoveredIndex - 1];
    }

    this.scrollToHoveredDatum();
  }

  moveSelectionDown() {
    if (this.filteredData.length === 0) {
      return;
    }

    let hoveredIndex = this.filteredData.indexOf(this.hoveredDatum);
    if (hoveredIndex === -1) {
      // nothing is hovered -> hover first
      this.hoveredDatum = this.filteredData[0];
    } else if (hoveredIndex === this.filteredData.length - 1) {
      // last is hovered -> hover first
      this.hoveredDatum = this.filteredData[0];
    } else {
      // hover next
      this.hoveredDatum = this.filteredData[hoveredIndex + 1];
    }

    this.scrollToHoveredDatum();
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


  // search

  // todo: check if query.startsWith(previousQuery) and match only the already matched elements
  search(query) {
    // todo: check for empty or null or not an array? maybe in items changed and throw error?
    if (this.items === undefined) {
      this.filteredData = [];
      return;
    }

    // get only non-empty tokens
    let queryTokens = this._queryTokenizer(query).filter(qt => qt.value.length > 0);
    // group tokens by value -> to know how many matches of each token we need
    let queryTokensGroupedByValue = this._getTokensGroupedByValue(queryTokens);

    // map every item to Datum object
    // todo: create only once for every item and call method to match current query
    let data = this.items.map((item, index) => new Datum(item, index, this.opts, queryTokens));

    // filter only datums that match query
    let filteredData = data.filter(datum => {
      //get query tokens that match
      let matchingQueryTokens = datum.queryTokensMatches
        .filter(queryTokenIndex => queryTokenIndex > -1)
        .map(queryTokenIndex => queryTokens[queryTokenIndex]);
      // group query tokens (in case we have matched a token more than once)
      let matchingQueryTokensGroupedByValue = this._getTokensGroupedByValue(matchingQueryTokens);
      let isMatchingQuery = queryTokensGroupedByValue.every(queryTokenGroup => {
        // find token that corresponds to current query token
        let matchingQueryTokenGroup = matchingQueryTokensGroupedByValue.find(x => x.value === queryTokenGroup.value);
        // evaluate if we have more matches than needed for current query token
        return matchingQueryTokenGroup && (matchingQueryTokenGroup.indexes.length >= queryTokenGroup.indexes.length);
      });
      return isMatchingQuery;
    });

    // sort datums by matching query
    filteredData.sort(this._sortData.bind(this));

    // hover first datum
    this.hoveredDatum = filteredData.length > 0 ? filteredData[0] : null;

    this.filteredData = filteredData;
  }

  _queryTokenizer(query) {
    return Tokenizers.nonword(query);
  }

  _getTokensGroupedByValue(tokensArray) {
    let uniqueTokens = this._arrayUniqueByField(tokensArray, 'value');
    let tokensGroupedByValue = uniqueTokens.map(uniqueToken => {
      let tokensWithSameValue = tokensArray.filter(token => token.value === uniqueToken.value);
      let indexesOfTokensWithSameValue = tokensWithSameValue.map(token => tokensArray.indexOf(token));
      return {
        indexes: indexesOfTokensWithSameValue,
        value: uniqueToken.value
      };
    });

    return tokensGroupedByValue;
  }

  _sortData(a, b) {
    //firstly compare by query matching
    let result = Datum.compare(a, b);
    if (result !== 0) {
      return result;
    }

    //secondly compare traditional if requested
    if (this.opts.sort) {
      let sortField = this.opts.sortField || this.opts.name;
      if (a.item[sortField] > b.item[sortField]) {
        return 1;
      }
      if (a.item[sortField] < b.item[sortField]) {
        return -1;
      }

      return 0;
    }

    return a.index > b.index ? 1 : a.index < b.index ? -1 : 0;
  }


  // utils

  _arrayUniqueByField(a, field) {
    return a.reduce(function (p, c) {
      if (p.every(x => x[field] !== c[field])) p.push(c);
      return p;
    }, []);
  }

  _escapeHtml(text) {
    let map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };

    return text.toString().replace(/[&<>"']/g, m => map[m]);
  }
}
