# Migration Guide: Moving from v2 to v3
The gsf-javascript-client-sdk has undergone a number of changes for version 3.0.  This version change is significant due to the adoption of a new HTTP API for GSF.  This means that if you upgrade your SDK to v3, you will also need to update your server to use the new API. There are a number of breaking changes for the SDK user as a result of switching to the new API.

The purpose of this guide is to help you transition your application's source code from v2 to v3 of the SDK.  The changes are broken down by class.

- Classes
    - [Server](#server-class)
    - [Service](#service-class)
    - [Task](#task-class)
    - [Job](#job-class)
- Interfaces
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
- See [ServiceInfo](#serviceinfo) for details.

#### Service.taskInfoList() returns new TaskInfo format.
- See [TaskInfo](#taskinfo) for details.

### Task Class
#### Task.info() response changed
- See [TaskInfo](#taskinfo) for details.

#### Task.submit() and Task.submitAndWait() options changed.
- The SubmitOptions have change slightly.  The 'parameters' key is now 'inputParameters'.  There is also a new 'jobOptions' key which now contains the route.  Any additional processing directives will reside in this 'JobOptions' object.  See [JobOptions] for more details.

### Job Class
#### Job.info() response changed.
- See [JobInfo](#jobinfo) for more details.

### Job.wait() response changed.
- See [JobResults](#jobresults) for more details.

## Interfaces

### TaskInfo
- Renamed 'name' to 'taskName'.
- Added 'serviceName'.
- Replaced 'parameters' with 'inputParameters' and 'outputParameters'.
- Removed '<parameter>.direction'
    - New 'inputParameter' and 'outputParameter' objects indicate direction in their name.
- Renamed '<parameter>.dataType' to '<parameter>.type'.
- Renamed '<parameter>.defaultValue' to '<parameter>.default'.

Example of TaskInfo in v2
```json
// TODO
```

Example of TaskInfo in v3
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
For full documention please see [**TaskInfo**]


### ServiceInfo
- Removed 'tasks'.
    - Please use Service.tasks() or Service.taskInfoList() to obtain task lists.

Example of ServiceInfo in v2
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

Example of ServiceInfo in v3
```json
{
    "name": "ENVI",
    "description": "ENVI processing routines"
}
```

### SubmitOptions
- Renamed 'parameters' to 'inputParameters'.
- Added 'jobOptions' object.
    - 'route' was moved into the 'jobOptions' object.
    - Any additional processing directives will reside in the 'jobOptions' object.

Example of SubmitOptions in v2
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

Example of SubmitOptions in v3
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

### JobInfo
- Added 'jobStart'.
- Added 'jobEnd'.
- Added 'jobSubmitted'.
- Added 'nodeInfo'.
- Added 'jobOptions'.
- Renamed 'inputs' to 'inputParameters'.
- ???Renamed 'messages' to 'jobError'.
- Renamed 'results' to 'jobResults'.
- Renamed 'jobProgressMessage' to 'jobMessage'.
- Removed 'jobRoute'.  This property is now in the 'jobOptions' object.
- Removed 'jobStatusUrl'.

Example of JobInfo in v2
```json
// TODO
```

Example of JobInfo in v3
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

### JobResults
- Each parameter now contains all of the parameter mappings.  The highest ranked mapping is set to the 'best' key.

Example of JobResults in v2
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

Example of JobResults in v3
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

// TODO: links to interfaces
[**TaskInfo**]:../typedef/src/GSF.js~GSF.html