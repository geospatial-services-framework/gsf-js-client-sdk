# Getting Started
# GSF JavaScript Client SDK

## About the SDK
The GSF JavaScript Client SDK provides a client-side JavaScript library for interacting with GSF.  The SDK works in both the browser and Node.js.

1. This repository contains pre-built distributable files located in the `/dist/` directory.
  - `/dist/GSF-node.js` - The Node.js bundle.
  - `/dist/GSF-node.js.map` - The Node.js bundle source map.
  - `/dist/GSF.js` - The non-minified web bundle.
  - `/dist/GSF.js.map` - The non-minified web bundle source map file.
  - `/dist/GSF.min.js` - The minified web bundle.
  - `/dist/GSF.min.js.map` - The minified web bundle source map file.

## Basic Usage
### Importing the SDK 
#### Using ECMAScript 2015 
- Import everything with GSF namespace:

  `import * as GSF from 'gsf-js-client-sdk';`

- Import specific classes:

  `import { Job, Task } from 'gsf-js-client-sdk';`

#### Using Node.js
- Require the SDK:

  `const GSF = require('gsf-js-client-sdk/dist/GSF-node');`

### Including the SDK with a Script Tag
1. Include the GSF JavaScript Client SDK in your project.  The example below assumes the SDK file is located next to your html file.

    `<script src="GSF.min.js"></script>`

2. Access the SDK using the global [**GSF**] object.

    `<script>console.log(GSF);</script>`

3. Below is a simple example of running a job and retrieving the results.  You will need to update the server address and port below to reflect the server that you are using.

```javascript
const myAddress = 'MyServer';
const myPort = 9191;

// GSF Server
const server = GSF.server({
  address: myAddress,
  port: myPort
  });

// Create a service object.
const service = server.service('ENVI');

// Create a task object.
const task = service.task('SpectralIndex');

const NDVIParameters = {
  parameters: {
    INPUT_RASTER: {
      FACTORY: 'URLRaster',
      URL: 'http://' + myAddress + ':' + myPort + '/ese/data/qb_boulder_msi'
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

## Requirements
### Server Sent Events
The GSF JavaScript Client SDK relies on [server-sent events] for communication with the server.  Developers who wish to build apps that run on browsers lacking EventSource support will want to use a polyfill.  This is not necessary when using the SDK in Node.js.

To view a list of the browsers that support EventSource please go here: https://caniuse.com/#search=eventsource

There are several polyfills available that provide implementations of the EventSource API.  One such polyfill that is available from the npm and Bower package managers is called 'eventsource-polyfill'.  For information on installation and usage, see https://github.com/amvtek/EventSource.

## Building the SDK
1. Clone the repository.

  $ git clone https://github.com/geospatial-services-framework/gsf-js-client-sdk

2. From the root directory of the project install the dependencies.

  $ npm install

3. Run the build script.

  $ npm run build

## Testing the SDK
#### Using a Test Server
We have provided a simple mock server implementation that can be used for very basic testing of the SDK.  There are several other test scripts available.  Please see the scripts section of the package.json file for more information.

##### Run tests in the browser against mock server.

  $ npm run test

##### Run tests in Node.js against mock server.

  $ npm run test-node

## Building the Documentation
1. Build the documentation.

  $ npm run help

2. View the generated help files located in the `/help` directory (on Windows).

  $ start help/index.html

[**GSF**]:../class/src/GSF.js~GSF.html  
[server-sent events]:https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
