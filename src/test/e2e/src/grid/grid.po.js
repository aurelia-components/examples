import { PageObjectSkeleton} from './../skeleton.po.js'

export class PageObjectGrid extends PageObjectSkeleton{
	constructor(){
		super();
		this.routePrefix = '#/test-grid/';
	}

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

	clickActiveFalse(){
		this.getClickablesByHandler('buttonClicked').get(1).click();
	}

	getActivePage(){
		return this.getElement('.page-item.active').element(by.tagName('a')).getText();
	}


	getGridRowsCount(){
		return this.getElementsCount('tr');
	}

	clickAddItem(){
		this.click('addItem');
	}

	getAddedItemsCount(){
		return element.all(by.cssContainingText('td', '-1')).count();
	}

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
	}	

	getFilteredRows(fieldName){
		return this.getElements('tbody tr').filter( e => {
			return e.element(by.css('td[field="' + fieldName+ '"]'));
		});
	}

	getFilteredRowsCount(){
		return this.getElementsCount('tbody tr');
	}

}