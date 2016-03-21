import { PageObjectGrid } from './grid.po.js';
import { Constants } from '../constants.js';

xdescribe('aurelia grid pagination', () => {
  let poGrid;

  beforeEach(() => {
    poGrid = new PageObjectGrid();
    browser.loadAndWaitForAureliaPage(Constants.DefaultUrl);
    browser.sleep(Constants.PageLoadingTime);
    poGrid.navigateTo('pagination');
    browser.sleep(Constants.PageLoadingTime);
  });

  it("should load grid paging page and check title", () => {
    expect(poGrid.getCurrentPageTitle())
      .toBe('pagination | Test Grid | Page Title');
  });

  it("should load grid paging, change pages and check active page", () => {

    expect(poGrid.getActivePage())
      .toBe('1');
    for (let i = 2; i < 12; i++) {
      poGrid.clickNextPage();
      expect(poGrid.getActivePage())
        .toBe(("" + i)
          .toString());
      browser.sleep(Constants.VisualDelayTime);
    }

    poGrid.clickPrevPage();
    expect(poGrid.getActivePage())
      .toBe(("10")
        .toString());

    poGrid.clickLastPage();
    expect(poGrid.getActivePage())
      .toBe(("100")
        .toString());

    poGrid.clickFirstPage();
    expect(poGrid.getActivePage())
      .toBe(("1")
        .toString());

    poGrid.clickPage(7);
    expect(poGrid.getActivePage())
      .toBe(("7")
        .toString());
  });

  it('should change page sizes and check grid rows count', () => {
    let sizes = [50, 25, 10];
    for (let i = 0; i < sizes.length; i++) {
      poGrid.changeSelectMenu(("" + sizes[i])
        .toString());
      expect(poGrid.getGridRowsCount())
        .toBe(sizes[i]);
    }

  });

  it('should click add item and check grid for added items', () => {
    let rand = Math.floor(Math.random() * 10) + 1;
    for (let i = 0; i < rand; i++) {
      poGrid.clickAddItem();
    }
    expect(poGrid.getAddedItemsCount())
      .toBe(rand);
  });
});

xdescribe('aurelia grid filtering', () => {
  let poGrid;

  beforeEach(() => {
    poGrid = new PageObjectGrid();
    browser.loadAndWaitForAureliaPage(Constants.DefaultUrl);
    browser.sleep(Constants.PageLoadingTime);
    poGrid.navigateTo('filters');
    browser.sleep(Constants.PageLoadingTime);
  });

  it("should load grid fitlering page and check title", () => {
    expect(poGrid.getCurrentPageTitle())
      .toBe('filters | Test Grid | Page Title');
  });

  it("should click filter toggle and hide filter row", () => {

    expect(poGrid.hasFilterRowElement())
      .toBeTruthy();
    poGrid.toggleFilter();
    expect(poGrid.hasFilterRowElement())
      .toBeFalsy();
    poGrid.toggleFilter();
    expect(poGrid.hasFilterRowElement())
      .toBeTruthy();
  });

  it("should change boolean/input/select filters and check data in the grid rows", () => {
      poGrid.changeNameFilter('alex');

      poGrid.getGridColumnsByFieldName('name')
        .forEach(text => {
          expect(text)
            .toMatch(/alex/);
        });

      poGrid.changeNameFilter();
      poGrid.changeSelectMenu('end with 5');
      poGrid.getGridColumnsByFieldName('type')
        .forEach(text => {
          expect(text)
            .toMatch(/-5$/);
        });

      poGrid.clickActiveFalse();
      expect(poGrid.getGridRowsCount())
        .toBe(0);

    });
});

xdescribe('aurelia grid sorting', () => {
  let poGrid;

  beforeEach(() => {
    poGrid = new PageObjectGrid();
    browser.loadAndWaitForAureliaPage(Constants.DefaultUrl);
    browser.sleep(Constants.PageLoadingTime);
    poGrid.navigateTo('filters');
    browser.sleep(Constants.PageLoadingTime);
  });

  it("should sort columns ascending/descending on clicking column header", () => {
      poGrid.changeNameSortDirection();
      poGrid.changeIdSortDirection();
      poGrid.changeIdSortDirection();

      poGrid.changeNameSortDirection();
      let rows = poGrid.getGridColumnsByFieldName('name');
      rows.forEach((r, i) => {
        if (i > 0) {
          expect(rows[i - 1] <= r)
            .toBeTruthy();
        }
      });

      poGrid.changeNameSortDirection();
      rows = poGrid.getGridColumnsByFieldName('name');
      rows.forEach((r, i) => {
        if (i > 0) {
          expect(rows[i - 1] >= r)
            .toBeTruthy();
        }

      });

      poGrid.changeIdSortDirection();

      let idRows = poGrid.getGridColumnsByFieldName('id');
      idRows.forEach((r, i) => {
        if (i > 0) {
          if (rows[i - 1] == rows[i]) {
            expect(idRows[i - 1] <= r)
              .toBeTruthy();
          }
        }
      });

    });
});

xdescribe('aurelia grid syncing', () => {
  let poGrid;

  beforeEach(() => {
    poGrid = new PageObjectGrid();
    browser.loadAndWaitForAureliaPage(Constants.DefaultUrl);
    browser.sleep(Constants.PageLoadingTime);
    poGrid.navigateTo('sync-two-grids');
    browser.sleep(Constants.PageLoadingTime);
  });

  it("should load grid syncing page and check title", () => {
    expect(poGrid.getCurrentPageTitle())
      .toBe('sync two grids | Test Grid | Page Title');
  });

  it('should change users grid selected row and check related role grid', () => {
    //first splitter
    let firstRoleBefore = poGrid.getSyncedGridColumn(0, 1, 0);
    poGrid.changeSelectedRow(0, 0, 2);
    let firstRoleAfter = poGrid.getSyncedGridColumn(0, 1, 0);
    expect(firstRoleBefore)
      .not.toEqual(firstRoleAfter);

    //second splitter
    let firstPirvillageBefore = poGrid.getSyncedGridColumn(1, 1, 0);
    poGrid.changeSelectedRow(1, 0, 2);
    let firstPirvillageAfter = poGrid.getSyncedGridColumn(1, 1, 0);
    expect(firstPirvillageBefore)
      .not.toEqual(firstPirvillageAfter);

    //third splitter
    firstRoleBefore = poGrid.getSyncedGridColumn(2, 1, 0);
    let firstUserBefore = poGrid.getSyncedGridColumn(2, 2, 0);
    poGrid.changeSelectedRow(2, 0, 2);
    firstRoleAfter = poGrid.getSyncedGridColumn(2, 1, 0);
    let firstUserAfter = poGrid.getSyncedGridColumn(2, 2, 0);
    expect(firstRoleBefore)
      .not.toEqual(firstRoleAfter);
    expect(firstUserBefore)
      .not.toEqual(firstUserAfter);

  });
});
