import * as request from 'superagent';
import saNoCache from 'superagent-no-cache';

import * as sdkUtils from './utils/utils.js';
import Job from './Job';
import * as SERVER_API from './utils/GSF_API';

const nocache = sdkUtils.isIE() ? saNoCache.withQueryStrings : saNoCache;

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
  }

  /**
   * Retrieves the task information.
   * @return {Promise<TaskInfo, error>} Returns a promise to the TaskInfo object.
   */
  info() {
    return new Promise((resolve, reject) => {
      // Task info url.
      const taskURL = [this._server.rootURL, SERVER_API.SERVICES_PATH,
        this.service.name, SERVER_API.TASKS_PATH, this.name].join('/');

      // Get task info.
      request
        .get(taskURL)
        .use(nocache) // Prevents caching of *only* this request
        .end((err, res) => {
          if (res && res.ok) {
            resolve(res.body);
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
   * Submits the job.
   * @param {SubmitOptions} submitOptions - The job submit options.
   * @param {function(info: JobProgressInfo)} [progressCallback] - The callback to handle job progress.
   * @param {function(info: JobStartedInfo)} [startedCallback] - The callback that is called when the job starts.
   *  For more reliable job started information, listen to the GSF JobStarted
   *  events as this callback may not always get called.  In some cases the job
   *  can start before the callback is registered.
   * @return {Promise<Job, error>} Returns a promise to a Job object.
   */
  submit(submitOptions, progressCallback, startedCallback) {
    return new Promise((resolve, reject) => {

      // Build task submit url.
      const url = [this._server.rootURL, SERVER_API.JOBS_PATH].join('/');
      const jobOptions = JSON.parse(JSON.stringify(submitOptions));
      jobOptions.taskName = this.name;
      jobOptions.serviceName = this.service.name;

      // Submit task as a job.
      request
        .post(url)
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(jobOptions))
        .set('GSF-noredirect', 'true')
        .use(nocache) // Prevents caching of *only* this request
        .end((err, res) => {
          if (res && res.ok) {
            // Return new job object using ID.
            resolve(new Job(this._server, res.body.jobID, progressCallback,
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
   * @param {SubmitOptions} submitOptions - The job submit options.
   * @param {function(info: JobProgressInfo)} [progressCallback] - The callback to handle job progress.
   * @param {function(info: JobStartedInfo)} [startedCallback] - The callback that is called when the job starts.
   *    For more reliable job started information, listen to the GSF JobStarted
   *   events as this callback may not always get called.  In some cases the job
   *   can start before the callback is registered.
   * @return {Promise<JobResults, error>} Returns a promise to a Job object.
   */
  submitAndWait(submitOptions, progressCallback, startedCallback) {
    return this.submit(submitOptions, progressCallback, startedCallback)
      .then(job => job.wait());
  }
}

export default Task;

/**
 * The Submit Options object contains the information needed to run
 * a job.
 * @typedef SubmitOptions
 * @property {Object} inputParameters - The input parameters to the job.  This is
 *  an object where the keys represent the names of the
 *  input parameters and the values are the inputs to the task.
 * @property {JobOptions} jobOptions - Processing options to be used when running the job.
 */

/**
 * The Job Options object contains processing options to be used when running the job.
 * @typedef {Object} JobOptions
 * @property {JobRoute} [route] - The route on which to run the job if
 * there is one.
 * @property {JobStorageOptions} [storage] - The job storage options.  This is used for
 * specifying cloud storage for job output.
 */

/* eslint-disable max-len */
// TODO: Use best way to doc
/**
 * @typedef {AmazonS3JobStorageOptions | AzureBlockBlobJobStorageOptions | GoogleCloudJobStorageOptions} JobStorageOptions
 */
/* eslint-enable max-len */

/**
 * @typedef {Object} AmazonS3JobStorageOptions
 * @property {string} [provider] - Set to 'AWS_S3' for Amazon S3 storage.
 * @property {string} [S3Bucket] - Name of the S3 bucket to use.
 * @property {string} [S3Root] - A location (path prefix) within the bucket.
 * @property {string} [accessKeyId] - Access key ID for the S3 bucket.
 * @property {string} [secretAccessKey] - Secret access key for the S3 bucket.
 */

/**
 * @typedef {Object} AzureBlockBlobJobStorageOptions
 * @property {string} [provider] - Set to 'Azure_BlockBlob' for Azure Block Blob storage.
 * @property {string} [containerName] - Name of the Azure Block Blob container to use.
 *  The container name must be all lowercase.
 * @property {string} [host] - Host endpoint URI for connecting to the storage container.
 * @property {string} [sasToken] - Shared Access Signature (SAS) token.
 */

/**
 * @typedef {Object} GoogleCloudJobStorageOptions
 * @property {string} [provider] - Set to 'Google_CS' for Azure Block Blob storage.
 * @property {string} [GCloudBucket] - Name of the bucket.
 * @property {string} [GCloudRoot] - A location (prefix) within the bucket.
 * @property {string} [credentials] - An object containing private_key and
 *  client_email for a service account that has write access to the bucket,
 *  obtained from the Google Developers Console.
 */

/**
 * The TaskInfo object contains information about a task.
 * @typedef {Object} TaskInfo
 * @property {string} taskName - The name of the task.
 * @property {string} serviceName - The name of the service.
 * @property {string} [displayName] - A readable name for the task. This is only used for display
 *   purposes.
 * @property {string} [description] - A description of the task.
 *
 * @property {InputParameter[]} inputParameters - An array containing the input parameter definitions.
 * @property {OutputParameter[]} outputParameters - An array containing the output parameter definitions.
 */

/**
 * The InputParameter object contains information about an input parameter.
 * @typedef {Object} InputParameter
 * @property {string} name - The name of the parameter.
 * @property {string} type - The type for the parameter.
 * @property {boolean} required - A boolean representing whether or not the parameter is required.
 * @property {string} displayName - A display name for the parameter.
 * @property {string} description - A description of the parameter.
 * @property {string} default - A default value for the parameter.
 * @property {string} choiceList - A list of values that will be accepted as input for the parameter.
 */

/**
 * The OutputParameter object contains information about an output parameter.
 * @typedef {Object} OutputParameter
 * @property {string} name - The name of the parameter.
 * @property {string} type - The type for the parameter.
 * @property {boolean} required - A boolean representing whether or not the parameter is required.
 * @property {string} displayName - A display name for the parameter.
 * @property {string} description - A description of the parameter.
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
