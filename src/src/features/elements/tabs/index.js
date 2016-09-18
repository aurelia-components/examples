export function configure(config, callback) {
  config.globalResources('./tabs');
  config.globalResources('./tab');

  if (typeof callback === 'function') {
    //TODO
  }
}
