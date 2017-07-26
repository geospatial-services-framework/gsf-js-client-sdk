/**
 * Tests for the Task class.
 */
const expect = require('chai').expect;
const verifyProperties = require('./utils/testUtils.js').verifyProperties;
const Task = require('../src/Task');
const Service = require('../src/Service');
const GSF = require('../src/GSF');
const testTasks = require('./utils/testTasks.js');
const interfaces = require('./utils/interfaces.js');
const config = require('./config/config.js');

let task;
let server;

/**
 * Begin tests
 */
 // Avoid using arrow functions with mocha:
 //  http://mochajs.org/#arrow-functions
describe('Testing Task class', function() {
  before(function(done) {
    server = GSF.server(config.localHTTPServer);
    task = new Task(server.service(testTasks.sleepTask.service),
      testTasks.sleepTask.name);
    done();
  });

  // ==========================================================
  describe('Task() constructor', function() {
    it('returns a valid task object', function(done) {
      expect(task).to.be.an('object');
      expect(task.name).to.equal(testTasks.sleepTask.name);
      done();
    });
    it('has a valid service property', function(done) {
      expect(task).to.be.an('object');
      expect(task.service).to.be.an.instanceof(Service);
      done();
    });
  });

  describe('.info()', function() {
    it('retrieves the task information', function(done) {
      task.info().then((info) => {
        expect(info).to.be.an('object');
        const keys = Object.keys(info.parameters);
        expect(keys.length).to.be.above(2);
        verifyProperties(info, interfaces.taskInfo);
        done();
      }).catch((err) => {
        done(err);
      });
    });

    it('rejects promise if error from request', function(done) {
      this.timeout(config.testTimeout2);

      const badServer = GSF.server(config.fakeServer);
      const badTask = new Task(badServer.service(testTasks.sleepTask.service),
        testTasks.sleepTask.name);
      badTask.info().then((info) => {
        done('Expected promise to be rejected.');
      }).catch((err) => {
        expect(err).to.exist;
        expect(err).to.be.a('string');
        done();
      });
    });

  });

  describe('.submit()', function() {
    it('submits a job', function(done) {
      task.submit({parameters: testTasks.sleepTask.parameters}).then((job) => {
        expect(job).to.be.an('object');
        done();
      }).catch((err) => {
        done(err);
      });
    });

    it('submits a job with progress and started callbacks', function(done) {

      let startedCalled = false;
      let nProgressEvents = 0;
      const nProgress = 5;
      const progressMessage = 'Message';
      let params = testTasks.sleepTask.parameters;
      // let params = Object.assign({}, testTasks.sleepTask.parameters);
      params.N_PROGRESS = nProgress;
      params.SLEEP_TIME = 500;
      params.PROGRESS_MESSAGE = progressMessage;

      let sleepParams = params;
      sleepParams.SLEEP_TIME = 100;

      const progress = (data) => {
        expect(data.progress).to.be.a('number');
        expect(data.message).to.be.a('string');
        nProgressEvents++;
      };

      const started = () => {
        startedCalled = true;
      };

      // Submit a two jobs so we have one that gets queued.
      // That will ensure that there is a started event.
      // Workers needs to be set to 1 in the server config for this to pass.
      task.submit({parameters: params});
      task.submit({parameters: sleepParams}, progress, started)
        .then(job => job.wait())
        .then((result) => {
          expect(startedCalled).to.be.true;
          expect(nProgressEvents).to.equal(nProgress);
          done();
        }).catch((err) => {
          done(err);
        });
    });

    it('rejects promise if error from request', function(done) {
      this.timeout(config.testTimeout2);

      const badServer = GSF.server(config.fakeServer);
      const badTask = new Task(badServer.service(testTasks.sleepTask.service),
        testTasks.sleepTask.name);
      badTask.submit({parameters: testTasks.sleepTask.parameters})
        .then((job) => {
          done('Expected promise to be rejected.');
        }).catch((err) => {
          expect(err).to.be.a('string');
          done();
        });
    });

  });

  describe('.submitAndWait()', function() {
    it('submits a job and waits for results', function(done) {

      task.submitAndWait({parameters: testTasks.sleepTask.parameters})
        .then((results) => {
          expect(results).to.be.an('object');
          expect(results).to.deep.equal(testTasks.sleepTask.results);
          done();
        })
        .catch((err) => {
          done('Error submitting job: ' + err);
        });
    });

    it('submits a job and waits for results with progress and started callbacks', function(done) {
      let startedCalled = false;
      let nProgressEvents = 0;
      const nProgress = 5;
      const progressMessage = 'Message';
      let params = Object.assign({}, testTasks.sleepTask.parameters);
      params.N_PROGRESS = nProgress;
      params.SLEEP_TIME = 500;
      params.PROGRESS_MESSAGE = progressMessage;

      let sleepParams = params;
      sleepParams.SLEEP_TIME = 100;

      const progress = (data) => {
        expect(data.progress).to.be.a('number');
        expect(data.message).to.be.a('string');
        nProgressEvents++;
      };

      const started = () => {
        startedCalled = true;
      };

      // Submit a two jobs so we have one that gets queued.
      // That will ensure that there is a started event.
      // Workers needs to be set to 1 in the server config for this to pass.
      task.submit({parameters: params});
      task.submitAndWait({parameters: sleepParams}, progress, started)
        .then((result) => {
          expect(startedCalled).to.be.true;
          expect(nProgressEvents).to.equal(nProgress);
          done();
        }).catch((err) => {
          done(err);
        });

    });

    it('rejects promise if job fails', function(done) {
      task.submitAndWait({parameters: testTasks.sleepTaskFail.parameters})
        .then((result) => {
          done('Expected promise to be rejected.');
        })
        .catch((err) => {
          expect(err).to.be.a('string');
          expect(err).to.equal(testTasks.sleepTaskFail.parameters.ERROR_MESSAGE);
          done();
        });
    });

    it('submits multiple jobs with varying processing times', function(done) {
      let nProgressEvents1 = 0;
      let nProgressEvents2 = 0;
      const nProgress1 = 3;
      const nProgress2 = 12;


      const progressCallback1 = function(data) {
        expect(data.progress).to.be.a('number');
        expect(data.message).to.be.an('string');
        nProgressEvents1++;
      };

      const progressCallback2 = function(data) {
        expect(data.progress).to.be.a('number');
        expect(data.message).to.be.an('string');
        nProgressEvents2++;
      };

      let parameters1 = {parameters: testTasks.sleepTask.parameters};
      let parameters2 = JSON.parse(JSON.stringify(parameters1));
      parameters1.parameters.INPUT_INTEGER = 1;
      parameters1.parameters.N_PROGRESS = nProgress1;
      parameters1.parameters.SLEEP_TIME = 50;
      parameters2.parameters.INPUT_INTEGER = 2;
      parameters2.parameters.N_PROGRESS = nProgress2;
      parameters2.parameters.SLEEP_TIME = 350;

      const runJob1 = task.submitAndWait(parameters1, progressCallback1);
      const runJob2 = task.submitAndWait(parameters2, progressCallback2);

      Promise.all([runJob1, runJob2]).then((output) => {
        const results1 = output[0];
        const results2 = output[1];
        expect(results1).to.be.an('object');
        expect(results1).to.deep.equal({OUTPUT: 1});
        expect(results2).to.be.an('object');
        expect(results2).to.deep.equal({OUTPUT: 2});
        expect(nProgressEvents1).to.equal(nProgress1);
        expect(nProgressEvents2).to.equal(nProgress2);
        done();
      }).catch((err) => {
        done(err);
      });
    });

  });

});
