import { PageObjectSkeleton } from './../skeleton.po.js'
import { Constants } from './../constants.js';

export class PageObjectGrid extends PageObjectSkeleton {

	constructor(){
		super();
		this.routePrefix = '#/test-grid/';
	}

	//common
	getGridRowsCount(){
		return this.getElementsCount('tbody tr');
	}


	getGridColumnsByFieldName(fieldName){
		return Array.from(this.getElements('tbody tr').map(e => {
			return this.getElements('td[field="' + fieldName+ '"]', e).first().getText();
		}));
	}

	//addition
	clickAddItem(){
		this.click('addItem');
	}
	getAddedItemsCount(){
		return element.all(by.cssContainingText('td', '-1')).count();
	}

	//paging 
	clickNextPage() {
		this.click('next');
	}

	clickPrevPage(){
		this.click('prev');
	}

	clickFirstPage(){
		this.click('first');

	}

	clickLastPage(){
		this.click('last');
	}

	clickPage(page){
		element(by.cssContainingText('a', page)).click();
	}

	getActivePage(){
		return this.getElement('.page-item.active a').getText();
	}

	//filtering
	toggleFilter(){
		this.click('toggleFilter');
	}

	hasFilterRowElement(){
		return this.getElement('.grid-column-filters').isPresent();
	}

	changeNameFilter(value){
		let filter = this.getElements('.grid-column-filters input').get(1);
		filter.clear();

		if(value){
			filter.sendKeys(value);
		}
		browser.sleep(Constants.VisualDelayTime * 5);
	}	

	clickActiveFalse(){
		this.getClickablesByHandler('buttonClicked').get(1).click();
		browser.sleep(Constants.VisualDelayTime * 5);
	}

	//sorting
	changeIdSortDirection(){
		this.getClickablesByHandler('$column.changeDirectionSort').get(0).click();
		browser.sleep(Constants.VisualDelayTime * 5);
	}

	changeNameSortDirection(){
		this.getClickablesByHandler('$column.changeDirectionSort').get(3).click();
		browser.sleep(Constants.VisualDelayTime * 5);
	}

	//sync
	changeSelectedRow(splitterIndex, gridIndex, rowIndex){
		let splitter = this.getElements('split-vertical').get(splitterIndex),
		grid = this.getElements('grid', splitter).get(gridIndex),
		row = this.getClickablesByHandler('rowClicked($item)', grid).get(rowIndex);

		row.click();
		browser.sleep(Constants.VisualDelayTime * 5);
	}

	getSyncedGridColumn(splitterIndex, gridIndex, rowIndex){
		let splitter = this.getElements('split-vertical').get(splitterIndex),
		grid = this.getElements('grid', splitter).get(gridIndex);
		
		return this.getElements('tbody tr', grid).map(e => {
			return this.getElement('td', e).getText();
		}).then(result => {
			return result;
		});

	}
}