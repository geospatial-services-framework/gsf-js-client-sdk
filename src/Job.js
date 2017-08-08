import * as request from 'superagent';
import saNoCache from 'superagent-no-cache';
import EventEmitter from 'events';

import * as sdkUtils from './utils/utils.js';
import * as SERVER_API from './utils/ESE_API';
import * as STATUS_MAP from './utils/ESE_STATUS_MAP';
import EVENTS from './utils/EVENTS';

const nocache = sdkUtils.isIE() ? saNoCache.withQueryStrings : saNoCache;

/**
 * The Job class is used for job operations.
 */
class Job extends EventEmitter {
  /**
   * @param {GSF} server - The server object.
   * @param {number} jobId - The jobId.
   * @param {function(info: JobProgressInfo)} [progressCallback] - The callback to handle job progress.
   * @param {function(info: JobStartedInfo)} [startedCallback] - The callback that is called when the job starts.
   *  For more reliable job started information, listen to the GSF JobStarted
   *  events as this callback may not always get called.  In some cases the job
   *  can start before the callback is registered.
   * @emits {Failed}
   * @emits {Succeeded}
   * @emits {Completed}
   * @emits {Started}
   * @emits {Accepted}
   * @emits {Progress}
   */
  constructor(server, jobId, progressCallback, startedCallback) {
    // Init EventEmitter superclass.
    super();

    /**
     * The job Id.
     * @type {number}
     */
    this.jobId = jobId;

    // Server object.
    this._server = server;

    // Job endpoint.
    this._jobURL = [this._server.rootURL, SERVER_API.JOBS_PATH,
      this.jobId].join('/');

    // Job status endpoint.
    this._jobStatusURL = [this._jobURL, SERVER_API.STATUS_PATH].join('/');

    // Allow infinite listeners.
    this.setMaxListeners(0);

    // Store promise for wait() function if called.
    this._waiting = null;

    // Call progress and started callbacks if supplied to constructor.
    progressCallback && this.on(EVENTS.job.progress, progressCallback);
    startedCallback && this.on(EVENTS.job.started, startedCallback);

    // Function to handle events.
    this._handler = (eventName, data) => {
      // Only care about events pertaining to this job.
      if (data.jobId !== this.jobId) return;

      // Re-emit the rest of the events.
      this.emit(eventName, data);
    };

    // Listen for events from our server.  Pass
    // them into the handler with job event type.
    Object.keys(EVENTS.server).forEach((key) => {
      this._server.on(EVENTS.server[key], (data) => {
        this._handler(EVENTS.job[key], data);
      });
    });

  }

  /**
   * Waits for the job to complete.
   * @return {Promise<JobResults, error>} Returns a promise that is resolved when a job is
   *  successful, returning the job results object.
   *  If a job fails, the promise is rejected with an error message.
   */
  wait() {
    if (!this._waiting) {
      this._waiting = new Promise((resolve, reject) => {
        // Check to make sure it hasn't already completed.
        this.info().then((info) => {
          if (info.jobStatus === EVENTS.job.succeeded) {
            resolve(info.results);
          } else if (info.jobStatus === EVENTS.job.failed) {
            reject(info.jobErrorMessage);
          }
        }).catch((err) => {
          reject(err);
        });

        // Listen to job events.
        this.once(EVENTS.job.succeeded, (data) => {
          this.info().then((info) => {
            resolve(info.results);
          });
        });
        this.once(EVENTS.job.failed, (data) => {
          this.info().then((info) => {
            reject(info.jobErrorMessage);
          });
        });
      });
    }

    return this._waiting;
  }

  /**
   * The JobInfo object contains information about a job.
   * @typedef {Object} JobInfo
   * @property {string} jobId - The job id.
   * @property {string} jobStatus - The status of the job. It can be Accepted,
   *  Started, Succeeded, or Failed.
   * @property {string} jobStatusURL - The job status URL.
   * @property {number} jobProgress - The percentage of job completion.
   * @property {string} jobProgressMessage - The job progress message.
   * @property {string} jobRoute - The job route.
   * @property {string} taskName - The name of the task.
   * @property {string} serviceName - The name of the service.
   * @property {string} jobErrorMessage - Any errors generated during job execution.
   * @property {Object} inputs - The input parameters.
   * @property {Object[]} messages - Status messages.
   * @property {Object} results - The job output.
   */

  /**
   * Retrieves the job information.
   * @return {Promise<JobInfo, error>} Returns a promise to a JobInfo object.
   */
  info() {
    return new Promise((resolve, reject) => {
      const jobStatusURL = this._jobStatusURL;
      // Get job status.
      request
        .get(jobStatusURL)
        .use(nocache) // Prevents caching of *only* this request
        .end((err, res) => {
          if (res && res.ok) {
            // Create object from results array.
            let jobInfo = res.body;
            let results = {};
            jobInfo.results.forEach((result) => {
              results[result.name] = result.value;
            });
            jobInfo.results = results;

            // Remap ese statuses to our own.
            jobInfo.jobStatus = STATUS_MAP[jobInfo.jobStatus];

            resolve(jobInfo);
          } else {
            const status = ((err && err.status) ? ': ' + err.status : '');
            const text = ((err && err.response && err.response.text) ? ': ' +
             err.response.text : '');
            reject('Error requesting job info' + status + text);
          }
        });
    });

  }

  /**
   * Cancels the job.
   * @param {boolean} force - If true, the job will force cancel.  Please note that
   *  setting force to true may be unsafe depending on the type of job
   *  as it may not be able to properly shut down or clean up.
   * @return {Promise<true, error>} Returns a promise when cancel is submitted.  If request
   *  is successfully submitted, the promise will be resolved with a value of true.
   *  If the request fails, the promise will be resolved with an error message.
   *  Note that this only represents the success of the request made to the server,
   *  not the cancellation itself.  Use the Job.Info() function (or Job events)
   *  to retrieve the status of the job and to learn when it is actually cancelled.
   */
  cancel(force) {
    // Job url.
    const url = this._jobURL;
    return new Promise((resolve, reject) => {
      // Cancel force flag.
      const kill = force ? '?kill=true' : '';
      // Cancel job.
      request
        .delete(url + kill)
        .use(nocache) // Prevents caching of *only* this request
        .end((err, res) => {
          if (res && res.ok) {
            resolve(true);
          } else {
            const status = ((err && err.status) ? ': ' + err.status : '');
            const text = ((err && err.response && err.response.text) ? ': ' +
             err.response.text : '');
            reject('Error cancelling job' + status + text);
          }
        });
    });
  }
}

export default Job;

/**
 * Emitted when a job fails.
 * @typedef {Object} Failed
 * @property {number} jobId - The job id.
 */

/**
 * Emitted when a job succeeds.
 * @typedef {Object} Succeeded
 * @property {number} jobId - The job id.
 */

/**
 * Emitted when a job completes.
 * @typedef {Object} Completed
 * @property {number} jobId - The job id.
 * @property {boolean} success - A boolean set to true if the job succeeds, false if it fails.
 */

/**
 * Emitted when a job starts.  This event may never fire for a job
 *  if the Job object is created after the event fires.  In this case it
 *  is more reliable to listen to the JobStarted events on the GSF object.
 * @typedef {Object} Started
 * @property {number} jobId - The job id.
 */

/**
 * Emitted when a job is accepted by the server.  This event may never fire for a job
 *  if the Job object is created after the event fires.  In this case it
 *  is more reliable to listen to the JobAccepted events on the GSF object.
 * @typedef {Object} Accepted
 * @property {number} jobId - The job id.
 */

/**
 * Emitted when a job reports progress.
 * @typedef {Object} Progress
 * @property {number} jobId - The job id.
 * @property {number} progress - The job progress percent.
 * @property {string} [message] - The job progress message, if any.
 */
