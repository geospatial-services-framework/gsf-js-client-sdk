// The purpose of this server is to provide a mock REST API
//  for running tests out of the box.
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const jobManager = new (require('./jobManager'))();
const requestHandler = require('./handler.js');

const config = require('./config.json');

// Create test server.
const app = express();

app.use(cors());
app.options('*', cors());

app.use(bodyParser.json());
const PORT = config.port;

// Service endpoint.
const serviceEndpoint = '/' + config.apiRoot + '/' + config.catalogRoot +
 '/' + ':service';

// Services
app.get('/' + config.apiRoot + '/' + config.catalogRoot,
  requestHandler.serviceInfo);

// Service Info
app.get(serviceEndpoint, requestHandler.listTasks);

// Task Info
app.get(serviceEndpoint + '/:taskName', requestHandler.taskInfo);

// Submit Job
app.all(serviceEndpoint + '/:taskName/submitJob',
  bodyParser.urlencoded({extended: false}));

app.get(serviceEndpoint + '/:taskName/submitJob',
  requestHandler.submitJob);

app.post(serviceEndpoint + '/:taskName/submitJob',
  requestHandler.submitJob);

// Submit Job w/ route
app.all(serviceEndpoint + '/:taskName/:route/submitJob',
  bodyParser.urlencoded({extended: false}));

app.get(serviceEndpoint + '/:taskName/:route/submitJob',
  requestHandler.submitJob);

// Job status endpoint.
const jobsEndPoint = '/' + config.apiRoot + '/' + config.jobRoot;

// Job List
app.get(jobsEndPoint, requestHandler.listJobs);

// Job Status
app.get(jobsEndPoint + '/:id/status', requestHandler.jobStatus);

// Cancel
app.delete(jobsEndPoint + '/:id', requestHandler.cancelJob);

let SseChannel = require('sse-channel');
let SSE;

// Create event channel.
SSE = new SseChannel({
  jsonEncode: true,
  cors: {'origins': ['*']}
});

// Events endpoint.
app.get('/events', function(req, res) {
  // Add listeners.
  SSE.addClient(req, res);
});


// Initialize request handler.
jobManager.init(SSE);
requestHandler.init(jobManager);

// Start listening.
app.listen(PORT, function () {
  console.log('**Test server is running on port ' + PORT + '**');
});
