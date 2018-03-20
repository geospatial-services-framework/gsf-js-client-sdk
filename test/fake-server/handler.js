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
  const serviceDescription = responses.listServices.services
    .find((element) => {
      return element.name === req.params.service;
    });
  res.send(JSON.stringify(serviceDescription));
};

const listTasks = function(req, res) {
  res.setHeader('Content-Type', contentType.json);
  res.send(JSON.stringify({tasks: responses.taskList}));
};


const listServices = function(req, res) {
  res.setHeader('Content-Type', contentType.json);
  res.send(JSON.stringify(responses.listServices));
};

// Called by jobs endpoint.
const listJobs = function(req, res) {

  // Send requested task list to client
  // Get a fake list of jobs.
  let outJobList = JSON.parse(JSON.stringify(responses.jobList));

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
  res.send(JSON.stringify({jobs: outJobList}));

};

// Called by task info endpoint.
const taskInfo = function(req, res) {
  // Send response using prebaked info.
  res.setHeader('Content-Type', contentType.json);
  res.send(JSON.stringify(responses.taskInfo));
};

// Called by submit job endpoint.
const submitJob = function(req, res) {
  res.setHeader('Content-Type', 'application/json');

  const taskName = req.body.taskName;
  if (!taskName) {
    res.status(400).send('Task name not defined');
    return;
  }

  const params = req.body.inputParameters;
  const jobOptions = req.body.jobOptions;
  const service = req.body.serviceName;

  // Add job to queue.
  jobManager.addToQueue(taskName, service, params, jobOptions, null, function(err, jobID) {
    if (err) {
      res.status(err.code).send(err.message);
      return;
    }
    // Set the Location header
    res.setHeader('Location', '/jobs/' + jobID);

    // Send the new job information to the client
    res.status(201).send(JSON.stringify({message: 'Added to job queue', jobID: jobID}));
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
  jobStatus: jobStatus,
  listServices: listServices
};
