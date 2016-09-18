export function configure(config, callback) {
  config.globalResources('./split-horizontal');
  config.globalResources('./split-vertical');

  if (typeof callback === 'function') {
    //TODO
  }
}
