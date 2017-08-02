const request = require('superagent');
const saNoCache = require('superagent-no-cache');
const sdkUtils = require('./utils/utils.js');
const nocache = sdkUtils.isIE() ? saNoCache.withQueryStrings : saNoCache;
const Task = require('./Task');
const SERVER_API = require('./utils/ESE_API');

/**
 * The Service class is used to inspect and create tasks for a service.
 */
class Service {
  /**
   * @param {GSF} server - The GSF server object.
   * @param {string} serviceName - The name of the service.
   */
  constructor(server, serviceName) {
    /**
     * The service name.
     * @type {string}
     */
    this.name = serviceName;

    // Server object.
    this._server = server;
  }

  /**
   * The ServiceInfo object contains information about a service.
   * @typedef {Object} ServiceInfo
   * @property {string} name - The name of the service.
   * @property {string} description - A description of the service.
   * @property {string[]} tasks - A list of available tasks on the service.
   */

  /**
   * Retrieves the service information.
   * @return {Promise<ServiceInfo, error>} Returns a Promise to the
   *  ServiceInfo object.
   */
  info() {
    return new Promise((resolve, reject) => {
      // Build service info url.
      const url = [this._server.rootURL, SERVER_API.SERVICES_PATH, this.name].join('/');

      // Get service info so we can pull off the tasks array.
      request
        .get(url)
        .use(nocache) // Prevents caching of *only* this request
        .end((err, res) => {
          if (res && res.ok) {
            // Build our version of server info.
            const serviceInfo = {
              name: res.body.name,
              description: res.body.description,
              tasks: res.body.tasks
            };
            resolve(serviceInfo);
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
      const url = [this._server.rootURL, SERVER_API.SERVICES_PATH, this.name].join('/');

      // Get service info so we can pull off the tasks array.
      request
        .get(url)
        .query({ taskInfo: true })
        .use(nocache) // Prevents caching of *only* this request
        .end((err, res) => {
          if (res && res.ok) {
            const tasks = [];
            res.body.tasks.forEach((task) => {
              if (typeof task === 'object') {
                const newTask = Object.assign({}, task);
                newTask.parameters = {};
                task.parameters.forEach((param) => {
                  newTask.parameters[param.name] = Object.assign({}, param);
                });
                tasks.push(newTask);
              } else {
                reject('Unable to get task info list.');
                return;
              }
            });
            resolve(tasks);
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
    return new Promise((resolve, reject) => {
      this.info()
        .then((info) => {
          const tasks = info.tasks.map((taskName) => {
            return new Task(this, taskName);
          });
          resolve(tasks);
        })
        .catch((err) => {
          const status = ((err && err.status) ? ': ' + err.status : '');
          const text = ((err && err.response && err.response.text) ? ': ' +
           err.response.text : '');
          reject('Error requesting tasks' + status + text);
        });
    });
  }
}

export default Service;


