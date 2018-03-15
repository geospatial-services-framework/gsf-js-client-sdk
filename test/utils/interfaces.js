export default {
  serviceInfo: {
    name: {type: 'string', required: true},
    description: {type: 'string', required: false}
  },
  jobInfo: {
    serviceName: {type: 'string', required: true},
    taskName: {type: 'string', required: true},
    jobOptions: {type: 'object', required: false},
    inputParameters: {type: 'object', required: false},
    jobId: {type: 'number', required: true},
    jobProgress: {type: 'number', required: false},
    jobMessage: {type: 'string', required: false},
    jobStatus: {type: 'string', required: true},
    nodeInfo: {type: 'object', required: false},
    jobResults: {type: 'object', required: false},
    jobSubmitted: {type: 'string', required: false},
    jobStart: {type: 'string', required: false},
    jobEnd: {type: 'string', required: false},
    jobError: {type: 'string', required: false}
  },
  taskInfo: {
    taskName: {type: 'string', required: true},
    serviceName: {type: 'string', required: true},
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
