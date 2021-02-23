import superagent from 'superagent';
import saNoCache from 'superagent-no-cache';

import utils from './utils/utils.js';
import {Task} from './Task';
import GSF_API from './utils/GSF_API';

const nocache = utils.isIE() ? saNoCache.withQueryStrings : saNoCache;

/**
 * The Service class is used to inspect and create tasks for a service.
 */
export class Service {
  /**
   * @param {Client} client - The GSF client object.
   * @param {string} serviceName - The name of the service.
   */
  constructor(client, serviceName) {
    /**
     * The service name.
     * @type {string}
     */
    this.name = serviceName;

    // Client object.
    this._client = client;
  }

  /**
   * The ServiceInfo object contains information about a service.
   * @typedef {Object} ServiceInfo
   * @property {string} name - The name of the service.
   * @property {string} description - A description of the service.
   */

  /**
   * Retrieves the service information.
   * @return {Promise<ServiceInfo, error>} Returns a Promise to the
   *  ServiceInfo object.
   */
  info() {
    return new Promise((resolve, reject) => {
      // Build service info url.
      const url = [this._client.rootURL, GSF_API.SERVICES_PATH, this.name].join('/');

      // Get service info so we can pull off the tasks array.
      superagent
        .get(url)
        .use(nocache) // Prevents caching of *only* this request
        .set(this._client.headers)
        .end((err, res) => {
          if (res && res.ok) {
            resolve(res.body);
          } else {
            const status = ((err && err.status) ? ': ' + err.status : '');
            const text = ((err && err.response && err.response.text) ? ': ' +
             err.response.text : '');
            reject('Error requesting service info' + status + text);
          }
        });
    });
  }

  /**
   * Returns a task object.
   * @param {string} taskName - The name of the task.
   * @return {Task} Returns the task object.
   */
  task(taskName) {
    return new Task(this, taskName);
  }

  /**
   * Retrieves the array of task info objects available on the service.
   * @version 1.1.0
   * @return {Promise<TaskInfo[], error>} Returns a Promise to an array of TaskInfo objects.
   */
  taskInfoList() {
    return new Promise((resolve, reject) => {
      // Build service info url.
      const url = [this._client.rootURL, GSF_API.SERVICES_PATH,
        this.name, GSF_API.TASKS_PATH].join('/');

      // Get service info so we can pull off the tasks array.
      superagent
        .get(url)
        .query({ taskInfo: true })
        .use(nocache) // Prevents caching of *only* this request
        .set(this._client.headers)
        .end((err, res) => {
          if (res && res.ok) {
            resolve(res.body.tasks);
          } else {
            const status = ((err && err.status) ? ': ' + err.status : '');
            const text = ((err && err.response && err.response.text) ? ': ' +
             err.response.text : '');
            reject('Error requesting task info objects' + status + text);
          }
        });
    });
  }

  /**
   * Retrieves the array of task objects available on the service.
   * @return {Promise<Task[], error>} Returns a Promise to an array of Task objects.
   */
  tasks() {
    return this
      .taskInfoList()
      .then((taskInfoList) => (
        taskInfoList.map((taskInfo) => (new Task(this, taskInfo.taskName))))
      );
  }
}

// export default Service;


