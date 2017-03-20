module.exports = {
  services: {
    response: {
      services: [
        {
          name: 'IDL',
          tasks: []
        },
        {
          name: 'ENVI',
          tasks: [
            'ThisTask',
            'ThatTask',
            'SomeTask',
            'Sleep'
          ]
        }
      ]
    }
  },
  jobStatus: {
    response: {
      jobId: 1
    }
  },
  taskInfo: {
    name: 'task',
    parameters: [
      {
        name: 'param1',
        type: 'type',
        required: true
      },
      {
        name: 'param2',
        type: 'type',
        required: true
      },
      {
        name: 'param3',
        type: 'type',
        required: true
      }
    ]
  },
  jobList: [
    {
      jobId: 1,
      jobStatus: 'Failed'
    },
    {
      jobId: 2,
      jobStatus: 'Succeeded'
    },
    {
      jobId: 3,
      jobStatus: 'Succeeded'
    }
  ]
};
