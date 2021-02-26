import superagent from 'superagent';
import saNoCache from 'superagent-no-cache';
import EventEmitter from 'events';

import utils from './utils/utils.js';
import {Service} from './Service';
import {Job} from './Job';
import GSF_API from './utils/GSF_API';
import EVENTS from './utils/EVENTS';

const nocache = utils.isIE() ? saNoCache.withQueryStrings : saNoCache;

/**
 * The Client class is used to connect to the server and retrieve information
 *  about available services and jobs.
 * @example
 * // Obtain Client object from GSF.
 * const Client = GSF.client({address:'MyServer',port:9191});
 */
export class Client extends EventEmitter {
  /**
   * The ClientOptions object contains information about the server.
   * @typedef {Object} ClientOptions
   * @property {string} ClientOptions.address - The server address/name.
   * @property {string} [ClientOptions.port=null] - The server port.
   * @property {Object} [ClientOptions.headers={}] - The headers to be used in requests.
   * @property {string} [ClientOptions.APIRoot=''] - The API root endpoint.
   * @property {string} [ClientOptions.protocol='http'] - The protocol to use.
   */

  /**
   * @param {ClientOptions} clientOptions - The object containing server information.
   * @emits {JobCompleted}
   * @emits {JobSucceeded}
   * @emits {JobFailed}
   * @emits {JobProgress}
   * @emits {JobStarted}
   * @emits {JobAccepted}
   */
  constructor(clientOptions) {
    // Init EventEmitter superclass.
    super();

    /**
     * The server address/name.
     * @type {string}
     */
    this.address = clientOptions.address;

    /**
     * The server port.
     * @type {number}
     */
    this.port = clientOptions.port || null;

    /**
     * The headers to use in requests
     * @type {Object}
     */
    this.headers = clientOptions.headers || {};

    /**
     * The API root endpoint.  If none, set to empty string.
     * @type {string}
     */
    this.APIRoot = clientOptions.APIRoot || GSF_API.ROOT_PATH;

    /**
     * The protocol to use.
     * @type {string}
     */
    this.protocol = clientOptions.protocol || 'http';

    /**
     * The server url.
     * @type {string}
     */
    this.URL = this.protocol + '://' +
      this.address + (this.port ? ':' + this.port : '');

    /**
     * The API root url.
     * @type {string}
     */
    this.rootURL = (this.APIRoot === '') ? this.URL : [this.URL, this.APIRoot].join('/');

    // Allow infinite listeners.
    this.setMaxListeners(0);

    // Use global EventSource for browsers and the node package for node.
    let Eventsource;
    if (NODE) { // Webpack defined global
      Eventsource = require('eventsource');
    } else {
      Eventsource = EventSource;
    }

    // Attach to server sent events and re broadcast.
    // Include headers as query strings.
    let queryString;
    if (this.headers) {
      queryString = Object.keys(this.headers).map((key) => {
        return encodeURIComponent(key) + '=' +
          encodeURIComponent(this.headers[key]);
      }).join('&');
    }

    let url = [this.URL, this.APIRoot,
      GSF_API.EVENTS_PATH].filter((v) => (v !== '')).join('/');
    url = (queryString) ? (url + '?' + queryString) : (url);

    this._events = new Eventsource(url);

    // Emit succeeded and failed events.
    this.on(EVENTS.completed, (data) => {
      this.emit(data.success ? EVENTS.succeeded : EVENTS.failed, data);
    });

    // Function to handle server sent events.
    function handler(type, event) {
      try {
        const data = JSON.parse(event.data);
        this.emit(type, data);
      } catch (err) {}
    };

    // Listen for events from our server.  Pass
    // them into the handler with job event type.
    Object.keys(EVENTS).forEach((key) => {
      // Server doesn't emit succeeded or failed events.
      if ((EVENTS[key] === EVENTS.succeeded) ||
       (EVENTS[key] === EVENTS.failed)) return;

      // Add a listener for each of the sse's.
      this._events.addEventListener(EVENTS[key],
        handler.bind(this, EVENTS[key]));
    });
  }

  /**
   * Retrieves an array of available services from the server.
   * @return {Promise<Service[], error>} Returns a Promise to an array of available Service objects.
   */
  services() {
    return new Promise((resolve, reject) => {
      // Service url.
      const url = [this.rootURL, GSF_API.SERVICES_PATH].join('/');

      // Get service list.
      superagent
        .get(url)
        .use(nocache) // Prevents caching of *only* this request
        .set(this.headers)
        .end((err, res) => {
          if (res && res.ok) {
            const services = res.body.services;
            const serviceList = services
              .map(service => new Service(this, service.name));
            resolve(serviceList);
          } else {
            const status = ((err && err.status) ? ': ' + err.status : '');
            const text = ((err && err.response && err.response.text) ? ': ' +
             err.response.text : '');
            reject('Error requesting services' + status + text);
          }
        });
    });
  }

  /**
   * Filtering options for listing jobs.
   * @typedef {Object} JobListOptions
   * @property {Object} query - Filter jobs by specifying one or more comparison operators per property.
   *   Comparison operators must be prefixed with '$' and only the following are supported: $eq, $ne,
   *  $gt, $gte, $lt, $lte.  Queries may contain multiple properties and each property may
   *  contain multiple comparison operators.
   * @property {Array} sort - The sort array.  This array contains an array for each sort which
   *  consists of the property to sort by and the direction. To sort in ascending order use 1 and
   *  to sort in descending order use -1.  For example, to sort by jobSubmitted date in ascending
   *  order: [ [ 'jobSubmitted', 1 ] ]
   * @property {number} offset - The number of jobs to skip; useful for pagination.
   * @property {number} limit - Limit the number of jobs returned. Set to -1 to
   *  return all jobs. Note: -1 is not recommended, as it may take a long time
   *  to retrieve all jobs.
   * @property {string} totals - Types of total job counts to include in the response.
   *  Must be one of: 'all', 'none', or 'default'.  The default is 'default'.
   *   Set to 'none' to exclude totals.  Set to 'default' to include total count of all filtered jobs.
   *   Set to 'all' to include total count of all filtered jobs and the total counts of filtered jobs
   *  in each job status.  Totals will only be visible when used with the jobInfoList() function.
   */

  /**
   * Retrieves an array of jobs on the server.
   * @param {JobListOptions} jobListOptions - Object containing options for
   *  filtering job list.
   * @return {Promise<Job[], error>} Returns a Promise to an array of
   *  jobs that exist on the server.
   */
  jobs(jobListOptions) {
    return this
      .jobInfoList(jobListOptions)
      .then((jobInfoList) => (
        jobInfoList.jobs.map((jobInfo) => (new Job(this, jobInfo.jobId)))
      ));
  }

  /**
   * A list of JobInfo objects with count and total information.
   * @typedef {Object} JobInfoList
   * @property {JobInfo[]} jobs - An array of JobInfo objects that match the search criteria.
   * @property {string} count - The number of filtered jobs in the jobs array.
   * @property {string} [total] - The total number of jobs.  Enabled by default.
   *   To disable, set 'totals' to 'none' in the JobListOptions.
   * @property {string} [accepted] - The total number of accepted jobs.
   *   This can be enabled by setting 'totals' to 'all' in the JobListOptions.
   * @property {string} [started] - The total number of started jobs.
   *   This can be enabled by setting 'totals' to 'all' in the JobListOptions.
   * @property {string} [succeeded] - The total number of succeeded jobs.
   *   This can be enabled by setting 'totals' to 'all' in the JobListOptions.
   * @property {string} [failed] - The total number of failed jobs.
   *   This can be enabled by setting 'totals' to 'all' in the JobListOptions.
   */

  /**
   * Retrieves an array of job info objects.
   * @param {JobListOptions} jobListOptions - Object containing options for
   *  filtering job list.
   * @return {Promise<JobInfoList, error>} Returns a Promise to a JobInfoList object.
   */
  jobInfoList(jobListOptions) {
    return new Promise((resolve, reject) => {
      // Service url.
      let url = [this.rootURL, GSF_API.JOB_SEARCH_PATH].join('/');


      // Get job info list.
      superagent
        .post(url)
        .use(nocache) // Prevents caching of *only* this request
        .set(this.headers)
        .send(jobListOptions || {})
        .then((res) => {
          resolve(res.body);
        })
        .catch((err) => {
          const status = ((err && err.status) ? ': ' + err.status : '');
          const text = ((err && err.response && err.response.text) ? ': ' +
           err.response.text : '');
          reject('Error requesting jobs' + status + text);
        });
    });
  }

  /**
   * Returns the Service object based on service name.
   * @param {string} serviceName - The name of the service.
   * @return {Service} The Service object.
   */
  service(serviceName) {
    return new Service(this, serviceName);
  }

  /**
   * Retrieves job object based on the job ID.
   * @param {string} jobId - The id of the job from which to retrieve the job object.
   * @param {function(info: JobProgressInfo)} [progressCallback] - The callback to handle job progress.
   * @param {function(info: JobStartedInfo)} [startedCallback] - The callback that is called when the job starts.
   *  For more reliable job started information, listen to the GSF JobStarted
   *  events as this callback may not always get called.  In some cases the job
   *  can start before the callback is registered.
   * @return {Job} Returns job object.
   */
  job(jobId, progressCallback, startedCallback) {
    return new Job(this, jobId, progressCallback, startedCallback);
  }

}

/**
 * Emitted when a job completes.
 * @typedef {Object} JobCompleted
 * @property {string} jobId - The job id.
 * @property {boolean} success - A boolean set to true if the job succeeds,
 *  false if it fails.
 */

/**
 * Emitted when a job succeeds.
 * @typedef {Object} JobSucceeded
 * @property {string} jobId - The job id.
 */

/**
 * Emitted when a job fails.
 * @typedef {Object} JobFailed
 * @property {string} jobId - The job id.
 */

/**
 * Emitted when job progress is updated.
 * @typedef {Object} JobProgress
 * @property {string} jobId - The job id.
 * @property {number} progress - The job progress percent.
 * @property {string} [message] - The job progress message, if any.
 */

/**
 * Emitted when a job starts.
 * @typedef {Object} JobStarted
 * @property {string} jobId - The job id.
 */

/**
 * Emitted when a job is accepted.
 * @typedef {Object} JobAccepted
 * @property {string} jobId - The job id.
 */
