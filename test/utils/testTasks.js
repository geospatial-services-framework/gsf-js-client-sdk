const TEST_DATA_URL = 'http://localhost:9191';
const TEST_DATA = TEST_DATA_URL + '/ese/data/qb_boulder_msi';

export default {
  ENVIService: 'ENVI',
  sleepTask: {
    service: 'javascript',
    name: 'Sleep',
    parameters: {
      INPUT_INTEGER: 42,
      SLEEP_TIME: 100,
      FAIL: false
    },
    results: {
      OUTPUT: 42
    }
  },
  sleepTaskFail: {
    service: 'javascript',
    name: 'Sleep',
    parameters: {
      INPUT_INTEGER: 42,
      SLEEP_TIME: 1000,
      FAIL: true,
      ERROR_MESSAGE: 'Task Failed'
    }
  },
  // This task should pass.
  taskPass: {
    service: 'ENVI',
    name: 'SpectralIndex',
    parameters: {
      INPUT_RASTER: {
        FACTORY: 'URLRaster',
        URL: TEST_DATA
      },
      INDEX: 'Normalized Difference Vegetation Index'
    }
  },
  // This task should fail.
  taskFail: {
    service: 'ENVI',
    name: 'SpectralIndex',
    parameters: {
      INPUT_RASTER: {
        FACTORY: 'URLRaster',
        URL: TEST_DATA
      },
      INDEX: 'fake index'
    }
  }
};
