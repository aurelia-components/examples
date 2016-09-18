import {Tokenizers} from './tokenizers';

export class Datum {
  constructor(item, index, opts, queryTokens) {
    this.highlightTag = 'strong';

    this.item = item;
    this.index = index;
    this.queryTokens = queryTokens;

    this.opts = opts;

    this.tokens = this._datumTokenizer(item);
    this.highlightedName = '';

    this._splitOriginalItemNameToParts();

    //queryTokens = this.queryTokens.filter(x => true); // make copy for removing items

    // queryTokensMatches[i] == the index of query token that the i-th data token matches
    this.queryTokensMatches = this.tokens.map(token => {
      let tokenLower = token.value.toLowerCase();
      let matchedQueryTokens = this.queryTokens.filter(queryToken => {
        //let queryTokenLower = queryToken.value.toLowerCase();
        return tokenLower.startsWith(queryToken.value);
      }).sort((a, b) => {
        return a.value.length > b.value.length ? -1 : a.value.length < b.value.length ? 1 : 0;
      });

      let matchedQueryTokenIndex = matchedQueryTokens.length > 0 ? this.queryTokens.indexOf(matchedQueryTokens[0]) : -1;
      if (matchedQueryTokenIndex > -1) {
        let matchedQueryToken = matchedQueryTokens[0];
        // substitute name part with highlighted
        let partForHighlighting = token.value.substring(0, matchedQueryToken.value.length);
        let highlightedPart = '<' + this.highlightTag + '>' + partForHighlighting + '</' + this.highlightTag + '>';
        let nonHighlightedPart = token.value.substring(matchedQueryToken.value.length);
        this.highlightedNameParts[token.position] = highlightedPart + nonHighlightedPart;

        // do we want this??
        // if we have a match, remove token from queryTokens, so we don't match again
        //queryTokens.splice(matchedQueryTokenIndex, 1);
      }

      return matchedQueryTokenIndex;
    });

    //let usedTokens = [];
    //this.queryTokensMatchesUnique = this.queryTokensMatches.map((queryIndex, datumIndex) => {
    //  if (usedTokens.indexOf(queryIndex) > -1) {
    //    return -queryIndex - 2;
    //  }
    //  usedTokens.push(queryIndex);
    //  return queryIndex;
    //});

    this._setHighlightedName();
  }

  static compare(a, b) {
    //let aQtm = a.queryTokensMatchesUnique;
    //let bQtm = b.queryTokensMatchesUnique;
    let aQtm = a.queryTokensMatches;
    let bQtm = b.queryTokensMatches;
    const length = Math.min(aQtm.length, bQtm.length);
    for (let i = 0; i < length; i++) {
      const ai = aQtm[i];
      const bi = bQtm[i];
      if (ai !== bi) {
        if (ai === -1) {
          return 1;
        }

        if (bi === -1) {
          return -1;
        }

        //if(ai > -1 && bi > -1){
        //  return ai > bi ? 1 : -1;
        //}
        //
        //if(ai < -1 && bi < -1){
        //  return  ai < bi ? 1 : -1;
        //}
        //
        //if(ai > -1 && bi < -1){
        //  return -1;
        //}
        //
        //if(ai < -1 && bi > -1){
        //  return 1;
        //}

        return ai > bi ? 1 : -1;
      }
    }

    return 0;
  }

  _splitOriginalItemNameToParts() {
    this.originalName = this.item._escapedName;
    this.highlightedNameParts = {};
    let currentIndex = 0;
    this.tokens.forEach(token => {
      if (currentIndex < token.position) {
        this.highlightedNameParts[currentIndex] = this.originalName.substring(currentIndex, token.position);
      }

      this.highlightedNameParts[token.position] = token.value;
      currentIndex = token.position + token.value.length;
    });
    if (currentIndex < this.originalName.length - 1) {
      this.highlightedNameParts[currentIndex] = this.originalName.substring(currentIndex);
    }
  }

  _setHighlightedName() {
    this.highlightedName = '';
    let keys = Object.keys(this.highlightedNameParts).sort((a, b)=> {
      return a - b;
    });
    keys.forEach(position => {
      this.highlightedName = this.highlightedName + this.highlightedNameParts[position];
    });
  }

  _datumTokenizer(item) {
    // add here if we want matching by more fields
    return /*let nameTokens = */ Tokenizers.nonword(item._escapedName);
  }
}
