export class Tokenizers {
  static whitespace(str) {
    str = str.toString();
    let regex = /\S+/g;
    let result = Tokenizers.matchRegex(str, regex);

    return result;
  }

  static nonword(str) {
    str = str.toString();
    // todo: fix for all letters
    let regex = /[A-Za-z0-9_А-Яа-я]+/g;
    let result = Tokenizers.matchRegex(str, regex);

    return result;
  }

  static matchRegex(str, regex) {
    let match;
    let matches = [];
    while ((match = regex.exec(str)) != null) {
      matches.push({
        value: match[0],
        position: match.index
      });
    }

    return matches;
  }

  // getObjTokenizer(tokenizer) {
  //  return function setKey(keys) {
  //    keys = _.isArray(keys) ? keys : [].slice.call(arguments, 0);
  //    return function tokenize(o) {
  //      var tokens = [];
  //      _.each(keys, function(k) {
  //        tokens = tokens.concat(tokenizer(_.toStr(o[k])));
  //      });
  //      return tokens;
  //    };
  //  };
  //}
}
