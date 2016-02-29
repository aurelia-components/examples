export class DataFeeder {
  generateData(count, columns) {
    var data = [];
    var names = ["charles", "john", "oliver", "fred", "dean", "chris", "pete",
      "steve", "lee", "rob", "alex", "rose", "mike", "dan", "james",
      "rebecca", "heather", "kate", "liam", "charlie"
    ];

    for (var i = 0; i < count; i++) {
      var n = names[this.getRandom(names.length)];
      data.push({
        id: i,
        name: n
      });
      if (columns && columns.length) {
        for (var j = 0; j < columns.length; j++) {

          if (!columns[j].field) {
            throw new Error('Column should have field name');
          }

          switch (columns[j].type) {
            case 'string':
              data[i][columns[j].field] = this._generateValue(columns[j],
                this.getRandomString(5));
              break;
            case 'boolean':
              data[i][columns[j].field] = this._generateValue(columns[j], (i %
                2 == 0));
              break;
            case 'number':
              data[i][columns[j].field] = this._generateValue(columns[j],
                this.getRandom(5));
              break;
            case 'date':
              data[i][columns[j].field] = this._generateValue(columns[j],
                this.getRandomDate());
              break;
            default:
              throw new Error('Invalid column type');
          }
        }
      }
    }
    return data;
  }

  getRandom(len) {
    return Math.floor(Math.random() * len);
  }

  getRandomString(len) {
    return Math.random()
      .toString(36)
      .substring(2, len);
  }

  getRandomDate() {
    return new Date(2016, 3, this.getRandom(29));
  }

  _generateValue(col, random) {
    return col.values && col.values.length ? col.values[this.getRandom(col.values
      .length)] : random;
  }
}
