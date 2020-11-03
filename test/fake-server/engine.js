// Fake engine module for testing.
// This module runs a simple sleep task for testing.

// Get our sleep task.
const sleepTask = require('../tasks/Sleep');
const writeFilesTask = require('../tasks/WriteFiles');
const cleanTask = require('../tasks/Clean');

// Execute function.
const execute = function (engineAPI, taskName, inputParameters, scratchDir, report) {
  switch (taskName) {
    // Execute task.
    case 'Sleep':
      sleepTask(engineAPI, inputParameters, null, report);
      break;
    case 'WriteFiles':
      writeFilesTask(engineAPI, inputParameters, null, report);
      break;
    case 'Clean':
      cleanTask(engineAPI, inputParameters, null, report);
      break;
    default:
      console.error('Unable to find test task: ' + taskName);
  }
};

module.exports = {
  execute
};
