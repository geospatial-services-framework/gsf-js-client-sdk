# Migration Guide: Moving from v2 to v3
The gsf-javascript-client-sdk has undergone a number of changes for version 3.0.  This version is significant due to the adoption of a new HTTP API for GSF.  This means that if you upgrade your SDK to v3, you will also need to update your server(s) to GSF version 3.0. There are a number of breaking changes for the SDK user as a result of switching to the new API.

The purpose of this guide is to help you transition your application's source code from v2 to v3 of the SDK.

- Classes
    - [Server](#server-class)
    - [Service](#service-class)
    - [Task](#task-class)
    - [Job](#job-class)
- Types
    - [ServiceInfo](#serviceinfo)
    - [TaskInfo](#taskinfo)
    - [SubmitOptions](#submitoptions)
    - [JobInfo](#jobinfo)
    - [JobResults](#jobresults)

### Server Class
#### GSF.Server is now GSF.Client.
- The server class has been renamed to 'Client'.
- The 'ServerArgs' object is now referred to as 'ClientOptions'.

#### Client.APIRoot no longer defaults to 'ese'.
- The default APIRoot has been removed to align with the new HTTP API.

### Service Class
#### Service.info() no longer contains task list.
- See [ServiceInfo](#serviceinfo) below for details.

#### Service.taskInfoList() response changed.
- See [TaskInfo](#taskinfo) below for details.

### Task Class
#### Task.info() response changed.
- See [TaskInfo](#taskinfo) below for details.

#### Task.submit() and Task.submitAndWait() options changed.
- See [SubmitOptions](#submitoptions) for more details.

### Job Class
#### Job.info() response changed.
- See [JobInfo](#jobinfo) below for more details.

### Job.wait() response changed.
- See [JobResults](#jobresults) below for more details.

## Types

### TaskInfo
- Added 'serviceName'.
- Renamed 'name' to 'taskName'.
- Renamed '<parameter>.dataType' to '<parameter>.type'.
- Renamed '<parameter>.defaultValue' to '<parameter>.default'.
- Replaced 'parameters' with 'inputParameters' and 'outputParameters'.
- Removed '<parameter>.direction'
    - New 'inputParameter' and 'outputParameter' objects indicate direction in their name.

##### Example of TaskInfo in v2
```json
{
    "name": "ISODATAClassification",
    "displayName": "ISODATA Classification",
    "description": "This task clusters pixels in a dataset based on statistics only, without requiring you to define training classes.",
    "parameters": {
        "INPUT_RASTER": {
            "name": "INPUT_RASTER",
            "parameterType": "required",
            "displayName": "Input Raster",
            "description": "Specify a raster on which to perform unsupervised classification.",
            "direction": "INPUT",
            "dataType:": "ENVIRASTER"
        },
        "OUTPUT_RASTER": {
            "name": "OUTPUT_RASTER",
            "parameterType": "required",
            "displayName": "Output Raster",
            "description": "This is a reference to the output classification raster of filetype ENVI.",
            "direction": "OUTPUT",
            "dataType:": "ENVIRASTER"
        }
    }
}
```

##### Example of TaskInfo in v3
```json
{
    "taskName": "ISODATAClassification",
    "serviceName": "ENVI",
    "displayName": "ISODATA Classification",
    "description": "This task clusters pixels in a dataset based on statistics only, without requiring you to define training classes.",
    "inputParameters": [
        {
            "name": "INPUT_RASTER",
            "type": "ENVIRASTER",
            "required": true,
            "displayName": "Input Raster",
            "description": "Specify a raster on which to perform unsupervised classification."
        }
    ],
    "outputParameters": [
        {
            "name": "OUTPUT_RASTER",
            "type": "ENVIRASTER",
            "displayName": "Output Raster",
            "description": "This is a reference to the output classification raster of filetype ENVI.",
            "required": true
        }
    ]
}
```
For full documentation please see [**TaskInfo**]

### ServiceInfo
- Removed 'tasks'.
    - Please use Service.tasks() or Service.taskInfoList() to obtain task lists.

##### Example of ServiceInfo in v2
```json
{
    "name": "ENVI",
    "description": "ENVI processing routines",
    "tasks": [
        "Task1",
        "Task2",
        "Task3"
    ]
}
```

##### Example of ServiceInfo in v3
```json
{
    "name": "ENVI",
    "description": "ENVI processing routines"
}
```
For full documentation please see [**ServiceInfo**]

### SubmitOptions
- Added 'jobOptions' object.
    - 'route' was moved into the 'jobOptions' object.
    - Any additional processing directives will reside in the 'jobOptions' object.
- Renamed 'parameters' to 'inputParameters'.

##### Example of SubmitOptions in v2
```javascript
const submitOptions = {
  parameters: {
    INPUT_RASTER: {
      FACTORY: 'URLRaster',
      URL: '/some/url'
    },
    INDEX: 'Normalized Difference Vegetation Index'
  },
  route: "ENVIRoute"
};
```

##### Example of SubmitOptions in v3
```javascript
const submitOptions = {
  inputParameters: {
    INPUT_RASTER: {
      FACTORY: 'URLRaster',
      URL: '/some/url'
    },
    INDEX: 'Normalized Difference Vegetation Index'
  },
  jobOptions: {
      route: "ENVIRoute"
  }
};
```
For full documentation please see [**SubmitOptions**]

### JobInfo
- Added 'jobStart'.
- Added 'jobEnd'.
- Added 'jobSubmitted'.
- Added 'nodeInfo'.
- Added 'jobOptions'.
- Renamed 'inputs' to 'inputParameters'.
- Renamed 'jobErrorMessage' to 'jobError'.
- Renamed 'results' to 'jobResults'.
- Renamed 'jobProgressMessage' to 'jobMessage'.
- Removed 'jobRoute'.  This property is now in the 'jobOptions' object.
- Removed 'jobStatusUrl'.

##### Example of JobInfo in v2
```json
{
	"jobId": 3410,
	"jobStatus": "esriJobSucceeded",
	"jobStatusURL": "ese/jobs/3410/status",
	"jobProgress": 100,
	"jobProgressMessage": "Completed",
	"jobRoute": "default",
	"taskName": "SpectralIndex",
	"serviceName": "ENVI",
	"jobErrorMessage": "",
	"inputs": {
		"index": "Iron Oxide",
		"input_raster": {
			"url": "/some/url",
			"factory": "URLRaster"
		}
	},
	"results": [{
		"name": "OUTPUT_RASTER",
		"value": {
			"url": "http://myserver:9191/ese/jobs/3410/spectralindex_output_raster_MonJan2916080020181790684800.dat",
			"factory": "URLRaster",
			"auxiliary_url": [
				"http://myserver:9191/ese/jobs/3410/spectralindex_output_raster_MonJan2916080020181790684800.hdr"
			]
		}
	}],
	"messages": [{
			"type": "esriJobMessageTypeInformative",
			"description": "Submission Time: Mon Jan 29 2018 16:07:52 GMT-0700 (Mountain Standard Time)"
		},
		{
			"type": "esriJobMessageTypeInformative",
			"description": "Start Time: Mon Jan 29 2018 16:07:52 GMT-0700 (Mountain Standard Time)"
		},
		{
			"type": "esriJobMessageTypeInformative",
			"description": "End Time: Mon Jan 29 2018 16:08:01 GMT-0700 (Mountain Standard Time) (Elapsed Time: 8.818 seconds)"
		}
	]
}
```

##### Example of JobInfo in v3
```json
{
	"jobId": 3410,
	"jobProgress": 100,
	"jobMessage": "Completed",
	"jobStatus": "Succeeded",
	"taskName": "SpectralIndex",
	"serviceName": "ENVI",
	"inputParameters": {
		"index": "Iron Oxide",
		"input_raster": {
			"url": "/some/url",
			"factory": "URLRaster"
		}
	},
	"jobResults": {
		"OUTPUT_RASTER": {
			"best": {
				"url": "/some/url",
				"factory": "URLRaster",
				"auxiliary_url": [
					"/some/url"
				]
			},
			"ese-job-parameter-mapper": {
				"url": "/some/url",
				"factory": "URLRaster",
				"auxiliary_url": [
					"/some/url"
				]
			}
		}
	},
	"jobOptions": {
		"route": "default"
	},
	"jobSubmitted": "2018-01-29T23:07:52.992Z",
	"jobStart": "2018-01-29T23:07:52.995Z",
	"jobEnd": "2018-01-29T23:08:01.813Z"
}
```
For full documentation please see [**JobInfo**]

### JobResults
- Each parameter now contains all of the parameter mappings.  The highest ranked mapping is set to the 'best' key.

##### Example of JobResults in v2
```json
{
    "OUTPUT_RASTER": {
        "url": "/some/url",
        "factory": "URLRaster",
        "auxiliary_url": [
            "/some/url"
        ]
    }
}
```

##### Example of JobResults in v3
```json
{
    "OUTPUT_RASTER": {
        "best": {
            "url": "/some/url",
            "factory": "URLRaster",
            "auxiliary_url": [
                "/some/url"
            ]
        },
        "ese-job-parameter-mapper": {
            "url": "/some/url",
            "factory": "URLRaster",
            "auxiliary_url": [
                "/some/url"
            ]
        }
    }
}
```
For full documentation please see [**JobResults**]


[**ServiceInfo**]:../typedef/index.html#static-typedef-ServiceInfo
[**TaskInfo**]:../typedef/index.html#static-typedef-TaskInfo
[**SubmitOptions**]:../typedef/index.html#static-typedef-SubmitOptions
[**JobInfo**]:../typedef/index.html#static-typedef-JobInfo
[**JobResults**]:../typedef/index.html#static-typedef-JobResults