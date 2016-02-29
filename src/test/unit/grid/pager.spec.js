import { Container } from 'aurelia-framework';
import { initialize } from 'aurelia-pal-browser';
import { Pager } from "../../../src/features/elements/grid/pager/pager";
import { DataFeeder } from "../mocks/data-feeder";

initialize();

describe('testing pager(no dependent to data store):', () => {
  let container, pager;
  beforeEach(() => {
    container = new Container(),
      pager = container.get(Pager);

    pager.onPageChanged = function(page) {
      this.page = page;
    };
  });

  it('should get visible pages and check next/prev buttons avaiability', done => {

      pager.update(8, 10, 75);

      expect(pager.pageCount)
        .toBe(8);
      expect(pager.pages)
        .toEqual([4, 5, 6, 7, 8]);
      expect(pager.prevDisabled)
        .toBeFalsy();
      expect(pager.nextDisabled)
        .toBeTruthy();

      pager.update(1, 20, 75);

      expect(pager.pageCount)
        .toBe(4);
      expect(pager.pages)
        .toEqual([1, 2, 3, 4]);
      expect(pager.prevDisabled)
        .toBeTruthy();
      expect(pager.nextDisabled)
        .toBeFalsy();

      done();
    });

  it('should change next/prev pages until cap is reached', done => {

    let curPage = 0;
    pager.update(curPage, 20, 600);

    expect(pager.page)
      .not.toBe(curPage);
    pager.prev();
    expect(pager.page)
      .toBe(curPage + 1);
    pager.next();
    expect(pager.page)
      .toBe(curPage + 2);
    pager.next();
    expect(pager.page)
      .toBe(curPage + 3);
    pager.next();
    expect(pager.page)
      .toBe(curPage + 4);
    pager.prev();
    expect(pager.page)
      .toBe(curPage + 3);

    done();
  });

  it('should change nextJump/prevJump pages until cap is reached', done => {

    let curPage = 30;
    pager.update(curPage, 20, 900);
    pager.prevJump();
    expect(pager.page)
      .toBe(curPage - 5);
    pager.nextJump();
    pager.nextJump();
    pager.nextJump();
    pager.nextJump();
    pager.nextJump();
    expect(pager.page)
      .toBe(curPage + 15);
    done();
  });

 it('should change first/last pages', done => {

    pager.update(25, 20, 900);
    pager.first();
    expect(pager.page)
      .toBe(1);
    pager.last();
    expect(pager.page)
      .toBe(45);
    done();
  });
})
