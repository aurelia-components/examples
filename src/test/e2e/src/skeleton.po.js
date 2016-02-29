import { Constants } from './constants.js';

export class PageObjectSkeleton {
  constructor() {

  }

  getCurrentPageTitle() {
    return browser.getTitle();
  }

  navigateTo(href) {
    href = this.routePrefix ? this.routePrefix + href : href;
    element(by.css('a[href="' + href + '"]'))
      .click();
    return browser.waitForRouterComplete();
  }

  click(handler, e) {
    if (e) {
      e.element(by.eventName('click', handler))
        .click();
    } else {
      element(by.eventName('click', handler))
        .click();
    }
    browser.sleep(Constants.VisualDelayTime);
  }

  getClickablesByHandler(handler, e) {
    if (e) {
      return e.all(by.eventName('click', handler));
    }

    return element.all(by.eventName('click', handler));
  }

  changeSelectMenu(text) {
    element(by.cssContainingText('option', text))
      .click();
    browser.sleep(Constants.VisualDelayTime * 5);
  }

  getElement(selector, e) {
    if (e) {
      return e.element(by.css(selector));
    }
    return element(by.css(selector));
  }

  getElements(selector, e) {
    if (e) {
      return e.all(by.css(selector));
    }

    return element.all(by.css(selector));
  }

  getElementsCount(selector, e) {
    return this.getElements(selector, e)
      .count();
  }
}
