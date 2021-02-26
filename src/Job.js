import superagent from 'superagent';
import saNoCache from 'superagent-no-cache';
import EventEmitter from 'events';
import utils from './utils/utils.js';
import GSF_API from './utils/GSF_API';
import EVENTS from './utils/EVENTS';

const nocache = utils.isIE() ? saNoCache.withQueryStrings : saNoCache;

/**
 * The Job class is used for job operations.
 */
export class Job extends EventEmitter {
  /**
   * @param {Client} client - The GSF Client object.
   * @param {string} jobId - The jobId.
   * @param {function(info: JobProgressInfo)} [progressCallback] - The callback to handle job progress.
   * @param {function(info: JobStartedInfo)} [startedCallback] - The callback that is called when the job starts.
   *  For more reliable job started information, listen to the GSF JobStarted
   *  events as this callback may not always get called.  In some cases the job
   *  can start before the callback is registered.
   * @emits {JobFailed}
   * @emits {JobSucceeded}
   * @emits {JobCompleted}
   * @emits {JobStarted}
   * @emits {JobAccepted}
   * @emits {JobProgress}
   */
  constructor(client, jobId, progressCallback, startedCallback) {
    // Init EventEmitter superclass.
    super();

    /**
     * The job Id.
     * @type {number}
     */
    this.jobId = jobId;

    // Server object.
    this._client = client;

    // Job endpoint.
    this._jobURL = [this._client.rootURL, GSF_API.JOBS_PATH,
      this.jobId].join('/');

    // Allow infinite listeners.
    this.setMaxListeners(0);

    // Store promise for wait() function if called.
    this._waiting = null;

    // Call progress and started callbacks if supplied to constructor.
    progressCallback && this.on(EVENTS.progress, progressCallback);
    startedCallback && this.on(EVENTS.started, startedCallback);

    // Function to handle events.
    this._handler = (eventName, data) => {
      // Only care about events pertaining to this job.
      if (data.jobId !== this.jobId) return;

      // Re-emit the rest of the events.
      this.emit(eventName, data);
    };

    // Listen for events from our server.  Pass
    // them into the handler with job event type.
    Object.keys(EVENTS).forEach((key) => {
      this._client.on(EVENTS[key], (data) => {
        this._handler(EVENTS[key], data);
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

        // Listen to job events.
        this.once(EVENTS.succeeded, (data) => {
          this.info().then((info) => {
            resolve(info.jobResults);
          });
        });
        this.once(EVENTS.failed, (data) => {
          this.info().then((info) => {
            reject(info.jobError);
          });
        });

        // Check to make sure it hasn't already completed.
        this.info().then((info) => {
          if (info.jobStatus === EVENTS.succeeded) {
            resolve(info.jobResults);
          } else if (info.jobStatus === EVENTS.failed) {
            reject(info.jobError);
          }
        }).catch((err) => {
          reject(err);
        });
      });
    }

    return this._waiting;
  }

  /**
   * The JobInfo object contains information about a job.
   * @typedef {Object} JobInfo
   * @property {string} serviceName - The name of the service.
   * @property {string} taskName - The name of the task.
   * @property {JobOptions} [jobOptions] - Processing directives to submit along with the job.
   * @property {Object} [inputParameters] - The input parameters.
   * @property {string} jobId - The job id.
   * @property {number} [jobProgress] - The percentage of job completion.
   * @property {string} [jobMessage] - A status message that is sent with progress updates.
   * @property {string} jobStatus - The status of the job. It can be Accepted,
   *  Started, Succeeded, or Failed.
   * @property {JobResults} [jobResults] - The job output results.
   * @property {string} [jobSubmitted] - Time the job was submitted.
   * @property {string} [jobStart] - Time the job started processing.
   * @property {string} [jobEnd] - Time the job finished processing.
   * @property {string} [jobError] - An error from the job, if there was one.
   * @property {NodeInfo} [nodeInfo] - Provides information about the node on which the job ran.
   */

  /**
   * Provides information about the node on which the job ran.
   * @typedef {Object} NodeInfo
   * @property {string} nodeAddress - This is the address of the machine that ran job.
   * @property {number} nodePort - The port of the server that ran the job.
   * @property {number} workerID - The ID of the worker that ran the job.
   */

  /**
   * The job output results.
   * @typedef {Object} JobResults
   * @property {*} <parameterName>.best - Result from the first parameter mapper which
   * was able to reverse translate the output value.
   * @property {*} <parameterName>.raw - The raw output value returned by the task.
   */

  /**
   * Retrieves the job information.
   * @return {Promise<JobInfo, error>} Returns a promise to a JobInfo object.
   */
  info() {
    return new Promise((resolve, reject) => {
      const jobStatusURL = this._jobURL;

      // Get job status.
      superagent
        .get(jobStatusURL)
        .use(nocache) // Prevents caching of *only* this request
        .set(this._client.headers)
        .end((err, res) => {
          if (res && res.ok) {
            resolve(res.body);
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
      const requestStatus = force ? 'KillRequested' : 'CancelRequested';
      // Cancel job.
      superagent
        .put(url)
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({'jobStatus': requestStatus}))
        .use(nocache) // Prevents caching of *only* this request
        .set(this._client.headers)
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

  /**
   * Retrieves a list of the workspace files.
   * @return {Promise<Object[], error>} Returns a promise to an array of fs.stat objects.
   */
  workspace() {
    return new Promise((resolve, reject) => {
      const jobStatusURL = this._jobURL;
      // List workspace files.
      superagent
        .get(`${jobStatusURL}/workspace`)
        .use(nocache) // Prevents caching of *only* this request
        .set(this._client.headers)
        .end((err, res) => {
          if (res && res.ok) {
            resolve(res.body.workspace);
          } else {
            const status = ((err && err.status) ? ': ' + err.status : '');
            const text = ((err && err.response && err.response.text) ? ': ' +
             err.response.text : '');
            reject('Error requesting job workspace' + status + text);
          }
        });
    });
  }

  /**
   * Retrieves a workspace file.
   * @return {Promise<arraybuffer, error>} Returns a promise to an ArrayBuffer of the file contents.
   */
  file(fileName) {
    return new Promise((resolve, reject) => {
      const jobStatusURL = this._jobURL;
      // Get file as arraybuffer.
      superagent
        .get(`${jobStatusURL}/workspace/${fileName}`)
        .parse(superagent.parse['application/octet-stream'])
        .responseType('arraybuffer')
        .then((res) => {
          resolve(res.body);
        }).catch((err) => {
          const status = ((err && err.status) ? ': ' + err.status : '');
          reject('Error requesting file' + status);
        });
    });
  }
}
