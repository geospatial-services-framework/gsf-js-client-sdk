// Fake job manager for testing.
// This module uses an in memory queue for running
// jobs sequentially.

const engine = require('./engine');

let SSE;

var jobs = [];
var processingQueue = [];

function jobManager() {

  this.init = function(sse) {
    SSE = sse;
  };

  let cancelJobId = '';

  this.cancel = function(id, force) {
    cancelJobId = id;
  };

  // Job Info
  this.jobInfo = function(id, callback) {
    let job = jobs[id];
    if (job) {
      callback(null, job);
    } else {
      callback();
    }
  };

  // Add jobs to the queue.
  this.addToQueue = function(name, service, params, jobOptions, user, callback) {

    // Assign a job id.
    let id = jobs.length;

    // Create a job object.
    let job = {
      jobId: id,
      jobProgress: 0,
      jobMessage: '',
      jobStatus: 'Accepted',
      jobError: '',
      taskName: name,
      serviceName: service,
      inputParameters: params,
      jobResults: [],
      jobOptions: jobOptions || {},
      jobStart: '',
      jobEnd: '',
      jobSubmitted: ''
    };

    // Add to the job queue
    jobs.push(job);
    processingQueue.push(job);

    // Send accepted message.
    SSE.send({
      event: 'JobAccepted',
      data: {
        jobId: job.jobId
      }
    });

    // Return job id when the job is on the queue
    callback(null, id);
    processNextJobIfReady();
  };

  // Keep track of when jobs are processing.
  var processing = false;

  // Function to see if jobs are ready.
  function processNextJobIfReady() {
    if (!processing) {
      // Grab next job.
      let job = processingQueue.shift();
      if (job) {
        processing = true;
        job.jobStatus = 'Started';

        // Send started event.
        SSE.send({
          event: 'JobStarted',
          data: {
            jobId: job.jobId
          }
        });

        // Execute job.
        engine.execute(null, job.taskName, job.inputParameters, null, createCallback(job));
      }
    }
  };

  // Function for building job reporting callback.
  function createCallback(job) {
    return {
      // Progress callback.
      progress: function(percent, message) {
        job.jobProgress = percent;
        job.jobProgressMessage = message;
        // Send progress event.
        SSE.send({
          event: 'JobProgress',
          data: {
            jobId: job.jobId,
            progress: percent,
            message: message
          }
        });
      },
      // Done callback.
      done: function(err, data) {
        processing = false;
        processNextJobIfReady();

        job.jobProgress = 100;
        job.jobStatus = 'Succeeded';
        job.jobResults = data;

        // If there was an error, add an error field and change status;
        if (parseInt(cancelJobId, 10) === job.jobId) {
          err = 'job cancelled';
        }

        if (err) {
          job.jobError = err;
          job.jobStatus = 'Failed';

          // Job failed event.
          SSE.send({
            event: 'JobFailed',
            data: {
              jobId: job.jobId
            }
          });
        } else {
          // Job succeeded event.
          SSE.send({
            event: 'JobSucceeded',
            data: {
              jobId: job.jobId
            }
          });
        }

        // Send job completed event.
        SSE.send({
          event: 'JobCompleted',
          data: {
            jobId: job.jobId,
            success: !err
          }
        });
      }
    };
  };
}

module.exports = jobManager;
