
export function configure(aurelia, configCallback) {
  aurelia.globalResources('./input/input-form');
  aurelia.globalResources('./textarea/textarea-form');
  aurelia.globalResources('./checkbox/checkbox-form');
  aurelia.globalResources('./select3/select3-form');
  aurelia.globalResources('./password-input/password-input');
}
