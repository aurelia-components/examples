export function configure(config, callback) {
  config.globalResources('./select2/select2');
  config.globalResources('./select2-ajax/select2-ajax');

  if (typeof callback === 'function') {
    //TODO
  }
}
