export function configure(aurelia, configCallback) {
  aurelia.globalResources('./blob-to-url-value-converter');
  aurelia.globalResources('./console-debug');
  aurelia.globalResources('./date-format');
  aurelia.globalResources('./date-time-format');
  aurelia.globalResources('./file-list-to-array-value-converter');
  aurelia.globalResources('./short-date-format');
  aurelia.globalResources('./short-date-time-format');
  aurelia.globalResources('./sum-format');
}
