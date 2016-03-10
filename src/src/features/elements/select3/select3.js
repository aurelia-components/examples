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
    debounce: 150
  };

  constructor(element, bindingEngine, taskQueue) {
    this.element = element;
    this.bindingEngine = bindingEngine;
    this.taskQueue = taskQueue;
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

  valueChanged() {
    if (this.value === undefined || this.value === this.opts.emptyValue) {
      this.selectedItemName = null;
      return;
    }

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

  itemsChanged() {
    this._subscribeToItemsCollectionChanges();
    this.reconstructItems();
    this.valueChanged();
  }

  reconstructItems() {
    this.items.forEach(i => {
      i._escapedName = this._escapeHtml(i[this.opts.name]);
    });
    this.search(this.searchedItem);

    // todo: figure out smarter way for opening dropdown initially
    if (this.opts.hasFocus && this.items.length > 0) {
      this.openDropdown();
    }
  }

  _subscribeToItemsCollectionChanges() {
    if (this.itemsCollectionSubscription !== undefined) {
      this.itemsCollectionSubscription.dispose();
    }

    this.itemsCollectionSubscription = this.bindingEngine
      .collectionObserver(this.items)
      .subscribe(items => {
        this.reconstructItems();
      });
  }

  filteredDataChanged() {
    this.refillFilteredDataShort();
    //this.valueChanged();
  }

  refillFilteredDataShort() {
    const halfCount = 5;
    const fullCount = halfCount * 2 + 1;
    let hoveredDatumIndex = this.filteredData.indexOf(this.hoveredDatum);
    let isInFirstHalfCount = hoveredDatumIndex < halfCount;
    let isInLastHalfCount = hoveredDatumIndex > this.filteredData.length - 1 - halfCount;
    let start, end;

    //if (isInFirstHalfCount && isInLastHalfCount) {
    //  // take all
    //  start = 0;
    //  end = this.filteredData.length;
    //} else if (isInFirstHalfCount && !isInLastHalfCount) {
    //  // take first fullCount
    //  start = 0;
    //  end = fullCount;
    //} else if (!isInFirstHalfCount && isInLastHalfCount) {
    //  // take last fullCount
    //  end = this.filteredData.length;
    //  start = end - fullCount;
    //} else {// !isInFirstHalfCount && !isInLastHalfCount
    //  //take halfCount before and halfCount after
    //  start = hoveredDatumIndex - halfCount;
    //  end = hoveredDatumIndex + halfCount + 1;
    //}

    start = isInFirstHalfCount ? 0 : isInLastHalfCount ? Math.max(this.filteredData.length - fullCount, 0) : hoveredDatumIndex - halfCount;
    end = start + fullCount;

    this.filteredDataShort = this.filteredData.slice(start, end);
  }

  searchedItemChanged() {
    if (!this.debounce) {
      this.debounce = customElementHelper.debounce(() => {
        this.search(this.searchedItem);
      }, this.opts.debounce); 
    }

    this.debounce();
  }

  clearValue() {
    if (!this.opts.disableClear) {
      this.value = this.opts.emptyValue;
    }
  }

  openDropdown() {
    this.isDropdownOpen = true;

    // focus on search box when opened
    this.taskQueue.queueTask(()=> {
      this.reorientDropdownIfNeeded();

      let searchInput = this.element.getElementsByClassName('select3-search-box')[0];
      searchInput.focus();
      searchInput.select();
    });
  }

  closeDropdown() {
    this.isDropdownOpen = false;

    if (this.opts.selectHoveredOnCloseDropdown === true) {
      this.selectHoveredItem();
    }

    if (this.value !== this.opts.emptyValue) {
      this.taskQueue.queueTask(() => {
        let valueInput = this.element.getElementsByClassName('select3-value-box')[0];
        valueInput.focus();
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

  onValueInputFocus(e) {
    if (this.value === this.opts.emptyValue) {
      this.openDropdown();
    } else {
      if (this.isDropdownOpen) {
        this.closeDropdown();
      }
    }
  }

  selectItem(datum) {
    if (datum === null || datum === undefined) {
      return;
    }

    this.value = this.opts.modelValueBind ? datum.item : datum.item[this.opts.id];
    if (this.isDropdownOpen === true) {
      this.closeDropdown();
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

    this.refillFilteredDataShort();
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

    this.refillFilteredDataShort();
  }

  scrollDropdown(e) {
    let delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

    let hoveredDatumIndex = this.filteredData.indexOf(this.hoveredDatum);

    let newHoveredIndex = hoveredDatumIndex - delta;

    newHoveredIndex = Math.max(0, newHoveredIndex);
    newHoveredIndex = Math.min(newHoveredIndex, this.filteredData.length - 1);

    this.hoveredDatum = this.filteredData[newHoveredIndex];
    this.refillFilteredDataShort();
  }

  selectHoveredItem() {
    this.selectItem(this.hoveredDatum);
  }

  setHover(datum) {
    this.hoveredDatum = datum;
  }

  reorientDropdownIfNeeded() {
    // todo: use query selector, maybe keep this element in this?
    let dropdown = this.element.getElementsByClassName('select3-dropdown')[0];
    let currentBottomStyle = dropdown.style.bottom;
    let rect = dropdown.getBoundingClientRect();
    if (currentBottomStyle == 'auto' || !currentBottomStyle) {
      let viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      let enoughRoomBelow = viewportHeight >= dropdown.clientHeight + rect.top;
      if (!enoughRoomBelow) {
        dropdown.style.bottom = '25px';
      }
    } else {
      let enoughRoomAbove = rect.bottom - dropdown.clientHeight >= 0;
      if (!enoughRoomAbove) {
        dropdown.style.bottom = 'auto';
      }
    }
  }

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
    let data = this.items.map(item => new Datum(item, this.opts, queryTokens));

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

    this.filteredData = filteredData;
    // hover first datum
    this.hoveredDatum = this.filteredData.length > 0 ? this.filteredData[0] : null;
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

    return 0;
  }

  _arrayUniqueByField(a, field) {
    return a.reduce(function(p, c) {
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

    return text.replace(/[&<>"']/g, m => map[m]);
  }
}
