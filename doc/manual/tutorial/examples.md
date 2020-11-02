# Examples
Below are several examples of using the SDK with JavaScript.  For TypeScript specific examples see the [TypeScript example](#typescript).  Before using the SDK, it is also recommended that you read the [best practices](#bestPractices) section.

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

## List Jobs
The GSF [**Client**] object provides the ability to query and sort the job list.

### The 'query' option
The [**JobListOptions**] object supports an option called 'query'.  This can be used to form advanced queries of the job database.  The primary building block of a query is the comparison operator, which may be used to select jobs matching the desired criteria. The job search API supports the following comparison operators:
- $eq
- $gt
- $gte
- $lt
- $lte
- $ne

A simple query for any job that is not 'Succeeded':
```javascript
// GSF Client
const client = GSF.client({
    address: 'MyServer',
    port: '9191'
  });

const jobListOptions = {
  query: {
	  jobStatus: {
		  '$ne': 'Succeeded'
  	}
  },
};

// List jobs.
client.jobInfoList(jobListOptions).then((jobInfoList) => {
  // Print job list.
  console.log(jobInfoList);
}).catch((err) => {
  // There was an error.
});
```
### The 'sort' option
In addition to providing a query object, the [**JobListOptions**] also allows flexible sorting of the job list.  This field should be an array of sort arrays.  Multiple sort arrays may also be provided as the sorting will be evaluated from left to right.  Each field may be sorted in either ascending (1) or descending (-1) order.

Sort jobs by 'jobSubmitted' date in ascending order.
```javascript
// GSF Client
const client = GSF.client({
    address: 'MyServer',
    port: '9191'
  });

const jobListOptions = {
  sort: [ [ 'jobSubmitted', 1 ] ]
};

// List jobs.
client.jobInfoList(jobListOptions).then((jobInfoList) => {
  // Print job list.
  console.log(jobInfoList);
}).catch((err) => {
  // There was an error.
});
```

### Advanced query
This example shows all of the features of the job search API used together.  The job search below would return the 10 most recent failed Spectral Index jobs in the database.  For more information please see the [**JobListOptions**] object and the GSF Job Search API Tutorial.

```javascript
// GSF Client
const client = GSF.client({
    address: 'MyServer',
    port: '9191'
  });

const jobListOptions = {
  query: {
	  taskName: {
		  '$eq': 'SpectralIndex'
	  },
	  jobStatus: {
		  '$eq': 'Failed'
  	}
  },
  sort: [ [ 'jobSubmitted', -1 ] ],
  offset: 0,
  limit: 10,
  totals: 'all'
};

// List jobs.  This will result in an array of Job objects.
client.jobs(jobListOptions).then((jobList) => {
  // Print job list.
  console.log(jobList);
}).catch((err) => {
  // There was an error.
});

// List jobs.  This will result in a list of JobInfo object along with a count and totals.
client.jobInfoList(jobListOptions).then((jobInfoList) => {
  // Print job list.
  console.log(jobInfoList);
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
The SDK provides a [**Promise**]-based interface for submitting tasks.  If the task succeeds, the promise will be fulfilled.  If the job fails, the promise will be rejected.  There are two ways to use promises for job submission.

##### 1. Use [**.submit()**] and then [**.wait()**]
The [**Task**].[**submit()**] function returns a [**Promise**] to a [**Job**], and the [**Job**].[**wait()**] function returns a [**Promise**] to the JobResults.

```javascript
// Submit a job.
task.submit(taskParameters)
  .then(job => job.wait())
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
## List and Retrieve Workspace Files
The GSF [**Job**] object provides the ability to fetch a list of workspace files.  It is required that the 'enableNodeInfo' configuration is set to true on the server for job workspace access.

The task below, CustomTask, is a fictional task that writes a text file to the job workspace.  This also provides an example of using async/await instead of promises.
```javascript
const task = GSF.client({address:'MyServer',port:'9191'}).service('ENVI').task('CustomTask');

// Submit job.
const job = await task.submit({});

// Wait for job to complete.
await job.wait();

// Get the list of workspace files.
const workspaceFiles = await job.workspace();
console.log(workspaceFiles);
// prints:
// [
//   {
//     dev: 66311,
//     mode: 33204,
//     nlink: 1,
//     uid: 1000,
//     gid: 1000,
//     rdev: 0,
//     blksize: 4096,
//     ino: 11768910,
//     size: 18,
//     blocks: 8,
//     atimeMs: 1604352379848.0715,
//     mtimeMs: 1604352379848.0715,
//     ctimeMs: 1604352379848.0715,
//     birthtimeMs: 1604352379848.0715,
//     atime: "2020-11-02T21:26:19.848Z",
//     mtime: "2020-11-02T21:26:19.848Z",
//     ctime: "2020-11-02T21:26:19.848Z",
//     birthtime: "2020-11-02T21:26:19.848Z",
//     path: "file.txt"
//   }
// ]

// Retrieve the contents of a text file.
const fileBuffer = await job.file(workspaceFiles[0].path);
const textDecoder = new TextDecoder('utf-8');
const fileContents = textDecoder.decode(fileBuffer);
console.log(fileContents); // prints: Text file contents.
```

### Using Server Events
The [**Client**] and [**Job**] objects give you access to all job related events emitted by the server.  These classes inheret from Node's [**EventEmitter**] and support methods such as .on(), .once(), .removeAllListeners(), etc. The following example shows how to listen for job events on the [**Client**].

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

For a complete list of available events, see the [**Client**] class documentation.

## Tracking Job Progress
There are two ways to track the progress of a job.

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

#### Client Progress Events
It is possible to listen to all job progress events emitted by the server using the [**Client**] object.

```javascript
// GSF Client
const client = GSF.client({
    address: 'MyServer',
    port: '9191'
  });

// Set up an event listeners.
client.on('JobProgress', (data) => {
  console.log('Job: ', data.jobId, ' progress percent: ', data.progress);
  console.log('Job: ', data.jobId, ' progress message: ', data.message);
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
  // Set up an event listener on the job.
  job.on('JobProgress', (data) => {
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
The examples throughout this documentation explain various concepts within the SDK using complete examples.  Most of the examples create a new [**Client**] object for every example.  This is to ensure a fully functional and self-contained example but is not a good practice when developing web apps.  It is recommended that you limit the number of [**Client**] objects that you create.  Ideally, your app will create only one instance of this class and pass the reference around where needed.  This helps ensure consistency and prevent the possibility of exceeding the browser's per-domain connection limit.

[**.wait()**]:../class/src/Job.js~Job.html#instance-method-wait
[**wait()**]:../class/src/Job.js~Job.html#instance-method-wait
[**.submitAndWait()**]:../class/src/Task.js~Task.html#instance-method-submitAndWait
[**.submit()**]:../class/src/Task.js~Task.html#instance-method-submit
[**submit()**]:../class/src/Task.js~Task.html#instance-method-submit

[**Client**]:../class/src/Client.js~Client.html
[**JobListOptions**]:../typedef/index.html#static-typedef-JobListOptions
[**Service**]:../class/src/Service.js~Service.html
[**Task**]:../class/src/Task.js~Task.html
[**Job**]:../class/src/Job.js~Job.html

[**EventEmitter**]:https://nodejs.org/api/events.html

[**Promise**]:https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
