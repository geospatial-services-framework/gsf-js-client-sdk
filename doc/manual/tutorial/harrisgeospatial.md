
```
const GSF = require('gsf-js-client-sdk');

// GSF Client
const client = GSF.client({
    protocol: 'https',
    address: 'api.harrisgeospatial.com',
    APIRoot: 'create',
    headers: {
        apikey: '<YOUR_API_KEY>',
        'Accept-Version': 'v1b'
    }
});

// Get the ENVI service.
const service = client.service('ENVI');

// Get a task.
const task = service.task('SpectralIndex');

// The job options for azure storage requests
const jobOptionsAzure = {
    storage: {
        provider: 'Azure_BlockBlob',
        containerName: 'my-container',
        azureRoot: 'myroot',
        storageAccountOrConnectionString: '<CONNECTION_STRING>'
    }
};

// Use Landsat Open Data on AWS as input.
const submitOptions = {
    jobOptions: jobOptionsAzure,
    inputParameters: {
        INPUT_RASTER: {
        url: 's3://landsat-pds/L8/139/045/LC81390452014295LGN00/LC81390452014295LGN00_MTL.txt',
            factory: 'URLRaster',
            'dataset_index': 0
        },
        INDEX: 'Normalized Difference Vegetation Index'
    }
};

// Submit a job.
task.submitAndWait(submitOptions)
.then((results) => {
    // Do something with results.
}).catch((jobErrorMessage) => {
    // Display error.
});
```