export default {
  serviceInfo: {
    name: {type: 'string', required: true},
    description: {type: 'string', required: false}
  },
  jobInfo: {
    serviceName: {type: 'string', required: true},
    taskName: {type: 'string', required: true},
    jobOptions: {type: 'object', required: true},
    inputParameters: {type: 'object', required: true},
    jobId: {type: 'number', required: true},
    jobProgress: {type: 'number', required: true},
    // jobMessage: {type: 'string', required: true},
    jobStatus: {type: 'string', required: true},
    // nodeInfo: {type: 'object', required: true},
    jobResults: {type: 'object', required: true},
    jobSubmitted: {type: 'string', required: true},
    jobStart: {type: 'string', required: true},
    jobEnd: {type: 'string', required: true}
    // jobError: {type: 'string', required: false}
  },
  taskInfo: {
    taskName: {type: 'string', required: true},
    // serviceName: {type: 'string', required: true},
    displayName: {type: 'string', required: false},
    description: {type: 'string', required: false},
    inputParameters: {type: 'object', required: true},
    outputParameters: {type: 'object', required: true}
  },
  taskParameters: {
    name: {type: 'string', required: true},
    displayName: {type: 'string', required: false},
    description: {type: 'string', required: false},
    type: {type: 'string', required: true},
    required: {type: 'boolean', required: true},
    choiceList: {type: 'object', required: false}
  }
};
