
// An example configuration file.
exports.config = {
  directConnect: true,

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'chrome'
  },

  //seleniumAddress: 'http://0.0.0.0:4444',
  specs: ['test/e2e/dist/**/*.js'],

  plugins: [{
    path: 'aurelia.protractor.js'
  }],

  onPrepare: function() {
    var SpecReporter = require('jasmine-spec-reporter');
    jasmine.getEnv().addReporter(new SpecReporter({

      displayStacktrace: 'none',    // display stacktrace for each failed assertion, values: (all|specs|summary|none) 
      displayFailuresSummary: true, // display summary of all failures after execution 
      displayPendingSummary: true,  // display summary of all pending specs after execution 
      displaySuccessfulSpec: true,  // display each successful spec 
      displayFailedSpec: true,      // display each failed spec 
      displayPendingSpec: false,    // display each pending spec 
      displaySpecDuration: false,   // display each spec duration 
      displaySuiteNumber: false,    // display each suite number (hierarchical) 
      colors: {
        success: 'green',
        failure: 'red',
        pending: 'yellow'
      },
      prefixes: {
        success: '! ',
        failure: 'X ',
        pending: '* '
      },
      customProcessors: []

    }));
  },

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 60000,
    print: function() {}
  }
};

