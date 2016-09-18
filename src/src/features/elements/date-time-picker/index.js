export function configure(aurelia, configCallback) {
  aurelia.globalResources('./timepicker/timepicker');
  aurelia.globalResources('./datepicker/datepicker');
  aurelia.globalResources('./datetimepicker/datetimepicker');
}
