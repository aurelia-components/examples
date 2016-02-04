import {inject} from 'aurelia-framework';
import {Logger} from 'service';

@inject(Logger)
export class FixedHeight {
  constructor(logger) {
    this.logger = logger;
    this.gridHeight = 400;
    window.x = this;

    this.data = this._generateTestData();
  }

  _generateTestData() {

    // Return a promise that resolves to the data
    var data = [];
    var names = ["charles", "john", "oliver", "fred", "dean", "chris", "pete", "steve", "lee", "rob", "alex", "rose", "mike", "dan", "james", "rebecca", "heather", "kate", "liam"];

    for (var i = 0; i < 1000; i++) {
      var n = names[Math.floor(Math.random() * names.length)];
      data.push({
        id: i,
        name: n,
        isActive: i % 2 === 0
      });
    }

    return data;
  }

  itemClicked(item) {
    console.info(item);
    this.logger.info(`You clicked on: ${item.name}`);
  }

  addItem() {
    this.data.unshift({
      id: -1,
      name: 'xxxxx'
    });
  }

  changeItem() {
    this.data = [{
      id: -1,
      name: 'xxxxx'
    }];
  }

  itemSelected(item) {
    console.info(item);
    this.logger.info(`You selected item: ${item.name}`);
  }
}
