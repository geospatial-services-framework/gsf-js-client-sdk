# Examples
Below are several examples of using the SDK with JavaScript.  For TypeScript specific examples please see the [TypeScript example](#typescript).  Before using the SDK, it is also recommended that you read the [best practices](#bestPractices) section.

## List Available Services
The GSF [**Client**] object provides the ability to list the available services on the server.

```javascript
// GSF Client
const client = GSF.client({
    address: 'MyServer',
    port: '9191'
  });

// Get an array of available services.
client.services().then((services) => {
  services.forEach((service) => {
    // Print each service name.
    console.log(service.name);
  });
}).catch((err) => {
  // There was an error.
});
```

## List Available Tasks
The [**Service**] object provides the ability to list the available tasks on the service.  The example below lists all tasks associated with the ENVI service.

```javascript
// GSF Client
const client = GSF.client({
    address: 'MyServer',
    port: '9191'
  });

// Get the ENVI service.
const service = client.service('ENVI');

// Get an array of available tasks.
service.tasks().then((tasks) => {
  tasks.forEach((task) => {
    // Print each task name.
    console.log(task.name);
  });
}).catch((err) => {
  // There was an error.
});
```

## Get Task Information
The [**Task**] object allows you to query the task and its parameters.  This may be useful when dynamically constructing UI elements representing task input parameters.

```javascript
// GSF Client
const client = GSF.client({
    address: 'MyServer',
    port: '9191'
  });

// Get the ENVI service.
const service = client.service('ENVI');

// Get a task.
const task = service.task('SpectralIndex');

task.info().then((info) => {
  // Print the task info.
  console.log(info);
}).catch((err) => {
  // There was an error.
});
```

## Run a Task
There are many ways to run tasks and retrieve results using the GSF JavaScript SDK.  The following examples assume you have completed the steps below to create a task object.

```javascript
// Get a task.
const task = GSF.client({address:'MyServer',port:'9191'}).service('ENVI').task('SpectralIndex');

const taskParameters = {
  inputParameters: {
    INPUT_RASTER: {
      FACTORY: 'URLRaster',
      URL: 'http://MyServer:9191/ese/data/qb_boulder_msi'
    },
    INDEX: 'Normalized Difference Vegetation Index'
  }
};
```

### Using Promises
The SDK provides a [**Promise**]-based interface for submitting tasks.  If the task succeeds, the promise will be fulfilled.  If the job fails, the job will be rejected.  There are two ways to use promises for job resolution.

##### 1. Use [**.wait()**]
This function returns a [**Promise**] to the job results.  The [**.submit()**] function will return a Promise to a [**Job**] object.  You may use this object to query for job information such as ID and status.

```javascript
// Submit a job.
task.submit(taskParameters)
.then(job => job.wait()) // Waits for job to complete.
.then((results) => {
  // Do something with results.
  // This function is an example and is not provided by the SDK.
  AddToMap(results.OUTPUT_RASTER.best);
}).catch((jobErrorMessage) => {
  // Display error.
});
```

##### 2. Use [**.submitAndWait()**]
This function simply combines the [**.submit()**] and [**.wait()**] functions.  This is perhaps the simplest way to submit a job and retrieve the results.  Use this if you are only intereseted in results and do not wish to interact with the [**Job**] object.

```javascript
// Submit a job.
task.submitAndWait(taskParameters).then((results) => {
    // Do something with results.
    // This function is an example and is not provided by the SDK.
    AddToMap(results.OUTPUT_RASTER.best);
  }).catch((jobErrorMessage) => {
    // Display error.
  });
```

### Using Server Events
The [**Client**] and [**Job**] objects emits all job events related to that server.  These classes inheret from Node's [**EventEmitter**] and support methods such as .on(), .once(), .removeAllListeners(), etc.  The following example shows how to listen for job events.

```javascript
// GSF Client
const client = GSF.client({
    address: 'MyServer',
    port: '9191'
  });

// Set up an event listeners.
client.once('JobSucceeded', (data) => {
  console.log('Job Succeeded: ', data.jobId);
});

client.once('JobFailed', (data) => {
  console.log('Job Failed: ', data.jobId);
});

// Create a service object.
const service = client.service('ENVI');

// Create a task object.
const task = service.task('SpectralIndex');

const NDVIParameters = {
  inputParameters: {
    INPUT_RASTER: {
      FACTORY: 'URLRaster',
      URL: 'http://MyServer:9191/ese/data/qb_boulder_msi'
    },
    INDEX: 'Normalized Difference Vegetation Index'
  }
};

// Submit a job.
task.submit(NDVIParameters);
```

For a complete list of available events, please see the [**Client**] class documentation.

## Tracking Job Progress
There are two ways to track the progress of a single job.

### Progress Callbacks
The [**.submit()**] and [**.submitAndWait()**] functions support the inclusion of a progress callback for reporting job progress.

```javascript
const progressCallback = function (data) {
  console.log('Job progress percent: ', data.progress);
  console.log('Job progress message: ', data.message);
};

// Submit a job.
task.submitAndWait(parameters, progressCallback).then((results) => {
    // Do something with results.
    // This function is an example and is not provided by the SDK.
    AddToMap(results.OUTPUT_RASTER.best);
  }).catch((jobErrorMessage) => {
    // Display error.
  });
```

### Progress Events
Job progress events are emitted by the [**Client**] and [**Job**] objects.

#### Server Progress Events
It is possible to listen to all job progress events using the [**Client**] object.

```javascript
// GSF Client
const client = GSF.client({
    address: 'MyServer',
    port: '9191'
  });

// Set up an event listeners.
client.on('JobProgress', (data) => {
  console.log('Job ', data.jobId, ' progress percent: ', data.progress);
  console.log('Job ', data.jobId, ' progress message: ', data.message);
});

// Create a service object.
const service = client.service('ENVI');

// Create a task object.
const task = service.task('SpectralIndex');

const NDVIParameters = {
  inputParameters: {
    INPUT_RASTER: {
      FACTORY: 'URLRaster',
      URL: 'http://MyServer:9191/ese/data/qb_boulder_msi'
    },
    INDEX: 'Normalized Difference Vegetation Index'
  }
};

// Submit a job.
task.submit(NDVIParameters);
```

#### Job Progress Events
A [**Job**] object emits progress events for the particular job which it represents.

```javascript
// GSF Client
const client = GSF.client({
    address: 'MyServer',
    port: '9191'
  });

// Create a service object.
const service = client.service('ENVI');

// Create a task object.
const task = service.task('SpectralIndex');

const NDVIParameters = {
  inputParameters: {
    INPUT_RASTER: {
      FACTORY: 'URLRaster',
      URL: 'http://MyServer:9191/ese/data/qb_boulder_msi'
    },
    INDEX: 'Normalized Difference Vegetation Index'
  }
};

// Submit a job.
task.submit(NDVIParameters).then((job) => {
  // Set up an event listeners.
  job.on('Progress', (data) => {
    console.log('Job ', data.jobId, ' progress percent: ', data.progress);
    console.log('Job ', data.jobId, ' progress message: ', data.message);
  });
}).catch((jobErrorMessage) => {
  // Display error.
});
```

## Cancelling Jobs
Below is an example of cancelling a job based on its job ID.

```javascript
const myJobId = 1;
const job = new client.job(myJobId);
const force = false; // Do not force cancel.

// Cancel Job
job.cancel(force).then(() => {
  console.log('Cancel has been successfully requested.');
}).catch((err) => {
  // Display error.
});
```

## <a name="typescript"></a> Typescript Example
Below is an example of submitting a job using typescript.

```typescript
import * as GSF from 'gsf-js-client-sdk';

// Get a task.
const clientOptions: GSF.ClientOptions = {address: 'MyServer', port: '9191'};
const myClient: GSF.Client = GSF.client(clientOptions);
const ENVIService: GSF.Service = myClient.service('ENVI');
const myTask: GSF.Task = ENVIService.task('SpectralIndex');

const taskParameters: GSF.SubmitOptions = {
    inputParameters: {
        INPUT_RASTER: {
            FACTORY: 'URLRaster',
            URL: 'http://MyServer:9191/ese/data/qb_boulder_msi'
        },
        INDEX: 'Normalized Difference Vegetation Index'
    }
};

// Submit a job.
task.submitAndWait(taskParameters)
    .then((results: GSF.JobResults) => {
        // Do something with results.
        // This function is an example and is not provided by the SDK.
        AddToMap(results.OUTPUT_RASTER.best);
    }).catch((jobErrorMessage) => {
        // Display error.
    });
```

## <a name="bestPractices"></a> Best Practices
### Connecting to Servers
The examples throughout this documentation explain various concepts within the SDK using complete examples.  Most of the examples create a new 'GSF.client' object for every example.  This is to ensure a fully functional and self-contained example but is not a good practice when developing web apps.  It is recommended that you limit the number of Client (GSF.Client()) objects that you create.  Ideally, your app will create only one instance of this class and pass the reference around where needed.  This helps ensure consistency and prevent the possibility of exceeding the browser's per-domain connection limit.

[**.wait()**]:../class/src/Job.js~Job.html#instance-method-wait
[**.submitAndWait()**]:../class/src/Task.js~Task.html#instance-method-submitAndWait
[**.submit()**]:../class/src/Task.js~Task.html#instance-method-submit

[**Client**]:../class/src/Client.js~Client.html
[**Service**]:../class/src/Service.js~Service.html
[**Task**]:../class/src/Task.js~Task.html
[**Job**]:../class/src/Job.js~Job.html

[**EventEmitter**]:https://nodejs.org/api/events.html

[**Promise**]:https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
