// This module accepts requests from the client and assigns
// functions to those requests.
const responses = require('../utils/responses');
var jobManager;

// Initialize Job Manager
const init = function(jm) {
  jobManager = jm;
};

// Headers
const contentType = {
  json: 'application/json',
  urlencoded: 'application/x-www-form-urlencoded'
};

// Called by service info endpoint.
const serviceInfo = function(req, res) {
  res.setHeader('Content-Type', contentType.json);
  res.send(JSON.stringify(responses.services.response, null, 4));
};

// Called by services endpoint.
const listTasks = function(req, res) {
  // Send requested task list to client
  var taskList = [];
  responses.services.response.services[1].tasks.forEach(function(task) {
    taskList.push(req.query.taskInfo ? task : task.name);
  });
  res.setHeader('Content-Type', contentType.json);
  res.send(JSON.stringify({
    name: req.params.service,
    executionType: 'asynchronous',
    description: req.params.service + ' processing routines',
    readOnly: 'true',
    tasks: taskList
  }, null, 2));
};

// Called by jobs endpoint.
const listJobs = function(req, res) {

  // Send requested task list to client
  // Get a fake list of jobs.
  let outResponses = JSON.parse(JSON.stringify(responses));
  let outJobList = outResponses.jobList;

  // Add offset to job numbers if specified.
  if (req.query.offset) {
    outJobList = responses.jobList.map((job) => {
      return {jobId: parseInt(job.jobId, 10) +
         parseInt(req.query.offset, 10)};
    });
  }

  // Reverse list if specified.
  if (req.query.reverse) {
    outJobList = outJobList.reverse();
  }

  // Query by status if specified.
  if (req.query.status) {
    outJobList = outJobList.filter((job) => {
      return (job.jobStatus === req.query.status);
    });
  }

  // Send response.
  res.setHeader('Content-Type', contentType.json);
  res.send(JSON.stringify(outJobList, null, 4));

};

// Called by task info endpoint.
const taskInfo = function(req, res) {
  // Send response using prebaked info.
  res.setHeader('Content-Type', contentType.json);
  res.send(JSON.stringify(responses.taskInfo, null, 4));
};

// Called by submit job endpoint.
const submitJob = function(req, res) {

  const taskName = req.params.taskName;
  if (!taskName) {
    res.status(400).send('Task name not defined');
    return;
  }

  const params = req.body;
  const service = req.params.service;
  const route = req.params.route || null;

  // Add job to queue.
  jobManager.addToQueue(taskName, service, params, route, null, function(err, jobID) {
    if (err) {
      res.status(err.code).send(err.message);
      return;
    }
    if (req.headers.origin && req.headers['gsf-noredirect']) {
      res.json({jobId: jobID});
    } else {
      // Redirect to the job status endpoint
      res.redirect('/' + 'ese' + '/' + 'jobs' +
        '/' + jobID + '/status');
    }
  });
};

// Called by cancel endpoint.
const cancelJob = function(req, res) {
  jobManager.cancel(req.params.id, req.query.kill === 'true');
  res.send(JSON.stringify({message: 'Job was Canceled'}, null, 4));
};

// Called by job status endpoint.
const jobStatus = function (req, res) {
  // Get job info from jm.
  jobManager.jobInfo(req.params.id, function (err, info) {
    if (err) {
      res.status(err.code).send(err.message);
      return;
    }

    // Send response.
    res.setHeader('Content-Type', contentType.json);
    res.send(JSON.stringify(info, null, 4));
  });
};

module.exports = {
  init: init,
  serviceInfo: serviceInfo,
  listTasks: listTasks,
  listJobs: listJobs,
  taskInfo: taskInfo,
  submitJob: submitJob,
  cancelJob: cancelJob,
  jobStatus: jobStatus
};
