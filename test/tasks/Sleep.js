/**
 * Test task that sleeps.
 * @param API
 * @param inputs
 * @param scratch
 * @param jobResults
 * @constructor
 */
function Sleep(API, inputs, scratch, jobResults) {
  setTimeout(function() {
    if (inputs.N_PROGRESS) {
      for (var i = 0; i < inputs.N_PROGRESS; i++) {
        // .warn('*calling progrss fxn: ', i * (100 / inputs.N_PROGRESS));
        jobResults.progress(i * (100 / inputs.N_PROGRESS), (inputs.PROGRESS_MESSAGE || 'Progress Message'));
      }
    }
    if (inputs.FAIL) {
      jobResults.done(inputs.ERROR_MESSAGE);
    } else {
      jobResults.done(null, {OUTPUT: inputs.INPUT_INTEGER});
    }
  }, inputs.SLEEP_TIME);
}

module.exports = Sleep;
