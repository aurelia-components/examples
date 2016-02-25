import {PageObjectGrid} from './grid.po.js';
import {PageObjectSkeleton} from './../skeleton.po.js';
import {Constants} from './../constants.js';

describe('aurelia grid pagination', function() {
  let poGrid;
  let poSkeleton;

  beforeEach(() => {
    poSkeleton = new PageObjectSkeleton();
    poGrid = new PageObjectGrid();
    browser.loadAndWaitForAureliaPage(Constants.DefaultUrl);
    browser.sleep(Constants.PageLoadingTime);
    poSkeleton.navigateTo('#/test-grid/pagination');
    browser.sleep(Constants.PageLoadingTime);
  });

  it("should load grid paging page and check title", ()=>{
    expect(poSkeleton.getCurrentPageTitle()).toBe('pagination | Test Grid | Page Title');
  });


  it("should load grid paging, change pages and check active page", ()=>{

    expect(poGrid.getActivePage()).toBe('1');
    for(var i = 2; i < 12; i++){
      poGrid.clickNextPage();
      expect(poGrid.getActivePage()).toBe(("" + i).toString());
      browser.sleep(Constants.VisualDelayTime);
    }

    poGrid.clickPrevPage();
    expect(poGrid.getActivePage()).toBe(("10").toString());
    browser.sleep(Constants.VisualDelayTime);

    poGrid.clickLastPage();
    expect(poGrid.getActivePage()).toBe(("100").toString());
    browser.sleep(Constants.VisualDelayTime);

    poGrid.clickFirstPage();
    expect(poGrid.getActivePage()).toBe(("1").toString());
    browser.sleep(Constants.VisualDelayTime);

    poGrid.clickPage(7);
    expect(poGrid.getActivePage()).toBe(("7").toString());
    browser.sleep(Constants.VisualDelayTime);
  });


  it('should change page sizes and check grid rows count', () => {
    var sizes = [50,25,10];
    for(var i = 0; i < sizes.length; i++){
      browser.sleep(Constants.VisualDelayTime);
      poGrid.changeSelectMenu(("" + sizes[i]).toString());
      expect(poGrid.getGridRowsCount()).toBe(sizes[i] + 1);
    }

  });


  it('should click add item and check grid for added items', () => {
    var rand = Math.floor(Math.random() * 10) + 1;
    for(var i = 0; i < rand; i++){
      poGrid.clickAddItem();
      browser.sleep(Constants.VisualDelayTime);
    }
    expect(poGrid.getAddedItemsCount()).toBe(rand);

  });
});

describe('aurelia grid filtering', function() {
  let poGrid;
  let poSkeleton;

  beforeEach(() => {
    poSkeleton = new PageObjectSkeleton();
    poGrid = new PageObjectGrid();
    browser.loadAndWaitForAureliaPage(Constants.DefaultUrl);
    browser.sleep(Constants.PageLoadingTime);
    poSkeleton.navigateTo('#/test-grid/filters');
    browser.sleep(Constants.PageLoadingTime);
  });

  it("should load grid fitlering page and check title", ()=>{
    expect(poSkeleton.getCurrentPageTitle()).toBe('filters | Test Grid | Page Title');
  });

  it("should click fitler toggle and hide filter row", ()=>{

    expect(poGrid.hasFilterRowElement()).toBeTruthy();
    browser.sleep(Constants.VisualDelayTime);
    poGrid.toggleFilter();
    browser.sleep(Constants.VisualDelayTime);
    expect(poGrid.hasFilterRowElement()).toBeFalsy();
    browser.sleep(Constants.VisualDelayTime);
    poGrid.toggleFilter();
    expect(poGrid.hasFilterRowElement()).toBeTruthy();
  });

  it("should change input/select filters and check data in the grid rows", ()=>{
    poGrid.changeNameFilter('alex');
    browser.sleep(Constants.VisualDelayTime * 5);

    poGrid.getFilteredRows().each( e => {
     var text = e.element(by.css('td[field="name"]')).getText();
     expect(text).toMatch(/alex/);
    });

    poGrid.changeNameFilter();
    poGrid.changeSelectMenu('end with 5');
    browser.sleep(Constants.VisualDelayTime * 5);
    poGrid.getFilteredRows().each( e => {
      var text = e.element(by.css('td[field="type"]')).getText();
      expect(text).toMatch(/-5$/);
    });
  });
});

