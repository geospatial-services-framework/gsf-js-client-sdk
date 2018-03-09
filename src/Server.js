import * as request from 'superagent';
import saNoCache from 'superagent-no-cache';
import EventEmitter from 'events';

import * as sdkUtils from './utils/utils.js';
import Service from './Service';
import Job from './Job';
import * as SERVER_API from './utils/GSF_API';
import EVENTS from './utils/EVENTS';

const nocache = sdkUtils.isIE() ? saNoCache.withQueryStrings : saNoCache;

/**
 * The Server class is used to connect to the server and retrieve information
 *  about available services and jobs.
 * @example
 * // Obtain server object from GSF.
 * const server = GSF.server({address:'MyServer',port:9191});
 */
class Server extends EventEmitter {
  /**
   * The ServerArgs object contains information about the server.
   * @typedef {Object} ServerArgs
   * @property {string} ServerArgs.address - The server address/name.
   * @property {string} [ServerArgs.port=null] - The server port.
   * @property {string} [ServerArgs.APIRoot=''] - The API root endpoint.
   * @property {string} [ServerArgs.protocol='http'] - The protocol to use.
   */

  /**
   * @param {ServerArgs} serverArgs - The object containing server information.
   * @emits {JobCompleted}
   * @emits {JobSucceeded}
   * @emits {JobFailed}
   * @emits {JobProgress}
   * @emits {JobStarted}
   * @emits {JobAccepted}
   */
  constructor(serverArgs) {
    // Init EventEmitter superclass.
    super();

    /**
     * The server address/name.
     * @type {string}
     */
    this.address = serverArgs.address;

    /**
     * The server port.
     * @type {number}
     */
    this.port = serverArgs.port || null;

    /**
     * The API root endpoint.  If none, set to empty string.
     * @type {string}
     */
    this.APIRoot = serverArgs.APIRoot || SERVER_API.ROOT_PATH;

    /**
     * The protocol to use.
     * @type {string}
     */
    this.protocol = serverArgs.protocol || 'http';

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
    this._events = new Eventsource([this.URL,
      SERVER_API.EVENTS_PATH].join('/'));

    // Emit succeeded and failed events.
    this.on(EVENTS.server.completed, (data) => {
      this.emit(data.success ? EVENTS.server.succeeded : EVENTS.server.failed, data);
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
    Object.keys(EVENTS.server).forEach((key) => {
      // Server doesn't emit succeeded or failed events.
      if ((EVENTS.server[key] === EVENTS.server.succeeded) ||
       (EVENTS.server[key] === EVENTS.server.failed)) return;

      // Add a listener for each of the sse's.
      this._events.addEventListener(EVENTS.server[key],
        handler.bind(this, EVENTS.server[key]));
    });
  }

  /**
   * Retrieves an array of available services from the server.
   * @return {Promise<Service[], error>} Returns a Promise to an array of available Service objects.
   */
  services() {
    return new Promise((resolve, reject) => {
      // Service url.
      const url = [this.rootURL, SERVER_API.SERVICES_PATH].join('/');

      // Get service list.
      request
        .get(url)
        .use(nocache) // Prevents caching of *only* this request
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
   * @property {number} offset - The number of jobs to skip; useful for pagination.
   * @property {number} limit - Limit the number of jobs returned. Set to -1 to
   *  return all jobs. Note: -1 is not recommended, as it may take a long time
   *  to retrieve all jobs.
   * @property {boolean} reverse - Reverse the order of the jobs being returned.
   *   This will take effect before offest and limit are applied.
   * @property {string} status - Filter job list by status.  Possible statuses
   *  include Succeeded, Failed, Accepted, and Started.
   */

  /**
   * Retrieves an array of jobs on the server.
   * @param {JobListOptions} jobListOptions - Object containing options for
   *  filtering job list.
   * @return {Promise<Job[], error>} Returns a Promise to an array of
   *  jobs that exist on the server.
   */
  jobs(jobListOptions) {
    return new Promise((resolve, reject) => {
      // Service url.
      let url = [this.rootURL, SERVER_API.JOBS_PATH].join('/');

      // Handle arguments.
      if (jobListOptions) {
        let params = [];
        if (jobListOptions.offset) {
          params.push('offset=' + jobListOptions.offset);
        }
        if (jobListOptions.limit) {
          params.push('limit=' + jobListOptions.limit);
        }
        if (jobListOptions.reverse) {
          params.push('reverse=' + jobListOptions.reverse);
        }
        if (jobListOptions.status) {
          params.push('status=' + jobListOptions.status);
        }
        params = params.join('&');
        if (params) url += '?' + params;
      }

      // Get job list.
      request
        .get(url)
        .use(nocache) // Prevents caching of *only* this request
        .end((err, res) => {
          if (res && res.ok) {
            const jobList = res.body.jobs
              .map(job => new Job(this, job.jobId));
            resolve(jobList);
          } else {
            const status = ((err && err.status) ? ': ' + err.status : '');
            const text = ((err && err.response && err.response.text) ? ': ' +
             err.response.text : '');
            reject('Error requesting jobs' + status + text);
          }
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
   * @param {number} jobId - The id of the job from which to retrieve the job object.
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

export default Server;

/**
 * Emitted when a job completes.
 * @typedef {Object} JobCompleted
 * @property {number} jobId - The job id.
 * @property {boolean} success - A boolean set to true if the job succeeds,
 *  false if it fails.
 */

/**
 * Emitted when a job succeeds.
 * @typedef {Object} JobSucceeded
 * @property {number} jobId - The job id.
 */

/**
 * Emitted when a job fails.
 * @typedef {Object} JobFailed
 * @property {number} jobId - The job id.
 */

/**
 * Emitted when job progress is updated.
 * @typedef {Object} JobProgress
 * @property {number} jobId - The job id.
 * @property {number} progress - The job progress percent.
 * @property {string} [message] - The job progress message, if any.
 */

/**
 * Emitted when a job starts.
 * @typedef {Object} JobStarted
 * @property {number} jobId - The job id.
 */

/**
 * Emitted when a job is accepted.
 * @typedef {Object} JobAccepted
 * @property {number} jobId - The job id.
 */
