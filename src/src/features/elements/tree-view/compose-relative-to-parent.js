import {
  TaskQueue, Container, inject, customAttribute, bindable, noView,
  CompositionEngine, ViewSlot, customElement, View
} from 'aurelia-framework';

import {DOM} from 'aurelia-pal';

/**
* Used to compose a new view / view-model template or bind to an existing instance.
*/
@customElement('compose-relative-to-parent')
@noView
@inject(DOM.Element, Container, CompositionEngine, ViewSlot, TaskQueue)
export class ComposeRelativeToParent {
  /**
  * Model to bind the custom element to.
  *
  * @property model
  * @type {CustomElement}
  */
  @bindable model
  /**
  * View to bind the custom element to.
  *
  * @property view
  * @type {HtmlElement}
  */
  @bindable view
  /**
  * View-model to bind the custom element's template to.
  *
  * @property viewModel
  * @type {Class}
  */
  @bindable viewModel

  /**
  * Creates an instance of Compose.
  * @param element The Compose element.
  * @param container The dependency injection container instance.
  * @param compositionEngine CompositionEngine instance to compose the element.
  * @param viewSlot The slot the view is injected in to.
  * @param viewResources Collection of resources used to compile the the view.
  * @param taskQueue The TaskQueue instance.
  */
  constructor(element, container, compositionEngine, viewSlot, taskQueue) {
    this.element = element;
    this.container = container;
    this.compositionEngine = compositionEngine;
    this.viewSlot = viewSlot;
    this.taskQueue = taskQueue;
    this.currentController = null;
    this.currentViewModel = null;
  }

  /**
  * Invoked when the component has been created.
  *
  * @param owningView The view that this component was created inside of.
  */
  created(owningView) {
    this.owningView = owningView;
  }

  /**
  * Used to set the bindingContext.
  *
  * @param bindingContext The context in which the view model is executed in.
  * @param overrideContext The context in which the view model is executed in.
  */
  bind(bindingContext, overrideContext) {
    this.bindingContext = bindingContext;
    this.overrideContext = overrideContext;
    this.viewResources = overrideContext.parentOverrideContext.bindingContext.viewResources;
    processInstruction(this, createInstruction(this, {
      view: this.view,
      viewModel: this.viewModel,
      model: this.model
    }));
  }

  /**
  * Unbinds the Compose.
  */
  unbind(bindingContext, overrideContext) {
    this.bindingContext = null;
    this.overrideContext = null;
    let returnToCache = true;
    let skipAnimation = true;
    this.viewSlot.removeAll(returnToCache, skipAnimation);
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
