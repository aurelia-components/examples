import { Container } from 'aurelia-framework';
import { initialize } from 'aurelia-pal-browser';
import { LocalStore } from "../../../src/features/elements/grid/store/local-store";
import { DataFeeder } from "../mocks/data-feeder";
import { Grid, Pager, Column } from "../mocks/fake-dependencies";

initialize();

describe('testing local store data :', () => {

  let container, grid, feeder, pager;
  beforeEach(() => {
    container = new Container(),
      feeder = container.get(DataFeeder),
      grid = container.get(Grid);
  });

  it('should change data source on paging and filtering', done => {
    var booleanField = 'isActive',
      dateField = 'assignmentDate',
      dateFilterValue = {
        from: new Date(2016, 3, 15),
        to: new Date(2016, 3, 20)
      },
      inputFilterValue = 'harl',
      inputField = 'name',
      selectFilterValue = 3,
      selectField = 'occupationId';

    grid.data = feeder.generateData(3000, [{
      field: booleanField,
      type: 'boolean'
    }, {
      field: selectField,
      type: 'number'
    }, {
      field: dateField,
      type: 'date'
    }]);

    grid.columnDefinitions = [new Column(inputField, inputFilterValue),
      new Column(booleanField, true), new Column(selectField,
        selectFilterValue), new Column(dateField, dateFilterValue)
    ];

    var s = grid.pageSize * 5,
      n = feeder.getRandom(Math.ceil(grid.data.length / s)) + 1,
      pagerUpdateCalled = false,
      pager = container.get(Pager),
      store = new LocalStore(grid.data, grid);

    n = n == 1 ? n + 1 : n;

    spyOn(pager, 'update');
    store.setPage(n);
    store.setPageSize(s);
    store.setPager(pager);
    store.getData()
      .then(data => {
        expect(data.length >= 0)
          .toBeTruthy();
        expect(data.length <= s)
          .toBeTruthy();
        for (var i = 1; i < data.length; i++) {
          var item = data[i];
          expect(item.name)
            .toMatch(inputFilterValue);
          expect(item.isActive)
            .toBeTruthy();
          expect(item.occupationId)
            .toBe(selectFilterValue);
          expect(item.assignmentDate >= dateFilterValue.from && item.assignmentDate <=
              dateFilterValue.to)
            .toBeTruthy();
        }

        expect(pager.update.calls.any())
          .toBeTruthy();
        expect(store.firstVisibleItem)
          .toBe((n - 1) * Number(s) + 1);
        expect(store.lastVisibleItem)
          .toBe(Math.min((n) * Number(s), grid.data.length));
        done();
      });
  });
 
  it('should show all the data on disabled paging', done => {
    grid.data = feeder.generateData(500);
    grid.pageable = false;
    var s = grid.pageSize * 5,
      n = feeder.getRandom(Math.ceil(grid.data.length / s)) + 1,
      store = new LocalStore(grid.data, grid);

    n = n == 1 ? n + 1 : n;

    store.setPage(n);
    store.setPageSize(s);
    store.getData()
      .then(data => {
        expect(data.length)
          .toBe(grid.data.length);
        done();
      });
  });
});
