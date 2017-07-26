# GSF JavaScript Client SDK
[![Build Status](https://travis-ci.org/geospatial-services-framework/gsf-js-client-sdk.svg?branch=master)](https://travis-ci.org/geospatial-services-framework/gsf-js-client-sdk)
[![npm Version](https://img.shields.io/npm/v/gsf-js-client-sdk.svg)](https://www.npmjs.com/package/gsf-js-client-sdk)

## About the SDK
The GSF JavaScript Client SDK provides a client-side JavaScript library for interacting with GSF.  The SDK may be used in the browser as well as Node.js.  For detailed information please visit our [full developer documentation] page.

1. This repository contains pre-built distributable files located in the `/dist/` directory.
    - `/dist/GSF.js` - The non-minified bundle.
    - `/dist/GSF.map.js` - The non-minified bundle source map file.
    - `/dist/GSF.min.js` - The minified bundle.
    - `/dist/GSF.min.js.map` - The minified bundle source map file.

## Installation
The SDK can be installed using [npm].

    $ npm install gsf-js-client-sdk --save

### Importing the SDK 
#### Using ECMAScript 2015 
- Import everything with GSF namespace:

  `import * as GSF from 'gsf-js-client-sdk';`

- Import specific classes:

  `import { Job, Task } from 'gsf-js-client-sdk';`

#### Using Node.js
-Require the SDK module:

  `const GSF = require('gsf-js-client-sdk');`

#### Script Tag
1. Include the GSF JavaScript Client SDK file in your project.  The example below assumes the SDK file is located next to your html file.

    `<script src="GSF.min.js"></script>`

2. Access the SDK using the global GSF object.

    `<script>console.log(GSF);</script>`

### Basic Example
1. Below is a simple example of running a job and retrieving the results.  You will need to update the server address and port below to reflect the server that you are using.

```javascript
// GSF Server
const server = GSF.server({
  address: 'MyServer',
  port: '9191'
});

// Create a service object.
const service = server.service('ENVI');

// Create a task object.
const task = service.task('SpectralIndex');

const NDVIParameters = {
  parameters: {
    INPUT_RASTER: {
      FACTORY: 'URLRaster',
      URL: 'http://MyServer:9191/ese/data/qb_boulder_msi'
    },
    INDEX: 'Normalized Difference Vegetation Index'
  }
};

// Submit a job.
task.submitAndWait(NDVIParameters).then((results) => {
    // Do something with results.
    AddToMap(results.OUTPUT_RASTER);
  }).catch((err) => {
    // Display error.
  });
```

#### TypeScript Example
Below is an example of submitting a job using typescript.

```typescript
import * as GSF from 'gsf-js-client-sdk';

// Get a task.
const serverArgs: GSF.ServerArgs = {address: 'MyServer', port: '9191'};
const myServer: GSF.Server = GSF.server(serverArgs);
const ENVIService: GSF.Service = myServer.service('ENVI');
const myTask: GSF.Task = ENVIService.task('SpectralIndex');

const taskParameters: GSF.SubmitOptions = {
    parameters: {
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
        AddToMap(results.OUTPUT_RASTER);
    }).catch((jobErrorMessage) => {
        // Display error.
    });
```

This is just a sample of what can be done with the SDK.  Please see our [full developer documentation] to learn more.

## Requirements
### Server Sent Events
The GSF JavaScript Client SDK relies on [server-sent events] for communication with the server.  Developers who wish to build apps that run on browsers lacking EventSource support will want to use a polyfill.  This is not necessary when using the SDK in Node.js.

To view a list of the browsers that support EventSource please go here: https://caniuse.com/#search=eventsource

There are several polyfills available that provide implementations of the EventSource API.  One such polyfill that is available from the npm and Bower package managers is called 'eventsource-polyfill'.  For information on installation and usage, see https://github.com/amvtek/EventSource.

## Developer Documentation
Please visit our [full developer documentation] page for more information.


[full developer documentation]: https://geospatial-services-framework.github.io/sdk-docs/
[npm]:http://npmjs.com
[server-sent events]:https://www.w3schools.com/html/html5_serversentevents.asp
