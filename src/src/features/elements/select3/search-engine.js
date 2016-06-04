import {UtilsHelper} from './utils-helper';
import {inject} from 'aurelia-framework';
import {Tokenizers} from './tokenizers';
import {Datum} from './datum';

@inject(UtilsHelper)
export class SearchEngine {
  constructor(utilsHelper) {
    console.log('SE constr');
    this.utilsHelper = utilsHelper;
  }

  search(query, items, options) {
    console.log('SE search');
    // todo: check for empty or null or not an array? maybe in items changed and throw error?
    let filteredData = [];
    if (items === undefined) {
      // this.filteredData = [];
      return;
    }

    // get only non-empty tokens TODO: why it is static ?
    let searchResults = Tokenizers.nonword(query)
                            .map(sr => {
                              sr.value = sr.value.toLowerCase();
                              if(sr.value.length > 0) return sr;
                            });

    // group tokens by value -> to know how many matches of each token we need
    let queryTokensGroupedByValue = this.utilsHelper._getTokensGroupedByValue(searchResults);

    // map every item to Datum object
    // todo: create only once for every item and call method to match current query
    let data = items.map((item, index) => new Datum(item, index, options, searchResults));

    // filter only datums that match query
    filteredData = data.filter(datum => {
      //get query tokens that match
      let matchingQueryTokens = datum.queryTokensMatches
        .filter(queryTokenIndex => queryTokenIndex > -1)
        .map(queryTokenIndex => searchResults[queryTokenIndex]);
      // group query tokens (in case we have matched a token more than once)
      let matchingQueryTokensGroupedByValue = this.utilsHelper._getTokensGroupedByValue(matchingQueryTokens);
      return /*let isMatchingQuery = */queryTokensGroupedByValue.every(queryTokenGroup => {
        // find token that corresponds to current query token
        let matchingQueryTokenGroup = matchingQueryTokensGroupedByValue.find(x => x.value === queryTokenGroup.value);
        // evaluate if we have more matches than needed for current query token
        return matchingQueryTokenGroup && (matchingQueryTokenGroup.indexes.length >= queryTokenGroup.indexes.length);
      });
    });
    // filteredData.sort(this._sortData.bind(this));
    this._sortData(filteredData, options);

    // hover first datum: TODO: to be gone in UIController
    this.hoveredDatum = filteredData.length > 0 ? filteredData[0] : null;

    return filteredData;
  }

  _sortData(filteredData, options) {
    console.log('SE _sortData');
    filteredData.sort((a, b) => {
      //firstly compare by query matching
      let result = Datum.compare(a, b);
      if (result !== 0) {
        return result;
      }

      //secondly compare traditional if requested
      if (options.sort) {
        let sortField = options.sortField || options.name;
        if (a.item[sortField] > b.item[sortField]) {
          return 1;
        }
        if (a.item[sortField] < b.item[sortField]) {
          return -1;
        }

        return 0;
      }

      return a.index > b.index ? 1 : a.index < b.index ? -1 : 0;
    });
  }
}
