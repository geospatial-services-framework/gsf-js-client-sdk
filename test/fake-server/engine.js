// Fake engine module for testing.
// This module runs a simple sleep task for testing.

// Get our sleep task.
const sleepTask = require('../tasks/Sleep');

// Execute function.
const execute = function (engineAPI, taskName, inputParameters, scratchDir, report) {
  switch (taskName) {
    case 'Sleep':
      // Execute task.
      sleepTask(null, inputParameters, null, report);
      break;
    default:
      console.error('Unable to find test task: ' + taskName);
  }
};

module.exports = {
  execute: execute
};
