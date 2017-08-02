export default {
  serviceInfo: {
    name: {type: 'string'},
    description: {type: 'string'},
    tasks: {type: 'object'}
  },
  jobInfo: {
    jobId: {type: 'number'},
    jobStatus: {type: 'string'},
    jobStatusURL: {type: 'string'},
    jobProgress: {type: 'number'},
    jobProgressMessage: {type: 'string'},
    jobRoute: {type: 'string'},
    taskName: {type: 'string'},
    serviceName: {type: 'string'},
    jobErrorMessage: {type: 'string'},
    inputs: {type: 'object'},
    results: {type: 'object'},
    messages: {type: 'object'}
  },
  taskInfo: {
    name: {type: 'string'},
    parameters: {type: 'object'}
  },
  taskParameters: {
    name: {type: 'string'},
    dataType: {type: 'string'},
    parameterType: {type: 'string'}
  }
};
