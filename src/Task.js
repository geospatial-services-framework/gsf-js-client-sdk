const request = require('superagent');
const saNoCache = require('superagent-no-cache');
const sdkUtils = require('./utils/utils.js');
const nocache = sdkUtils.isIE() ? saNoCache : saNoCache.withQueryStrings;
const Job = require('./Job');
const SERVER_API = require('./utils/ESE_API');

/**
 * The Task class is used to submit and inspect tasks.
 */
class Task {
  /**
   * @param {Service} service - The service object.
   * @param {string} taskName - The name of the task.
   */
  constructor(service, taskName) {
    /**
     * The task name.
     * @type {string}
     */
    this.name = taskName;

    /**
     * The parent service.
     * @type {Service}
     */
    this.service = service;

    // Server object.
    this._server = service._server;

    // Task endpoint for this task.
    this._taskURL = [this._server.rootURL, SERVER_API.SERVICES_PATH,
      this.service.name, this.name].join('/');
  }

  /**
   * Retrieves the task information.
   * @return {Promise<TaskInfo, error>} Returns a promise to the TaskInfo object.
   */
  info() {
    return new Promise((resolve, reject) => {
      // Task info url.
      const taskURL = this._taskURL;

      // Get task info.
      request
        .get(taskURL)
        .use(nocache) // Prevents caching of *only* this request
        .end((err, res) => {
          if (res && res.ok) {
            // Replace parmeter array with object using name as key.
            let taskInfo = res.body;
            let parameters = {};

            taskInfo.parameters.forEach((param) => {
              parameters[param.name] = param;
            });

            taskInfo.parameters = parameters;
            resolve(taskInfo);
          } else {
            const status = ((err && err.status) ? ': ' + err.status : '');
            const text = ((err && err.response && err.response.text) ? ': ' +
             err.response.text : '');
            reject('Error requesting task info' + status + text);
          }
        });
    });
  }

  /**
   * Options for submitting a job.
   * @typedef {Object} SubmitOptions
   * @property {JobInputParameters} options.parameters - The input parameters.
   * @property {JobRoute} [options.route] - The route on which to run the job if
   * there is one.
   */

  /**
   * Submits the job.
   * @param {SubmitOptions} options - The job submit options.
   * @param {function(info: JobProgressInfo)} [progressCallback] - The callback to handle job progress.
   * @param {function(info: JobStartedInfo)} [startedCallback] - The callback that is called when the job starts.
   *  For more reliable job started information, listen to the GSF JobStarted
   *  events as this callback may not always get called.  In some cases the job
   *  can start before the callback is registered.
   * @return {Promise<Job, error>} Returns a promise to a Job object.
   */
  submit(options, progressCallback, startedCallback) {
    return new Promise((resolve, reject) => {
      // Task info url.
      const taskURL = this._taskURL;
      const route = options.route || null;

      // Build task submit url.
      const url = (route) ?
        [taskURL, route, SERVER_API.SUBMIT_JOB_PATH].join('/') :
        [taskURL, SERVER_API.SUBMIT_JOB_PATH].join('/');

      // Submit task as a job.
      request
        .post(url)
        .set('Content-Type', 'application/json')
        .set('GSF-noredirect', 'true')
        .send(JSON.stringify(options.parameters || options))
        .use(nocache) // Prevents caching of *only* this request
        .end((err, res) => {
          if (res && res.ok) {
            // Return new job object using ID.
            resolve(new Job(this._server, res.body.jobId, progressCallback,
              startedCallback));
          } else {
            const status = ((err && err.status) ? ': ' + err.status : '');
            const text = ((err && err.response && err.response.text) ? ': ' +
             err.response.text : '');
            reject('Error submitting job to ' + url + ' ' + status + text);
          }
        });
    });
  }

  /**
   * Submits the job and waits for results.  Resolves the promise if the job
   *  succeeds and rejects the promise if the job fails.
   * @param {SubmitOptions} options - The job submit options.
   * @param {function(info: JobProgressInfo)} [progressCallback] - The callback to handle job progress.
   * @param {function(info: JobStartedInfo)} [startedCallback] - The callback that is called when the job starts.
   *    For more reliable job started information, listen to the GSF JobStarted
   *   events as this callback may not always get called.  In some cases the job
   *   can start before the callback is registered.
   * @return {Promise<JobResults, error>} Returns a promise to a Job object.
   */
  submitAndWait(options, progressCallback, startedCallback) {
    return this.submit(options, progressCallback, startedCallback)
      .then(job => job.wait());
  }
}

module.exports = Task;

/**
 * The TaskInfo object contains information about a task.
 * @typedef {object} TaskInfo
 * @property {string} name - The name of the task.
 * @property {string} [displayName] - A readable name for the task. This is only used for display
 *   purposes.
 * @property {string} [description] - A description of the task.
 * @property {string} [parameters.<parameterName>.name] - The parameter name.
 * @property {string} [parameters.<parameterName>.displayName] - A display name for the parameter.
 * @property {string} [parameters.<parameterName>.description] - A description of the parameter.
 * @property {string} parameters.<parameterName>.parameterType - A string set to either "required" or
 *  "optional".
 * @property {string} parameters.<parameterName>.direction - A string set to either "INPUT" or "OUTPUT".
 * @property {string} parameters.<parameterName>.dataType - A type for the parameter.
 * @property {string[]} [parameters.<parameterName>.choiceList] - A list of values that will be accepted as input
 *   for the parameter.
 * @property {any} [parameters.<parameterName>.default] - A default value for the parameter.
 */

/**
 * The JobResults object contains the job results.
 * @typedef {Object} JobResults
 */

 /**
  * Information about job progress.
  * @typedef {Object} JobProgressInfo
  * @property {number} jobId - The job id.
  * @property {number} progress - The job progress percent.
  * @property {string} [message] - The job progress message, if any.
  */

 /**
  * Called when a job starts processing.
  *  For more reliable job started information, listen to the GSF JobStarted
  * events as this callback may not always get called.
  * In some cases the job can start before the callback is registered.
  * @typedef {Object} JobStartedInfo
  * @property {number} jobId - The job id.
  */
