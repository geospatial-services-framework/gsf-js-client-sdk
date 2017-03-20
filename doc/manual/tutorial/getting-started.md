# Getting Started
# GSF JavaScript Client SDK

## About the SDK
The GSF JavaScript Client SDK provides a client-side JavaScript library for interacting with GSF.

1. This repository contains pre-built distributable files located in the `/dist/` directory.
  - `/dist/GSF.js` - The non-minified bundle.
  - `/dist/GSF.map.js` - The non-minified bundle source map file.
  - `/dist/GSF.min.js` - The minified bundle.
  - `/dist/GSF.min.js.map` - The minified bundle source map file.

## Basic Usage
1. Include the GSF JavaScript Client SDK in your project.  The example below assumes the SDK file is located next to your html file.

    `<script src="GSF.min.js"></script>`

2. Access the SDK using the global [**GSF**] object.

    `<script>console.log(GSF);</script>`

3. Below is a simple example of running a job and retrieving the results.  You will need to update the server address and port below to reflect the server that you are using.

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

## Requirements
The GSF JavaScript Client SDK relies on [server-sent events] for communication with the server.  Developers who wish to build apps that run on browsers lacking EventSource support may want to use a polyfill.

## Building the SDK
1. Clone the repository.

  $ git clone https://github.com/geospatial-services-framework/gsf-js-client-sdk

2. From the root directory of the project install the dependencies.

  $ npm install

3. Run the build script.

  $ npm run build

## Testing the SDK
#### Using a Test Server
We have provided a simple mock server implementation that can be used for very basic testing of the SDK.

  $ npm run unit-test

#### Using an Existing GSF Server
It is also possible to run the tests against a running GSF server.

  $ npm run test

## Building the Documentation
1. Build the documentation.

  $ npm run help

2. View the generated help files located in the `/help` directory (on Windows).

  $ start help/index.html

[**GSF**]:../class/src/GSF.js~GSF.html  
[server-sent events]:https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
