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

const rootURL = (config.apiRoot === '') ? '/' : `/${config.apiRoot}/`;

// Service endpoint.
const serviceEndpoint = rootURL + config.catalogRoot + '/' + ':service';

// List Services
app.get(rootURL + config.catalogRoot,
  requestHandler.listServices);

// Service Info
app.get(serviceEndpoint, requestHandler.serviceInfo);

// Task Info
app.get(serviceEndpoint + '/tasks/:taskName', requestHandler.taskInfo);

// List Tasks by service
app.get(serviceEndpoint + '/tasks', requestHandler.listTasks);

// Job status endpoint.
const jobsEndPoint = rootURL + config.jobRoot;

// Submit Job
app.all(jobsEndPoint,
  bodyParser.urlencoded({extended: false}));

app.post(jobsEndPoint,
  requestHandler.submitJob);

// Job List
app.post('/searchJobs', requestHandler.listJobs);

// Job Status
app.get(jobsEndPoint + '/:id', requestHandler.jobStatus);

// Cancel
app.put(jobsEndPoint + '/:id', requestHandler.cancelJob);

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
