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
import sinon from 'sinon';

import testUtils from './utils/testUtils.js';
import testTasks from './utils/testTasks.js';
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

  describe('.info()', function() {
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
              testUtils.verifyProperties(jobInfo, interfaces.jobInfo);
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

  describe('.workspace()', function() {
    it('retrieves the job workspace', function() {
      this.timeout(config.testTimeout1);
      const { service, name, parameters } = testTasks.writeFilesTask;
      const task = new Task(client.service(service), name);
      const TEXT = 'testing text files';
      let job;
      return task
        .submit({inputParameters: {...parameters, TEXT}})
        .then((j) => {
          job = j;
          return job.wait();
        })
        .then(() => {
          return job
            .workspace()
            .then((workspace) => {
              expect(workspace).to.be.an('array');
              expect(workspace[0]).to.be.an('object');
              expect(workspace[0].path).to.be.a('string');
            });
        });
    });

    it('rejects promise if job does not exist', function() {
      const job = new Job(client, 'fakeId');
      return assert.isRejected(job.workspace(),
        /Error requesting job workspace/);
    });
  });

  describe('.file()', function() {
    afterEach(function() {
      // Cleanup
      const { service, name, parameters } = testTasks.cleanTask;
      const task = new Task(client.service(service), name);
      return task.submitAndWait({inputParameters: {...parameters}});
    });
    
    it('retrieves a binary file', function() {
      const { service, name, parameters } = testTasks.writeFilesTask;
      const task = new Task(client.service(service), name);
      const BYTE_LENGTH = 8;
      let job;
      return task
        .submit({inputParameters: {...parameters, BYTE_LENGTH}})
        .then((j) => {
          job = j;
          return job.wait();
        })
        .then(() => {
          return job
            .file('file.bin')
            .then((buffer) => {
              expect(buffer.byteLength).to.equal(BYTE_LENGTH);
            });
        });
    });

    it('retrieves a text file', function() {
      const { service, name, parameters } = testTasks.writeFilesTask;
      const task = new Task(client.service(service), name);
      const TEXT = 'testing text files';
      let job;
      return task
        .submit({inputParameters: {...parameters, TEXT}})
        .then((j) => {
          job = j;
          return job.wait();
        })
        .then(() => {
          return job
            .file('file.txt')
            .then((buffer) => {
              const enc = new TextDecoder('utf-8');
              const fileContents = enc.decode(buffer);
              expect(fileContents).to.be.a('string');
              expect(fileContents).to.equal(TEXT);
            });
        });
    });

    it('rejects promise if file does not exist', function() {
      const { service, name, parameters } = testTasks.writeFilesTask;
      const task = new Task(client.service(service), name);
      const TEXT = 'testing text files';
      let job;
      return task
        .submit({inputParameters: {...parameters, TEXT}})
        .then((j) => {
          job = j;
          return job.wait();
        })
        .then(() => {
          return assert.isRejected(job.file('thisDoesNotExist.txt'),
            /Error requesting file/);
        });
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
      params.inputParameters.SLEEP_TIME = 500;
      const task = new Task(client.service(testTasks.sleepTask.service), testTasks.sleepTask.name);
      task.submit(params)
        .then((job) => {
          const force = false;
          job.once('JobCompleted', (data) => {
            let err;
            try {
              expect(data.success).to.be.false;
            } catch (error) {
              err = error;
            }
            done(err);
          });
          job.cancel(force);

        }).catch(done);
    });

    it('cancels job with kill=true', function(done) {
      this.timeout(config.testTimeout2);

      const task = new Task(client.service(testTasks.sleepTask.service),
        testTasks.sleepTask.name);
      const params = Object.assign({}, {inputParameters: testTasks.sleepTask.parameters});
      params.inputParameters.SLEEP_TIME = 500;
      task.submit(params)
        .then((job) => {
          const force = true;
          job.on('JobCompleted', (data) => {
            let err;
            try {
              expect(data.success).to.be.false;
            } catch (error) {
              err = error;
            }
            done(err);
          });
          job.cancel(force);
        })
        .catch(done);
    });

    it('rejects promise if error from request', function() {
      this.timeout(config.testTimeout2);

      const badCancel = GSF
        .client(config.fakeServer)
        .job(1)
        .cancel(false);

      return assert.isRejected(badCancel, /Error cancelling job/);
    });
  });

  describe('.on()', function() {
    describe('\'JobStarted\' event', function() {
      it('fires when job starts', function() {
        this.timeout(config.testTimeout2);

        const task = new Task(client.service(testTasks.sleepTask.service), testTasks.sleepTask.name);

        const params1 = Object.assign({}, testTasks.sleepTask.parameters);
        params1.SLEEP_TIME = 800;

        const params2 = Object.assign({}, params1);
        params2.SLEEP_TIME = 0;

        const startedListener = sinon.spy();

        return task.submit({inputParameters: params1}).then((job1) => {

          // At this point, we are sure that the first job has been accepted
          // Submit the second job and verify we get the right callback
          let job2;
          return task
            .submit({inputParameters: params2})
            .then((jobObj) => {
              job2 = jobObj;
              job2.on('JobStarted', startedListener);
              return jobObj.wait();
            })
            .then((results) => {
              assert(startedListener.calledOnceWith({jobId: job2.jobId}));
            });
        });
      });
    });

    describe('\'JobCompleted\' event', function() {
      it('fires when job completes', function() {
        this.timeout(config.testTimeout1);
        let jobId = null;

        const completedListener = sinon.spy();

        return client
          .service(testTasks.sleepTask.service)
          .task(testTasks.sleepTask.name)
          .submit({inputParameters: testTasks.sleepTask.parameters})
          .then((job) => {
            job.on('JobCompleted', completedListener);
            jobId = job.jobId;
            return job.wait();
          })
          .then((results) => {
            assert(completedListener.calledOnceWith({jobId: jobId, success: true}));
          });
      });
    });

    describe('\'JobSucceeded\' event', function() {
      it('fires when job succeeds', function() {
        this.timeout(config.testTimeout1);

        const succeededListener = sinon.spy();
        const failedListener = sinon.spy();
        let jobId;
        return client
          .service(testTasks.sleepTask.service)
          .task(testTasks.sleepTask.name)
          .submit({inputParameters: testTasks.sleepTask.parameters})
          .then((job) => {
            jobId = job.jobId;
            job.on('JobSucceeded', succeededListener);
            job.on('JobFailed', failedListener);
            return job.wait();
          })
          .then((results) => {
            assert(succeededListener.calledOnceWith({jobId: jobId, success: true}));
            assert(failedListener.notCalled);
          });
      });
    });

    describe('\'JobFailed\' event', function() {
      it('fires when job fails', function() {
        this.timeout(config.testTimeout1);
        const succeededListener = sinon.spy();
        const failedListener = sinon.spy();
        let jobId;
        return client
          .service(testTasks.sleepTask.service)
          .task(testTasks.sleepTask.name)
          .submit({inputParameters: testTasks.sleepTaskFail.parameters})
          .then((job) => {
            job.on('JobSucceeded', succeededListener);
            job.on('JobFailed', failedListener);
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

    describe('\'JobProgress\' event', function() {
      it('fires when job emits progress', function() {
        this.timeout(config.testTimeout2);

        let jobId = null;
        const testData = Object.assign({}, testTasks);
        const nProgress = 5;
        const progressMessage = 'Message';
        testData.sleepTask.parameters.N_PROGRESS = nProgress;
        testData.sleepTask.parameters.PROGRESS_MESSAGE = progressMessage;

        const progressListener = sinon.spy();
        const completedListener = sinon.spy();

        return client
          .service(testTasks.sleepTask.service)
          .task(testTasks.sleepTask.name)
          .submit({inputParameters: testData.sleepTask.parameters})
          .then((job) => {
            jobId = job.jobId;
            job.on('JobProgress', progressListener);
            job.on('JobCompleted', completedListener);
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
      });
    });
  });

});
