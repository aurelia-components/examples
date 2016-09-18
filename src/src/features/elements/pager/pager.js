import {bindable, customElement} from 'aurelia-framework';

@customElement('pager')
export class Pager {

  // Called when the selected page changes
  @bindable onPageChanged;

  // Max num pages to show
  @bindable numToShow = 10;

  // Disable/enable
  nextDisabled = false;
  prevDisabled = false;

  // Pager button options
  @bindable showFirstLastButtons = true;
  @bindable showJumpButtons = true;

  // Total number of items in the dataset
  page = 1;
  pageCount = 0;

  pages = [];

  @bindable pageSizes = [10, 20, 50];
  @bindable pageSize = 10;
  @bindable showPagingSummary = true;

  changePage(page) {
    const oldPage = this.page;
    this.page = this.cap(page);
    this.update(this.page, this.pageSize, this.totalItems);
    //if (oldPage !== this.page) {
    if (this.page > 0) {
      this.onPageChanged({
        page: this.page,
        pageSize: Number(this.pageSize)
      });
    }
    //}
  }

  @bindable itemsCount = 1;

  pageSizeChanged(newValue, oldValue) {
    this.changePage(this.page);
  }

  itemsCountChanged(newValue, oldValue) {
    if (newValue === undefined || newValue === 0) {
      this.update(this.page, this.pageSize, 0);
    } else {
      this.update(this.page, this.pageSize, newValue);
    }
  }

  activate() {
    debugger;
    this.createPages();
  }

  // Called when the data source changes
  update(page, pagesize, totalItems) {
    this.page = page;
    this.totalItems = totalItems;
    this.pageSize = pagesize;

    this.createPages();

    this.firstVisibleItem = (this.page - 1) * this.pageSize + 1;
    this.lastVisibleItem = Math.min(this.page * this.pageSize, this.totalItems);
  }

  cap(page) {
    if (page < 1) {
      return 1;
    } else if (page > this.pageCount) {
      return this.pageCount;
    } else {
      return page;
    }
  }

  createPages() {
    // Calc the max page number
    this.pageCount = Math.ceil(this.totalItems / this.pageSize);
    this.page = this.cap(this.page);

    // Cap the number of pages to render if the count is less than number to show at once
    let numToRender = this.pageCount < this.numToShow ? this.pageCount : this.numToShow;

    // The current page should try to appear in the middle, so get the median 
    // of the number of pages to show at once - this will be our adjustment factor
    let indicatorPosition = Math.ceil(numToRender / 2);

    // Subtract the pos from the current page to get the first page no
    let firstPageNumber = this.page - indicatorPosition + 1;

    // If the first page is less than 1, make it 1
    if (firstPageNumber < 1) {
      firstPageNumber = 1;
    }

    // Add the number of pages to render
    // remember to subtract 1 as this represents the first page number
    let lastPageNumber = firstPageNumber + numToRender - 1;

    // If the last page is greater than the page count
    // add the difference to the first/last page
    if (lastPageNumber > this.pageCount) {
      let dif = this.pageCount - lastPageNumber;

      firstPageNumber += dif;
      lastPageNumber += dif;
    }

    let pages = [];

    for (var i = firstPageNumber; i <= lastPageNumber; i++) {
      pages.push(i);
    }

    this.pages = pages;

    this.updateButtons();
  }

  updateButtons() {
    this.nextDisabled = this.page === this.pageCount;
    this.prevDisabled = this.page === 1;
  }

  next() {
    this.changePage(this.page + 1);
  }

  nextJump() {
    this.changePage(this.page + this.numToShow);
  }

  prev() {
    this.changePage(this.page - 1);
  }

  prevJump() {
    this.changePage(this.page - this.numToShow);
  }

  first() {
    this.changePage(1);
  }

  last() {
    this.changePage(this.pageCount);
  }
}
