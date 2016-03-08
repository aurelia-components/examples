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
    settings.isModal = false;
    return this._open(settings);
  }

  openModalDialog(settings) {
    settings.isModal = true;
    settings.lock = true;
    return this._open(settings);
  }

  openConfirmDeleteDialog(opts) {
    return this.openConfirmDialog({
      title: opts.title || 'Внимание!',
      msg: opts.msg,
      icon: 'fa-trash-o',
      okBtnClass: 'btn-danger',
      okBtnText: opts.okBtnText || 'Изтрий',
      cancelBtnText: opts.cancelBtnText || 'Отказ',
      showCancelButton: opts.showCancelButton || true
    });
  }

  openConfirmDialog(opts) {
    opts = opts || {};

    if (!opts.msg) {
      throw new Error('Argument Exception. Message is not defined.');
    }

    let options = {
      title: opts.title || 'Внимание!',
      msg: opts.msg,
      icon: opts.icon || '',
      okBtnClass: opts.okBtnClass || 'btn-secondary',
      okBtnText: opts.okBtnText || 'Oк',
      cancelBtnText: opts.cancelBtnText || 'Отказ',
      showCancelButton: opts.showCancelButton || true
    };

    let resultPromise = this.openModalDialog({viewModel: DialogOptions, model: options}).then(result =>
        new Promise(function(resolve, reject) {
          if (!result.wasCancelled) {
            resolve(result.output || true);
          } else {
            resolve(result.output || false);
          }
        })
    );

    return resultPromise;
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
