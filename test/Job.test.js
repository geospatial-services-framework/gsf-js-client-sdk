/**
 * Tests for the Job class.
 */
import { expect } from 'chai';

import { verifyProperties } from './utils/testUtils.js';
import * as testTasks from './utils/testTasks.js';
import interfaces from './utils/interfaces.js';
import config from './config/config.js';

import GSF from 'GSF';
import Task from 'Task';
import Job from 'Job';

let server;

const TEST_JOB_ID = 1;

/**
 * Begin tests
 */
 // Avoid using arrow functions with mocha:
 //  http://mochajs.org/#arrow-functions
describe('Testing Job class', function() {
  before(function(done) {
    server = GSF.server(config.localHTTPServer);
    done();
  });

  afterEach(function(done) {
    server.removeAllListeners('JobProgress');
    done();
  });

  // ==========================================================
  describe('Job() constructor', function() {
    it('returns a valid job object', function(done) {
      const job = new Job(server, TEST_JOB_ID);
      expect(job).to.be.an('object');
      expect(job.jobId).to.equal(TEST_JOB_ID);
      done();
    });
  });

  describe('.jobInfo()', function() {
    it('retrieves the job information', function(done) {
      const task = new Task(server, testTasks.sleepTask.service,
        testTasks.sleepTask.name);
      task.submit({parameters: testTasks.sleepTask.parameters})
        .then((job) => {
          job.once('Completed', function(success) {
            job.info()
              .then((jobInfo) => {
                expect(jobInfo).to.be.an('object');
                expect(Array.isArray(jobInfo.results)).to.be.false;
                verifyProperties(jobInfo, interfaces.jobInfo);
                expect(jobInfo.jobStatus).to.equal('Succeeded');
                expect(jobInfo.results).to.deep
                  .equal(testTasks.sleepTask.results);
                done();
              }).catch((err) => {
                done('Error getting job info: ' + err);
              }).catch((err) => {
                done('Error submitting job: ' + err);
              });
          });
        });
    });

    it('rejects promise if error from request', function(done) {
      this.timeout(config.testTimeout2);

      const badServer = GSF.server(config.fakeServer);
      const job = new Job(badServer, TEST_JOB_ID);
      job.info()
        .then(() => {
          done('Expected promise to be rejected.');
        })
        .catch((err) => {
          expect(err).to.exist;
          expect(err).to.be.a('string');
          done();
        });
    });

  });

  describe('.wait()', function() {
    it('waits for job completion', function(done) {
      const task = new Task(server, testTasks.sleepTask.service, testTasks.sleepTask.name);
      task.submit({parameters: testTasks.sleepTask.parameters})
        .then(job => job.wait())
        .then((results) => {
          expect(results).to.be.an('object');
          expect(results).to.deep.equal(testTasks.sleepTask.results);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it('rejects promise if job fails', function(done) {
      this.timeout(config.testTimeout2);

      const task = new Task(server, testTasks.sleepTask.service, testTasks.sleepTask.name);
      task.submit({parameters: testTasks.sleepTaskFail.parameters})
        .then(job => job.wait())
        .then((result) => {
          done('Expected promise to be rejected.');
        })
        .catch((jobError) => {
          expect(jobError).to.be.a('string');
          expect(jobError).to.equal(testTasks.sleepTaskFail.parameters.ERROR_MESSAGE);
          done();
        });
    });

  });

  describe('.cancel()', function() {
    it('cancels a job with kill=false', function(done) {
      this.timeout(config.testTimeout2);

      let params = Object.assign({}, testTasks.sleepTask.parameters);
      params.SLEEP_TIME = 150;
      const task = new Task(server, testTasks.sleepTask.service, testTasks.sleepTask.name);
      task.submit({parameters: params})
        .then((job) => {
          const force = false;
          job.once('Completed', function(data) {
            expect(data.success).to.be.false;
            done();
          });
          job.cancel(force)
          .then((bool) => {
            expect(bool).to.be.true;
          })
          .catch((err) => {
            done('Error cancelling job: ' + err);
          });
        }).catch((err) => {
          done('Error submitting job: ' + err);
        });
    });

    it('cancels job with kill=true', function(done) {
      this.timeout(config.testTimeout2);

      const task = new Task(server, testTasks.sleepTask.service,
        testTasks.sleepTask.name);
      let params = Object.assign({}, testTasks.sleepTask.parameters);
      params.SLEEP_TIME = 150;
      task.submit({parameters: params})
        .then((job) => {
          const force = true;
          job.cancel(force).then(() => {
            job.once('Completed', function(data) {
              expect(data.success).to.be.false;
              done();
            });
          }).catch((err) => {
            done('Error cancelling job: ' + err);
          });
        }).catch((err) => {
          done('Error submitting job: ' + err);
        });
    });

    it('rejects promise if error from request', function(done) {

      this.timeout(config.testTimeout2);

      const badServer = GSF.server(config.fakeServer);
      const job = new Job(badServer, 1);
      job.cancel(false).then(() => {
        done('Expected promise to be rejected.');
      }).catch((err) => {
        expect(err).to.exist;
        expect(err).to.be.a('string');
        done();
      });
    });
  });

  describe('.on()', function() {
    describe('\'Started\' event', function() {
      it('fires when job starts', function(done) {
        let jobStartedFired = true;

        const task = new Task(server, testTasks.sleepTask.service, testTasks.sleepTask.name);
        task.submit({parameters: testTasks.sleepTask.parameters});

        let params = Object.assign({}, testTasks.sleepTask.parameters);
        params.SLEEP_TIME = 500;

        let sleepParams = params;
        sleepParams.SLEEP_TIME = 100;

        // Submit a two jobs so we have one that gets queued.
        // That will ensure that there is a started event.
        // Workers needs to be set to 1 in the server config for this to pass.
        task.submit({parameters: params});
        task.submit({parameters: sleepParams})
          .then((job) => {
            job.once('Started', function(data) {
              try {
                expect(data.jobId).to.equal(job.jobId);
                jobStartedFired = true;
              } catch (e) {
                done(e);
              }
            });

            job.once('Completed', function(data) {
              try {
                expect(data.jobId).to.equal(job.jobId);
                expect(jobStartedFired).to.be.true;
                done();
              } catch (e) {
                done(e);
              }
            });

          }).catch((err) => {
            done(err);
          });
      });
    });

    describe('\'Completed\' event', function() {
      it('fires when job completes', function(done) {
        const task = new Task(server, testTasks.sleepTask.service, testTasks.sleepTask.name);
        task.submit({parameters: testTasks.sleepTask.parameters})
        .then((job) => {
          job.once('Completed', function(data) {
            try {
              expect(data.success).to.be.true;
              done();
            } catch (e) {
              done(e);
            }

          });
        }).catch((err) => {
          done('Error submitting job: ' + err);
        });
      });
    });

    describe('\'Succeeded\' event', function() {
      it('fires when job succeeds', function(done) {
        let failedEventCalled = false;
        const task = new Task(server, testTasks.sleepTask.service,
          testTasks.sleepTask.name);
        task.submit({parameters: testTasks.sleepTask.parameters})
        .then((job) => {
          job.once('Failed', function(data) {
            failedEventCalled = true;
          });
          job.once('Succeeded', function(data) {
            try {
              expect(failedEventCalled).to.be.false;
              done();
            } catch (e) {
              done(e);
            }

          });
        }).catch((err) => {
          done('Error submitting job: ' + err);
        });
      });
    });

    describe('\'Failed\' event', function() {
      it('fires when job fails', function(done) {
        let succeededEventCalled = false;
        const task = new Task(server, testTasks.sleepTaskFail.service,
          testTasks.sleepTaskFail.name);
        task.submit({parameters: testTasks.sleepTaskFail.parameters})
        .then((job) => {
          job.once('Succeeded', function(data) {
            succeededEventCalled = true;
          });
          job.once('Failed', function(data) {
            try {
              expect(data).to.exist;
              expect(data).to.be.an('object');
              expect(succeededEventCalled).to.be.false;
              done();
            } catch (e) {
              done(e);
            }

          });
        }).catch((err) => {
          done('Error submitting job: ' + err);
        });
      });
    });

    describe('\'Progress\' event', function() {
      it('fires when job emits progress', function(done) {
        this.timeout(config.testTimeout2);

        let nProgressEvents = 0;
        let testData = testTasks;
        const nProgress = 5;
        const progressMessage = 'Message';
        testData.sleepTask.parameters.N_PROGRESS = nProgress;
        testData.sleepTask.parameters.PROGRESS_MESSAGE = progressMessage;

        const task = new Task(server, testTasks.sleepTask.service,
          testTasks.sleepTask.name);
        task.submit({parameters: testTasks.sleepTask.parameters})
        .then((job2) => {
          job2.on('Progress', function(data) {
            try {
              nProgressEvents++;
              expect(data.progress).to.exist;
              expect(data.progress).to.be.a('number');
              expect(data.progress).to.be.above(-1);
              expect(data.progress).to.be.below(100);
              expect(data.message).to.exist;
              expect(data.message).to.equal(progressMessage);
            } catch (e) {
              done(e);
            }

          });
          job2.once('Succeeded', function(data) {
            try {
              expect(nProgressEvents).to.equal(nProgress);
              done();
            } catch (e) {
              done(e);
            }

          });
          job2.once('Failed', function(data) {
            done('Failed');
          });

        }).catch((err) => {
          done('Error submitting job: ' + err);
        });
      });
    });
  });

});
