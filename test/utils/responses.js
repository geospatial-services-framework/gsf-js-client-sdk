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
            {
              name: 'ThisTask',
              displayname: 'This Task',
              description: 'A task.',
              parameters: [
                {
                  name: 'PARAM1',
                  displayName: 'Param 1',
                  description: 'The first input parameter',
                  dataType: 'String',
                  default: 'foo',
                  direction: 'INPUT',
                  parameterType: 'required'
                },
                {
                  name: 'PARAM2',
                  displayName: 'Param 2',
                  description: 'The second input parameter',
                  dataType: 'String',
                  default: 'bar',
                  direction: 'INPUT',
                  parameterType: 'required'
                },
                {
                  name: 'PARAM3',
                  displayName: 'Param 3',
                  description: 'The output parameter',
                  dataType: 'String',
                  direction: 'OUTPUT',
                  parameterType: 'required'
                }
              ]
            },
            {
              name: 'ThatTask',
              displayname: 'This Task',
              description: 'A task.',
              parameters: [
                {
                  name: 'PARAM1',
                  displayName: 'Param 1',
                  description: 'The first input parameter',
                  dataType: 'String',
                  default: 'foo',
                  direction: 'INPUT',
                  parameterType: 'required'
                },
                {
                  name: 'PARAM2',
                  displayName: 'Param 2',
                  description: 'The second input parameter',
                  dataType: 'String',
                  default: 'bar',
                  direction: 'INPUT',
                  parameterType: 'required'
                },
                {
                  name: 'PARAM3',
                  displayName: 'Param 3',
                  description: 'The output parameter',
                  dataType: 'String',
                  direction: 'OUTPUT',
                  parameterType: 'required'
                }
              ]
            },
            {
              name: 'SomeTask',
              displayname: 'This Task',
              description: 'A task.',
              parameters: [
                {
                  name: 'PARAM1',
                  displayName: 'Param 1',
                  description: 'The first input parameter',
                  dataType: 'String',
                  default: 'foo',
                  direction: 'INPUT',
                  parameterType: 'required'
                },
                {
                  name: 'PARAM2',
                  displayName: 'Param 2',
                  description: 'The second input parameter',
                  dataType: 'String',
                  default: 'bar',
                  direction: 'INPUT',
                  parameterType: 'required'
                },
                {
                  name: 'PARAM3',
                  displayName: 'Param 3',
                  description: 'The output parameter',
                  dataType: 'String',
                  direction: 'OUTPUT',
                  parameterType: 'required'
                }
              ]
            }
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
