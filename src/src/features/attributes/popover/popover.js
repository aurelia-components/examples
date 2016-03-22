import {
  TaskQueue, Container, inject, customAttribute, bindable,
  CompositionEngine, ViewSlot, ViewResources, customElement, View
} from 'aurelia-framework';

import {DOM} from 'aurelia-pal';

//@noView()
@customAttribute('popover')
@inject(DOM.Element, Container, CompositionEngine, ViewSlot, ViewResources, TaskQueue, DOM)
export class Popover {
  @bindable title;
  @bindable content;
  @bindable placement = 'bottom';
  @bindable trigger = 'hover';
  @bindable disabled = false;
  @bindable view;
  @bindable width;

  constructor(element, container, compositionEngine, viewSlot, viewResources, taskQueue, dom) {
    this.element = element;
    this.container = container;
    this.compositionEngine = compositionEngine;
    this.viewSlot = viewSlot;
    this.viewResources = viewResources;
    this.taskQueue = taskQueue;
    this.currentController = null;
    this.currentViewModel = null;
    this.dom = dom;

    this.isPopoverInitialized = false;

    this._trigger = this.trigger;
  }

  created(owningView, myView) {
    this.owningView = owningView;
  }

  bind(bindingContext, overrideContext) {
    this.checkContentAndView();
    this.checkPlacement();
    this.checkTrigger();

    this.popoverNode = this.dom.createElement('div');
    this.popoverNode.style.display = 'none';

    this.viewSlot = new ViewSlot(this.popoverNode, true, this);
    this.dom.appendNode(this.popoverNode);
    this.$element = $(this.element);

    this.bindingContext = bindingContext;
    this.overrideContext = overrideContext;
    processInstruction(this, createInstruction(this, {
      view: this.view,
      viewModel: this.viewModel,
      model: this.model
    }));
  }

  attached() {
    if (this.disabled) {
      return;
    }

    this.checkPlacement();
    this.checkTrigger();
    this._reinit();
  }

  detached() {
    this._dispose();
  }

  unbind(bindingContext, overrideContext) {
    this.bindingContext = null;
    this.overrideContext = null;
    let returnToCache = true;
    let skipAnimation = true;
    this.viewSlot.removeAll(returnToCache, skipAnimation);
  }

  contentChanged(newValue, oldValue) {
    this.checkContentAndView();
    this._reinit();
  }

  viewChanged() {
    this.checkContentAndView();
    this._reinit();
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
    if (this.disabled) {
      return;
    }

    if (this.isPopoverInitialized === true) {
      this._dispose();
    }

    this._init();
    this.isPopoverInitialized = true;
  }

  _init() {
    if (this.trigger === 'insideClick') {
      this.$element.on('click', () => {
        this.$element.popover('toggle');
      });

      this.popoverNode.onclick = (() => {
        this.$element.popover('hide');
      });
    } else {
      this.$element.off('click');
      this.popoverNode.onclick = null;
    }

    this.$element.popover(this._getOptions());
    //this.popoverNode.style.display = 'block';
    if (this.width) {
      this.popoverNode.style.width = this.width + 'px';
    }

    //this.$element.popover('show');
    //this.$element.popover('hide');
  }

  _dispose() {
    this.popoverNode.style.display = 'none';
    this.$element.popover('dispose');
    this.isPopoverInitialized = false;
  }

  _getOptions() {
    return {
      content: this.popoverNode,
      title: this.title || '',
      placement: this.placement,
      trigger: this._trigger,
      container: 'body',
      html: true,
      template: '<div class="popover" role="tooltip">' +
      '<div class="popover-arrow"></div>' +
      (this.title ? '<h3 class="popover-title"></h3>' : '') +
      ((!this.content && !this.view) ? '' : '<div class="popover-content"></div>') +
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

  checkContentAndView() {
    if (this.content && this.view) {
      throw new Error(`Popover cannot have content and view at the same time! Content: ${this.content}; View: ${this.view}`);
      //} else if (!this.content && !this.view) {
      //  throw new Error(`Popover should have content or view! Content: ${this.content}; View: ${this.view}`);
    }
  }
}


function createInstruction(composer, instruction) {
  return Object.assign(instruction, {
    bindingContext: composer.bindingContext,
    overrideContext: composer.overrideContext,
    owningView: composer.owningView,
    container: composer.container,
    viewSlot: composer.viewSlot,
    viewResources: composer.viewResources,
    currentController: composer.currentController
  });
}

function processInstruction(composer, instruction) {
  composer.currentInstruction = null;
  composer.compositionEngine.compose(instruction).then(controller => {
    composer.currentController = controller;
    composer.currentViewModel = controller ? controller.viewModel : null;
  });
}
