export class PageObjectGrid {
	clickNextPage() {
		element.all(by.css('a[aria-label="Next"]')).get(1).click();
	}

	clickPrevPage(){
		element(by.css('a[aria-label="Previous"]')).click();
	}

	clickFirstPage(){
		element(by.css('a[aria-label="First"]')).click();
	}

	clickLastPage(){
		element(by.css('a[aria-label="Last"]')).click();
	}

	clickPage(page){
		element(by.cssContainingText('a', page)).click();
	}

	getActivePage(){
		return element(by.css('.page-item.active')).element(by.tagName('a')).getText();
	}

	changeSelectMenu(size){
		element(by.cssContainingText('option', size)).click();
		
	}

	getGridRowsCount(){
		return element.all(by.css('tr')).count();
	}

	clickAddItem(){
		element.all(by.css('button')).first().click();
	}

	getAddedItemsCount(){
		return element.all(by.cssContainingText('td', '-1')).count();
	}

	toggleFilter(){
		element.all(by.css('button')).first().click();
	}

	hasFilterRowElement(){
		return element(by.css('.grid-column-filters')).isPresent();
	}

	changeNameFilter(value){
		let filter = element.all(by.css('.grid-column-filters input')).get(1);
		filter.clear();

		if(value){
			filter.sendKeys(value);
		}
	}	

	getFilteredRows(){
		return element.all(by.css('tbody tr'));
	}

}