module.exports = {
  listServices: {
    services: [
      {
        name: 'IDL',
        description: 'IDL processing routines'
      },
      {
        name: 'ENVI',
        description: 'ENVI processing routines'
      }
    ]
  },
  jobStatus: {
    response: {
      jobId: '1'
    }
  },
  taskInfo: {
    taskName: 'task',
    serviceName: 'ThisService',
    inputParameters: [
      {
        name: 'param1',
        type: 'String',
        required: true
      },
      {
        name: 'param2',
        type: 'String',
        required: true
      }
    ],
    outputParameters: [
      {
        name: 'param3',
        type: 'String',
        required: true
      }
    ]
  },
  taskList: [
    {
      taskName: 'ThisTask',
      serviceName: 'ThisService',
      displayname: 'This Task',
      description: 'A task.',
      inputParameters: [
        {
          name: 'PARAM1',
          displayName: 'Param 1',
          description: 'The first input parameter',
          type: 'String',
          default: 'foo',
          required: true
        },
        {
          name: 'PARAM2',
          displayName: 'Param 2',
          description: 'The second input parameter',
          type: 'String',
          default: 'bar',
          required: true
        }
      ],
      outputParameters: [
        {
          name: 'PARAM3',
          displayName: 'Param 3',
          description: 'The output parameter',
          type: 'String',
          required: true
        }
      ]
    },
    {
      taskName: 'ThatTask',
      displayname: 'This Task',
      serviceName: 'ThisService',
      description: 'A task.',
      inputParameters: [
        {
          name: 'PARAM1',
          displayName: 'Param 1',
          description: 'The first input parameter',
          type: 'String',
          default: 'foo',
          required: true
        },
        {
          name: 'PARAM2',
          displayName: 'Param 2',
          description: 'The second input parameter',
          type: 'String',
          default: 'bar',
          required: true
        }
      ],
      outputParameters: [
        {
          name: 'PARAM3',
          displayName: 'Param 3',
          description: 'The output parameter',
          type: 'String',
          required: true
        }
      ]
    },
    {
      taskName: 'SomeTask',
      displayname: 'This Task',
      serviceName: 'ThisService',
      description: 'A task.',
      inputParameters: [
        {
          name: 'PARAM1',
          displayName: 'Param 1',
          description: 'The first input parameter',
          type: 'String',
          default: 'foo',
          required: true
        },
        {
          name: 'PARAM2',
          displayName: 'Param 2',
          description: 'The second input parameter',
          type: 'String',
          default: 'bar',
          required: true
        }
      ],
      outputParameters: [
        {
          name: 'PARAM3',
          displayName: 'Param 3',
          description: 'The output parameter',
          type: 'String',
          required: true
        }
      ]
    }
  ],
  jobList: [
    {
      jobId: '1',
      jobStatus: 'Failed',
      jobError: 'job failed',
      jobInfo: {},
      taskName: 'task1',
      serviceName: 'service1'
    },
    {
      jobId: '2',
      jobStatus: 'Succeeded',
      jobInfo: {},
      taskName: 'task1',
      serviceName: 'service1'
    },
    {
      jobId: '3',
      jobStatus: 'Succeeded',
      jobInfo: {},
      taskName: 'task1',
      serviceName: 'service1'
    }
  ]
};
