export class UtilsHelper {
  _arrayUniqueByField(a, field) {
    let result = a.reduce(function (p, c) {
      if (p.every(x => x[field] !== c[field])) p.push(c);
      return p;
    }, []);

    return result;
  }

  _escapeHtml(text) {
    let map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    let result = text.toString().replace(/[&<>"']/g, m => map[m]);

    return result;
  }

  _getTokensGroupedByValue(tokensArray) {
    let uniqueTokens = this._arrayUniqueByField(tokensArray, 'value');
    return /*let tokensGroupedByValue = */ uniqueTokens.map(uniqueToken => {
      let tokensWithSameValue = tokensArray.filter(token => token.value === uniqueToken.value);
      let indexesOfTokensWithSameValue = tokensWithSameValue.map(token => tokensArray.indexOf(token));
      return {
        indexes: indexesOfTokensWithSameValue,
        value: uniqueToken.value
      };
    });
  }
}
