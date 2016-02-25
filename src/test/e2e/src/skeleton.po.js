export class PageObjectSkeleton {
	constructor() {

	}

	getCurrentPageTitle() {
		return browser.getTitle();
	}

	navigateTo(href) {
		href = this.routePrefix ? this.routePrefix + href : href;
		element(by.css('a[href="' + href + '"]')).click();
		return browser.waitForRouterComplete();
	}

	click(handler){
		return element(by.eventName('click', handler)).click();
	}

	getClickablesByHandler(handler){
		return element.all(by.eventName('click', handler))
	}

	changeSelectMenu(text){
		element(by.cssContainingText('option', text)).click();
	}

	getElement(selector){
		return element(by.css(selector));
	}

	getElements(selector){
		return element.all(by.css(selector));
	}

	getElementsCount(selector){
		return this.getElements(selector).count();
	}

}
