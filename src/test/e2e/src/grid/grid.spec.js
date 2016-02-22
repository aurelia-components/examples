import {PageObjectGrid} from './grid.po.js';
import {PageObjectSkeleton} from './../skeleton.po.js';

describe('aurelia components app', function() {
  let poGrid;
  let poSkeleton;

  beforeEach(() => {
    poSkeleton = new PageObjectSkeleton();
    poGrid = new PageObjectGrid();

    browser.loadAndWaitForAureliaPage('http://localhost:9000');
    
  });

  it("should load grid paging, change pages and check active page", ()=>{
    poSkeleton.navigateTo('#/test-grid/pagination');
    expect(poSkeleton.getCurrentPageTitle()).toBe('pagination | Test Grid | Page Title');
    expect(poGrid.getActivePage()).toBe('1');
    for(var i = 2; i < 22; i++){
      poGrid.clickNextPage();
      browser.sleep(200);
      expect(poGrid.getActivePage()).toBe(("" + i).toString());
    }
  });


  it('should change page sizes and check grid rows count', () => {
    poSkeleton.navigateTo('#/test-grid/pagination');
    expect(poSkeleton.getCurrentPageTitle()).toBe('pagination | Test Grid | Page Title');
    var sizes = [50,25,10];
    for(var i = 0; i < sizes.length; i++){
      browser.sleep(500);
      poGrid.changePageSize(("" + sizes[i]).toString());
      expect(poGrid.getGridRowsCount()).toBe(sizes[i] + 1);
    }
    
  });


  it('should click add item and check grid for added items', () => {
    poSkeleton.navigateTo('#/test-grid/pagination');
    expect(poSkeleton.getCurrentPageTitle()).toBe('pagination | Test Grid | Page Title');
    var rand = Math.floor(Math.random() * 10) + 1;
    console.log(rand);
    for(var i = 0; i < rand; i++){
      poGrid.clickAddItem();
      browser.sleep(500);
    }
    expect(poGrid.getAddedItemsCount()).toBe(rand);
    
  });
});
