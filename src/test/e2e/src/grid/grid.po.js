export class PageObjectGrid {
	clickNextPage() {
		return element(by.css('a[au-target-id="102"]')).click();
	}

	getActivePage(){
		return element(by.css('.page-item.active')).element(by.tagName('a')).getText();
	}

	changePageSize(size){
		element(by.cssContainingText('option', size)).click();
	}

	getGridRowsCount(){
		return element.all(by.css('tr')).count();
	}

	clickAddItem(){
		return element(by.css('button[au-target-id="193"]')).click();
	}

	getAddedItemsCount(){
		return element.all(by.cssContainingText('td', '-1')).count();
	}
}