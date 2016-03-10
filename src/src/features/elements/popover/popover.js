import {inject, customElement, bindable} from 'aurelia-framework';

@customElement('popover')
@inject(Element)
export class Popover {
  @bindable title;
  @bindable placement = 'bottom';
  @bindable trigger = 'hover';
  @bindable ancestorLevels = 1;

  constructor(element) {
    this.element = element;
    this.isParentInitialized = false;
    this.isPopoverInitialized = false;

    this._trigger = this.trigger;
  }

  _getAncestor() {
    let ancestor = this.element.parentElement;

    for (let i = 1; i < this.ancestorLevels; i++) {
      ancestor = ancestor.parentElement;
    }

    return ancestor;
  }

  attached() {
    let ancestor = this._getAncestor();
    this.$parentElement = $(ancestor);
    this.isParentInitialized = true;

    this.checkPlacement();
    this._reinit();
  }

  detached() {
    this._dispose();
  }

  titleChanged(newValue, oldValue) {
    this._reinit();
  }

  placementChanged(newValue, oldValue) {
    this.checkPlacement();
    this._reinit();
  }

  triggerChanged(newValue, oldValue) {
    this.checkTrigger();

    this._trigger = this.trigger === 'insideClick' ? 'manual' : this.trigger;

    this._reinit();
  }

  _reinit() {
    if (this.isParentInitialized) {
      if (this.isPopoverInitialized) {
        this._dispose();
      }

      this._init();
      this.isPopoverInitialized = true;
    }
  }

  _init() {
    if (this.trigger === 'insideClick') {
      this.$parentElement.on('click', () => {
        this.$parentElement.popover('toggle');
      });

      this.element.onclick = (() => {
        this.$parentElement.popover('hide');
      });
    } else {
      this.$parentElement.off('click');
      this.element.onclick = null;
    }

    this.$parentElement.popover(this._getOptions());

    this.$parentElement.popover('show');
    this.$parentElement.popover('hide');
  }

  _dispose() {
    this.$parentElement.popover('dispose');
  }

  _getOptions() {
    return {
      content: this.element,
      title: this.title || '',
      placement: this.placement,
      trigger: this._trigger,
      container: 'body',
      html: true,
      template: '<div class="popover" role="tooltip">' +
      '<div class="popover-arrow"></div>' +
      (this.title ? '<h3 class="popover-title"></h3>' : '') +
      (this.element.children.length > 0 ? '<div class="popover-content"></div>' : '') +
      '</div>'
    };
  }

  checkPlacement() {
    switch (this.placement) {
    case 'top':
    case 'bottom':
    case 'left':
    case 'right':
      //case 'auto':
      break;
    default:
      throw new Error('Invalid value for popover placement: ' + this.placement);
    }
  }

  checkTrigger() {
    switch (this.trigger) {
    case 'click':
    case 'hover':
    case 'focus':
    case 'insideClick':
      break;
    default:
      throw new Error('Invalid value for popover trigger: ' + this.trigger);
    }
  }
}
