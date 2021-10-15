// This module accepts requests from the client and assigns
// functions to those requests.
const fs = require('fs');
const path = require('path');
const responses = require('../utils/responses');
let jobManager;

// Initialize Job Manager
const init = (jm) => {
  jobManager = jm;
};

// Headers
const contentType = {
  json: 'application/json',
  urlencoded: 'application/x-www-form-urlencoded'
};

// Called by service info endpoint.
const serviceInfo = (req, res) => {
  res.setHeader('Content-Type', contentType.json);
  const serviceDescription = responses.listServices.services.find((element) => {
    return element.name === req.params.service;
  });
  res.send(JSON.stringify(serviceDescription));
};

const listTasks = (req, res) => {
  res.setHeader('Content-Type', contentType.json);
  res.send(JSON.stringify({ tasks: responses.taskList }));
};

const listServices = (req, res) => {
  res.setHeader('Content-Type', contentType.json);
  res.send(JSON.stringify(responses.listServices));
};

// Called by jobs endpoint.
const listJobs = (req, res) => {
  // Send requested task list to client
  // Get a fake list of jobs.
  let outJobList = JSON.parse(JSON.stringify(responses.jobList));

  // Add offset to job numbers if specified.
  if (req.body.offset) {
    outJobList = responses.jobList.map((job) => {
      return { jobId: parseInt(job.jobId, 10) + parseInt(req.body.offset, 10) };
    });
  }

  // Reverse list if specified.  Only support simple use case for sort.
  let reverse = req.body.reverse;
  if (req.body.sort) {
    reverse =
      req.body.sort[0][0] === 'jobSubmitted' && req.body.sort[0][1] === -1;
  }

  if (reverse) {
    outJobList = outJobList.reverse();
  }

  // Query by status if specified.
  if (req.body.status) {
    outJobList = outJobList.filter((job) => {
      return job.jobStatus === req.body.status;
    });
  }

  const jobListMeta = {
    count: outJobList.length,
    total: outJobList.length
  };

  let jobListTotals = {};
  if (req.body.totals === 'all') {
    jobListTotals = {
      accepted: 0,
      started: 0,
      succeeded: 0,
      failed: 0
    };
  }

  // Send response.
  res.setHeader('Content-Type', contentType.json);
  res.send(
    JSON.stringify({ jobs: outJobList, ...jobListMeta, ...jobListTotals })
  );
};

// Called by task info endpoint.
const taskInfo = (req, res) => {
  // Send response using prebaked info.
  res.setHeader('Content-Type', contentType.json);
  res.send(JSON.stringify(responses.taskInfo));
};

// Called by submit job endpoint.
const submitJob = (req, res) => {
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
  jobManager.addToQueue(
    taskName,
    service,
    params,
    jobOptions,
    null,
    (err, jobId) => {
      if (err) {
        res.status(err.code).send(err.message);
        return;
      }
      // Set the Location header
      res.setHeader('Location', '/jobs/' + jobId);

      // Send the new job information to the client
      res
        .status(201)
        .send(JSON.stringify({ message: 'Added to job queue', jobId }));
    }
  );
};

// Called by cancel endpoint.
const cancelJob = (req, res) => {
  jobManager.cancel(req.params.id, req.query.kill === 'true');
  res.send(JSON.stringify({ message: 'Job was Canceled' }, null, 4));
};

// Called by delete endpoint.
const deleteJob = (req, res) => {
  jobManager.delete(req.params.id);
  res.send(JSON.stringify({ message: 'Job was deleted' }, null, 4));
};

// Called by job status endpoint.
const jobStatus = (req, res) => {
  // Get job info from jm.
  jobManager.jobInfo(req.params.id, (err, info) => {
    if (err) {
      res.status(err.code).send(err.message);
      return;
    }

    // Send response.
    res.setHeader('Content-Type', contentType.json);
    res.send(JSON.stringify(info, null, 4));
  });
};

const getFile = (req, res) => {
  try {
    const filePath = path.resolve(
      __dirname,
      'workspace',
      req.params.id,
      req.params.fileName
    );
    const stream = fs.createReadStream(filePath);
    res.setHeader('Content-Type', 'application/octet-stream');
    stream.on('error', () => {
      res.status(404).send();
    });
    stream.pipe(res);
  } catch (error) {
    res.status(404).send();
  }
};

const listWorkspace = (req, res) => {
  try {
    const workspaceDir = path.resolve(__dirname, 'workspace', req.params.id);
    const workspace = fs.readdirSync(workspaceDir).map((file) => ({
      ...fs.statSync(path.resolve(workspaceDir, file)),
      path: file
    }));
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ workspace }));
  } catch (error) {
    res.status(404).send('Error requesting job workspace');
  }
};

module.exports = {
  init,
  serviceInfo,
  listTasks,
  listJobs,
  taskInfo,
  submitJob,
  cancelJob,
  deleteJob,
  jobStatus,
  listServices,
  getFile,
  listWorkspace
};
