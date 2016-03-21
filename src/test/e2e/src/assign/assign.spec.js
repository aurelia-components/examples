import { PageObjectAssign  } from './assign.po.js';
import { Constants } from '../constants.js';

describe('aurelia assign tests', ()=> {
  let poAssign;

  beforeEach(() => {
    poAssign = new PageObjectAssign();
    browser.loadAndWaitForAureliaPage(Constants.DefaultUrl);
    browser.sleep(Constants.PageLoadingTime);
    poAssign.navigateTo();
    browser.sleep(Constants.PageLoadingTime);
  });

  it('should select items,  switch them from left to right vice versa and check panels content', () => {
    poAssign.clickMoveAllRight();
    expect(poAssign.getLeftItems()).toBe(1);
  });

});
