export default {
  localHTTPServer: {
    protocol: 'http',
    address: 'localhost',
    APIRoot: '',
    port: 9191
  },
  fakeServer: {
    protocol: 'http',
    address: 'thisServerDoesNotExist',
    port: 9192
  },
  enviService: 'ENVI',
  submitTimeout: 100,
  testTimeout1: 5000,
  testTimeout2: 3000000
};
