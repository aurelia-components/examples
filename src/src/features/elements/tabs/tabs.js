import {inject, customElement, bindable, useView, children} from 'aurelia-framework';
import {customElementHelper} from 'utils';

@customElement('tabs')
@inject(Element)
export class Tabs  {
  @children('tab') tabs = [];

  activeTab = undefined;

  constructor(element) {
    this.element = element;
    const scrollAttr = element.attributes.getNamedItem('scroll');
    if (scrollAttr !== null) {
      this.topShiftInPixels = scrollAttr.nodeValue;
      element.style.display = 'block';
      element.style.height = `calc(100% - ${this.topShiftInPixels}px)`;
    }
  }

  attached() {
    if (this.topShiftInPixels !== undefined) {
      this.tabs.forEach(tab => {
        tab.setInnerScroll();
      });
    }
  }

  bind() {
    this.tabs.forEach(tab => {
      if (tab.active) {
        this.activeTab = tab;
      }

      tab.hide();
    });

    this.activeTab.show();
  }

  onTabClick(tab) {
    customElementHelper.dispatchEvent(this.element, 'change', {
      tab: tab,
      test: 'baba'
    });

    this.activeTab.hide();

    tab.show();
    this.activeTab = tab;
  }

}
