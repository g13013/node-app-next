var Jasmine = require('jasmine');
var jasmine = new Jasmine();

var Reporter = require('jasmine-spec-reporter');

var reporterConfig = {
  displayStacktrace: 'specs',    // display stacktrace for each failed assertion, values: (all|specs|summary|none)
  displayFailuresSummary: true, // display summary of all failures after execution
  displayPendingSummary: true,  // display summary of all pending specs after execution
  displaySuccessfulSpec: true,  // display each successful spec
  displayFailedSpec: true,      // display each failed spec
  displayPendingSpec: true,    // display each pending spec
  displaySpecDuration: true,   // display each spec duration
  displaySuiteNumber: false    // display each suite number (hierarchical)
}
jasmine.addReporter(new Reporter(reporterConfig));

jasmine.loadConfig({
  spec_dir: 'test/spec',
  spec_files: ['**/*[sS]pec.js'],
  helpers: ['../spec_helpers/**/*.js']
});

jasmine.execute(null, process.argv[2]);
