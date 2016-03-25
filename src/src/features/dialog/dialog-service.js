// todo: get Origin from aurelia-framework and jspm uninstall aurelia-metadata
import {Origin} from 'aurelia-metadata';
import {Container, CompositionEngine, inject} from 'aurelia-framework';
import {DialogController} from './dialog-controller';
import {DialogRenderer} from './dialog-renderer';
import {invokeLifecycle} from './lifecycle';
import {DialogOptions} from './dialog-options';

@inject(Container, CompositionEngine, DialogRenderer)
export class DialogService {
  constructor(container, compositionEngine, renderer) {
    this.container = container;
    this.compositionEngine = compositionEngine;
    this.renderer = renderer;
  }

  _getViewModel(instruction) {
    if (typeof instruction.viewModel === 'function') {
      instruction.viewModel = Origin.get(instruction.viewModel).moduleId;
    }

    if (typeof instruction.viewModel === 'string') {
      return this.compositionEngine.ensureViewModel(instruction);
    }

    return Promise.resolve(instruction);
  }

  openDialog(settings) {
    const defaultSettings = {
      lock: true
    };

    let options = Object.assign({}, defaultSettings, settings);
    options.isModal = false; // explicitly hard-coded

    return this._open(options);
  }

  openModalDialog(settings) {
    const defaultSettings = {
      lock: true
    };

    let options = Object.assign({}, defaultSettings, settings);
    options.isModal = true; // explicitly hard-coded

    return this._open(options);
  }

  openConfirmDeleteDialog(opts) {
    opts = opts || {};

    const defaultOptions = {
      title: 'Внимание!',
      msg: '',
      icon: 'fa-trash-o',
      okBtnClass: 'btn-danger',
      okBtnText: 'Изтрий',
      cancelBtnText: 'Отказ',
      showCancelButton: true
    };

    let options = Object.assign({}, defaultOptions, opts);

    return this.openConfirmDialog(options);
  }

  openConfirmDialog(opts) {
    opts = opts || {};

    if (!opts.msg) {
      throw new Error('Argument Exception. Message is not defined.');
    }

    // options for DialogOptions
    const defaultOptions = {
      title: 'Внимание!',
      msg: '',
      icon: '',
      okBtnClass: 'btn-secondary',
      okBtnText: 'Oк',
      cancelBtnText: 'Отказ',
      showCancelButton: true
    };

    let options =  Object.assign({}, defaultOptions, opts);

    // settings for DialogRenderer
    const defaultSettings = {
      viewModel: DialogOptions,
      model: options
    };

    let settings = Object.assign({}, opts, defaultSettings);

    return this.openModalDialog(settings).then(result =>
      new Promise((resolve, reject) => {
        if (!result.wasCancelled) {
          resolve(result.output || true);
        } else {
          resolve(result.output || false);
        }
      })
    );
  }


  hasOpenDialogs() {
    return document.body.classList.contains('ai-dialog-open');
  }

  _open(settings) {
    let _settings = Object.assign({}, this.renderer.defaultSettings, settings);

    return new Promise((resolve, reject) => {
      let childContainer = this.container.createChild();
      let dialogController = new DialogController(this.renderer, _settings, resolve, reject);
      let instruction = {
        viewModel: _settings.viewModel,
        container: this.container,
        childContainer: childContainer,
        model: _settings.model
      };

      childContainer.registerInstance(DialogController, dialogController);

      return this._getViewModel(instruction).then(returnedInstruction => {
        dialogController.viewModel = returnedInstruction.viewModel;

        return invokeLifecycle(returnedInstruction.viewModel, 'canActivate', _settings.model).then(canActivate => {
          if (canActivate) {
            return this.compositionEngine.createController(returnedInstruction).then(controller => {
              dialogController.controller = controller;
              dialogController.view = controller.view;
              controller.automate();

              return this.renderer.createDialogHost(dialogController).then(() => {
                return this.renderer.showDialog(dialogController);
              });
            });
          }
        });
      });
    });
  }
}
