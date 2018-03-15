/**
 * Tests for the Job class.
 */
import chai, {should} from 'chai';
import chaiThings from 'chai-things';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiThings);
chai.use(chaiAsPromised);
should();
const expect = chai.expect;
const assert = chai.assert;
import * as sinon from 'sinon';

import { verifyProperties } from './utils/testUtils.js';
import * as testTasks from './utils/testTasks.js';
import interfaces from './utils/interfaces.js';
import config from './config/config.js';

import GSF from '../src/GSF';
import Task from '../src/Task';
import Job from '../src/Job';

let client;

const TEST_JOB_ID = 1;

/**
 * Begin tests
 */
// Avoid using arrow functions with mocha:
//  http://mochajs.org/#arrow-functions
describe('Testing Job class', function() {
  before(function(done) {
    client = GSF.client(config.localHTTPServer);
    done();
  });

  afterEach(function(done) {
    client.removeAllListeners('JobProgress');
    done();
  });

  // ==========================================================
  describe('Job() constructor', function() {
    it('returns a valid job object', function(done) {
      const job = new Job(client, TEST_JOB_ID);
      expect(job).to.be.an('object');
      expect(job.jobId).to.equal(TEST_JOB_ID);
      done();
    });
  });

  describe('.jobInfo()', function() {
    it('retrieves the job information', function() {
      const task = new Task(client.service(testTasks.sleepTask.service),
        testTasks.sleepTask.name);

      let job = null;
      return task
        .submit({inputParameters: testTasks.sleepTask.parameters})
        .then((jobObj) => {
          job = jobObj;
          return job.wait();
        })
        .then(() => {
          return job
            .info()
            .then((jobInfo) => {
              expect(jobInfo).to.be.an('object');
              expect(jobInfo.jobResults).to.be.an.an('object');
              verifyProperties(jobInfo, interfaces.jobInfo);
              expect(jobInfo.jobStatus).to.equal('Succeeded');
              expect(jobInfo.jobResults).to.deep
                .equal(testTasks.sleepTask.results);
            });
        });
    });

    it('rejects promise if error from request', function() {
      this.timeout(config.testTimeout2);

      const job = GSF.client(config.fakeServer).job(TEST_JOB_ID);
      return assert.isRejected(job.info(),
        /Error requesting job info/);
    });

  });

  describe('.wait()', function() {
    it('waits for job completion', function() {
      this.timeout(config.testTimeout2);

      const wait = client
        .service(testTasks.sleepTask.service)
        .task(testTasks.sleepTask.name)
        .submit({inputParameters: testTasks.sleepTask.parameters})
        .then(job => job.wait());
      return Promise.all([
        expect(wait).to.eventually.be.fulfilled,
        expect(wait).to.eventually.be.an('Object'),
        expect(wait).to.eventually.deep.equal(testTasks.sleepTask.results)
      ]);
    });

    it('rejects promise if job fails', function() {
      this.timeout(config.testTimeout2);

      const wait = client
        .service(testTasks.sleepTaskFail.service)
        .task(testTasks.sleepTaskFail.name)
        .submit({inputParameters: testTasks.sleepTaskFail.parameters})
        .then(job => job.wait());

      return assert.isRejected(wait, /Task Failed/);
    });

  });

  describe('.cancel()', function() {
    it('cancels a job with kill=false', function(done) {
      this.timeout(config.testTimeout2);

      let params = Object.assign({}, {inputParameters: testTasks.sleepTask.parameters});
      params.SLEEP_TIME = 150;
      const task = new Task(client.service(testTasks.sleepTask.service), testTasks.sleepTask.name);
      task.submit(params)
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
            .catch(done);
        }).catch(done);
    });

    it('cancels job with kill=true', function(done) {
      this.timeout(config.testTimeout2);

      const task = new Task(client.service(testTasks.sleepTask.service),
        testTasks.sleepTask.name);
      const params = Object.assign({}, {inputParameters: testTasks.sleepTask.parameters});
      params.SLEEP_TIME = 350;
      task.submit(params)
        .then((job) => {
          const force = true;
          job.cancel(force)
            .then(() => {
              job.once('Completed', function(data) {
                expect(data.success).to.be.false;
                done();
              });
            })
            .catch(done);
        })
        .catch(done);
    });

    it('rejects promise if error from request', function() {
      this.timeout(config.testTimeout2);

      const badCancel = GSF
        .client(config.fakeServer)
        .job(1)
        .cancel(false);

      assert.isRejected(badCancel, /Task Failed/);
    });
  });

  describe('.on()', function() {
    describe('\'Started\' event', function() {
      it('fires when job starts', function() {

        const task = new Task(client.service(testTasks.sleepTask.service), testTasks.sleepTask.name);

        const params1 = Object.assign({}, {inputParameters: testTasks.sleepTask.parameters});
        params1.SLEEP_TIME = 800;

        const params2 = Object.assign({}, params1);
        params2.SLEEP_TIME = 0;

        const startedListener = sinon.spy();

        let job;
        task.submit(params1);
        return task
          .submit(params2)
          .then((jobObj) => {
            job = jobObj;
            job.on('Started', startedListener);
            return jobObj.wait();
          })
          .then((results) => {
            assert(startedListener.calledOnceWith({jobId: job.jobId}));
          });
      });
    });

    describe('\'Completed\' event', function() {
      it('fires when job completes', function() {
        let jobId = null;

        const completedListener = sinon.spy();

        return client
          .service(testTasks.sleepTask.service)
          .task(testTasks.sleepTask.name)
          .submit({inputParameters: testTasks.sleepTask.parameters})
          .then((job) => {
            job.on('Completed', completedListener);
            jobId = job.jobId;
            return job.wait();
          })
          .then((results) => {
            assert(completedListener.calledOnceWith({jobId: jobId, success: true}));
          });
      });
    });

    describe('\'Succeeded\' event', function() {
      it('fires when job succeeds', function() {

        const succeededListener = sinon.spy();
        const failedListener = sinon.spy();
        let jobId;
        return client
          .service(testTasks.sleepTask.service)
          .task(testTasks.sleepTask.name)
          .submit({inputParameters: testTasks.sleepTask.parameters})
          .then((job) => {
            jobId = job.jobId;
            job.on('Succeeded', succeededListener);
            job.on('Failed', failedListener);
            return job.wait();
          })
          .then((results) => {
            assert(succeededListener.calledOnceWith({jobId: jobId, success: true}));
            assert(failedListener.notCalled);
          });
      });
    });

    describe('\'Failed\' event', function() {
      it('fires when job fails', function() {
        const succeededListener = sinon.spy();
        const failedListener = sinon.spy();
        let jobId;
        return client
          .service(testTasks.sleepTask.service)
          .task(testTasks.sleepTask.name)
          .submit({inputParameters: testTasks.sleepTaskFail.parameters})
          .then((job) => {
            job.on('Succeeded', succeededListener);
            job.on('Failed', failedListener);
            jobId = job.jobId;
            return job.wait();
          })
          .catch(() => {
            return Promise.all([
              assert(failedListener.calledOnceWith({jobId: jobId, success: false})),
              assert(succeededListener.notCalled)
            ]);
          });
      });
    });

    describe('\'Progress\' event', function() {
      it('fires when job emits progress', function() {
        this.timeout(config.testTimeout2);

        let jobId = null;
        let testData = Object.assign({}, testTasks);
        const nProgress = 5;
        const progressMessage = 'Message';
        testData.sleepTask.parameters.N_PROGRESS = nProgress;
        testData.sleepTask.parameters.PROGRESS_MESSAGE = progressMessage;

        const progressListener = sinon.spy();
        const completedListener = sinon.spy();

        setTimeout(() => {
          return client
            .service(testTasks.sleepTask.service)
            .task(testTasks.sleepTask.name)
            .submit({inputParameters: testData.sleepTask.parameters})
            .then((job) => {
              jobId = job.jobId;
              job.on('Progress', progressListener);
              job.on('Completed', completedListener);
              return job.wait();
            })
            .then((results) => {
              expect(progressListener.callCount).to.equal(nProgress);
              assert(completedListener.calledOnce);
              const args = progressListener.args.map((arg) => (arg[0]));
              const progress = args.map((arg) => (arg.progress));

              (args).should.all.have.property('message', progressMessage);
              (args).should.all.have.property('jobId', jobId);
              (progress).should.all.have.be.above(-1);
              (progress).should.all.have.be.below(100);
            });
        }, config.submitTimeout);
      });
    });
  });

});
