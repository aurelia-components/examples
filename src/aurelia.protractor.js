/* Aurelia Protractor Plugin */
/* eslint-disable no-var, no-console */
function addValueBindLocator() {
  by.addLocator('propBind', function(prop, bindingModel, optParentElement) {
    var using = optParentElement || document;
    var matches = using.querySelectorAll('*[' + prop  + '\\.bind="' + bindingModel + '"]');
    var result;

    if (matches.length === 0) {
      result = null;
    } else if (matches.length === 1) {
      result = matches[0];
    } else {
      result = matches;
    }

    return result;
  });
}

function addEventNameLocator() {
  by.addLocator('eventName', function(eventName, eventHandlerName, optParentElement) {
    var using = optParentElement || document;
    var matches = using.querySelectorAll('*['+ eventName + '\\.delegate="' + eventHandlerName + '"]');

      if (matches.length === 0) {
        matches = using.querySelectorAll('*['+ eventName + '\\.call="' + eventHandlerName + '"]');
      }
      if (matches.length === 0) {
        matches = using.querySelectorAll('*['+ eventName + '\\.trigger="' + eventHandlerName + '"]');
      }

      var result;
      console.log(matches.length);
      if (matches.length === 0) {
        result = null;
      } else if (matches.length === 1) {
        result = matches[0];
      } else {
        result = matches;
      }

      return result;
    });
}

function loadAndWaitForAureliaPage(pageUrl) {
  browser.get(pageUrl);
  return browser.executeAsyncScript(
    'var cb = arguments[arguments.length - 1];' +
    'document.addEventListener("aurelia-composed", function (e) {' +
      '  cb("Aurelia App composed")' +
      '}, false);'
  ).then(function(result) {
    //console.log(result);
    return result;
  });
}

function waitForRouterComplete() {
  return browser.executeAsyncScript(
    'var cb = arguments[arguments.length - 1];' +
    'document.querySelector("[aurelia-app]")' +
    '.aurelia.subscribeOnce("router:navigation:complete", function() {' +
      '  cb(true)' +
      '});'
  ).then(function(result) {
    //console.log("Router navigation completed");    
    return result;
  });
}

/* Plugin hooks */
exports.setup = function(config) {
  // Ignore the default Angular synchronization helpers
  browser.ignoreSynchronization = true;

  // add the aurelia specific valueBind locator
  addValueBindLocator();

  // add the aurelia specific event locator
  addEventNameLocator();

  // attach a new way to browser.get a page and wait for Aurelia to complete loading
  browser.loadAndWaitForAureliaPage = loadAndWaitForAureliaPage;

  // wait for router navigations to complete
  browser.waitForRouterComplete = waitForRouterComplete;
};

exports.teardown = function(config) {};
exports.postResults = function(config) {};
