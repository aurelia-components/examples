export function configure(aurelia, configCallback) {
  aurelia.globalResources('./date-search/date-search');
  aurelia.globalResources('./text-search/text-search');
  aurelia.globalResources('./list-search/list-search');
  aurelia.globalResources('./checkbox-search/checkbox-search');
}

export {searchOperator} from './search-operator';
