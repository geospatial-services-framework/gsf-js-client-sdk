/**
 * Tests for the Client class.
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
import interfaces from './utils/interfaces.js';
import * as testTasks from './utils/testTasks.js';
import config from './config/config.js';

import GSF from '../src/GSF';

let client;

/**
 * Begin tests
 */
// Avoid using arrow functions with mocha:
//  http://mochajs.org/#arrow-functions
describe('Testing Client class', function() {
  before(function(done) {
    client = GSF.client(config.localHTTPServer);
    done();
  });

  afterEach(function(done) {
    // Remove progress listeners after each test.  Other events use .once().
    client.removeAllListeners('JobAccepted');
    client.removeAllListeners('JobCompleted');
    client.removeAllListeners('JobSucceeded');
    client.removeAllListeners('JobFailed');
    client.removeAllListeners('JobProgress');
    done();
  });

  // =============================================================
  describe('Client() constructor', function() {
    it('returns a valid GSF object', function(done) {
      expect(client).to.be.an('object');
      expect(client.protocol).to.equal('http');
      expect(client.address).to.equal(config.localHTTPServer.address);
      expect(client.port).to.equal(config.localHTTPServer.port);
      expect(client.headers).to.equal(config.localHTTPServer.headers);
      expect(client.URL).to.be.a('string');
      expect(client.rootURL).to.be.a('string');
      done();
    });
    it('returns a valid GSF object with no headers', function(done) {
      const clientNoHead = GSF.client(config.localHTTPServerNoHeader);
      expect(clientNoHead).to.be.an('object');
      expect(clientNoHead.protocol).to.equal('http');
      expect(clientNoHead.address).to.equal(config.localHTTPServerNoHeader.address);
      expect(clientNoHead.port).to.equal(config.localHTTPServerNoHeader.port);
      expect(clientNoHead.headers).to.be.empty;
      expect(clientNoHead.URL).to.be.a('string');
      expect(clientNoHead.rootURL).to.be.a('string');
      done();
    });
  });

  describe('.services()', function() {
    it('retrieves the services', function() {
      // Use longer timeout if testing against real
      // server.
      this.timeout('900000');
      // this.timeout(config.testTimeout2);
      return client
        .services()
        .then((serviceList) => {
          expect(serviceList).to.be.an('array');
          expect(serviceList.length).to.be.above(1);
          expect(serviceList[0]).to.be.an('object');
          expect(serviceList.length).to.be.greaterThan(0);
          expect(serviceList[0].name).to.equal('IDL');
          expect(serviceList[1].name).to.equal('ENVI');
        });
    });

    it('rejects promise if error from request', function() {
      this.timeout(config.testTimeout2);

      const badServer = GSF
        .client(config.fakeServer);

      return assert.isRejected(badServer.services(),
        /Error requesting services/);
    });

  });

  describe('.jobs()', function() {
    // Note: This test could fail the first time
    // if running against
    // a brand new GSF client or one with a recently
    // flushed job database.
    it('retrieves a list of jobs', function() {
      this.timeout(config.testTimeout2);

      return client
        .jobs()
        .then((jobList) => {
          expect(jobList).to.be.an('array');
          expect(jobList.length).to.be.above(1);
          expect(jobList[0]).to.be.an('object');
          expect(jobList[0].jobId).to.exist;
          expect(jobList[0].jobId).to.be.a('number');
        });
    });
    // Note: This test could fail the first time
    // if running against
    // a brand new GSF client or one with a recently
    // flushed job database.
    it('retrieves a list of jobs with offset=1', function(done) {
      this.timeout(config.testTimeout1);

      const offset = 1;
      client.jobs()
        .then((jobList1) => {
          client.jobs({offset: offset})
            .then((jobList2) => {
              expect(jobList2).to.be.an('array');
              expect(jobList2[0].jobId).to.equal(jobList1[0].jobId + offset);
              done();
            }).catch((err) => {
              done(err);
            });
        })
        .catch((err) => {
          done(err);
        });
    });
    // Note: This test could fail the first time
    // if running against
    // a brand new GSF client or one with a recently
    // flushed job database.
    it('retrieves a list of jobs with status=Succeeded', function() {
      this.timeout(config.testTimeout1);

      const status = 'Succeeded';

      const jobList = client.jobs({status: status});

      return Promise.all([
        expect(jobList).to.eventually.be.fulfilled,
        expect(jobList).to.eventually.be.an('array'),
        expect(jobList).to.eventually.all.have.property('jobId')
      ]);

    });
    // Note: This test could fail the first time
    // if running against
    // a brand new GSF client or one with a recently
    // flushed job database.
    it('retrieves a list of jobs with reverse=true', function(done) {
      this.timeout(config.testTimeout1);

      const filter1 = {
        limit: 10,
        reverse: false
      };

      const filter2 = {
        limit: 10,
        reverse: true
      };

      client.jobs(filter1)
        .then((jobList1) => {
          client.jobs(filter2)
            .then((jobList2) => {
              expect(jobList2).to.be.an('array');
              expect(jobList1).to.not.equal(jobList2);
              expect(jobList1[0].jobId).to.be.below(jobList2[0].jobId);
              done();
            }).catch((err) => {
              done(err);
            });
        }).catch((err) => {
          done(err);
        });
    });
    // Note: This test could fail the first time
    // if running against
    // a brand new GSF client or one with a recently
    // flushed job database.
    it('retrieves a list of jobs with limit=10', function() {
      this.timeout(config.testTimeout2);

      const filter = {
        limit: 10
      };

      return client
        .jobs(filter)
        .then((jobList) => {
          expect(jobList).to.be.an('array');
          expect(jobList.length).to.be.above(1);
          expect(jobList.length).to.be.below(11);
          expect(jobList[0]).to.be.an('object');
          expect(jobList[0].jobId).to.exist;
          expect(jobList[0].jobId).to.be.a('number');
        });
    });

    it('rejects promise if error from request', function() {
      this.timeout(config.testTimeout2);

      const badclient = GSF.client(config.fakeServer);
      return assert.isRejected(badclient.jobs(),
        /Error requesting jobs/);
    });

  });

  describe('.jobInfoList()', function() {
    // Note: This test could fail the first time
    // if running against
    // a brand new GSF server or one with a recently
    // flushed job database.
    it('retrieves a list of jobs', function() {
      this.timeout(config.testTimeout2);
      return client
        .jobInfoList()
        .then((jobList) => {
          expect(jobList).to.be.an('array');
          expect(jobList.length).to.be.above(1);
          verifyProperties(jobList[0], interfaces.jobInfo);
        });
    });
    // Note: This test could fail the first time
    // if running against
    // a brand new GSF server or one with a recently
    // flushed job database.
    it('retrieves a list of jobs with offset=1', function() {
      this.timeout(config.testTimeout1);
      const offset = 1;
      return client
        .jobInfoList()
        .then((jobList1) => {
          return client
            .jobInfoList({offset: offset})
            .then((jobList2) => {
              expect(jobList2).to.be.an('array');
              expect(jobList2[0].jobId).to.equal(jobList1[0].jobId + offset);
            });
        });
    });
    // Note: This test could fail the first time
    // if running against
    // a brand new GSF server or one with a recently
    // flushed job database.
    it('retrieves a list of jobs with status=Succeeded', function() {
      this.timeout(config.testTimeout1);
      const status = 'Succeeded';
      return client
        .jobInfoList({status: status})
        .then((jobList) => {
          expect(jobList).to.be.an('array');
          expect(jobList.length).to.be.above(1);
        });
    });
    // Note: This test could fail the first time
    // if running against
    // a brand new GSF server or one with a recently
    // flushed job database.
    it('retrieves a list of jobs with reverse=true', function() {
      this.timeout(config.testTimeout1);

      const filter1 = {
        limit: 10,
        reverse: false
      };

      const filter2 = {
        limit: 10,
        reverse: true
      };

      return client
        .jobInfoList(filter1)
        .then((jobList1) => {
          return client
            .jobInfoList(filter2)
            .then((jobList2) => {
              expect(jobList2).to.be.an('array');
              expect(jobList1).to.not.equal(jobList2);
              expect(jobList1[0].jobId).to.be.below(jobList2[0].jobId);
            });
        });
    });
    // Note: This test could fail the first time
    // if running against
    // a brand new GSF server or one with a recently
    // flushed job database.
    it('retrieves a list of jobs with limit=10', function() {
      this.timeout(config.testTimeout2);

      const filter = {
        limit: 10
      };

      return client
        .jobInfoList(filter)
        .then((jobList) => {
          expect(jobList).to.be.an('array');
          expect(jobList.length).to.be.above(1);
          expect(jobList.length).to.be.below(11);
          expect(jobList[0]).to.be.an('object');
          expect(jobList[0].jobId).to.exist;
          expect(jobList[0].jobId).to.be.a('number');
        });
    });

    it('rejects promise if error from request', function() {
      this.timeout(config.testTimeout2);

      const badServer = GSF
        .client(config.fakeServer);

      return assert.isRejected(badServer.jobInfoList(),
        /Error requesting jobs/);
    });

  });

  describe('.service()', function() {
    it('returns a new service object', function(done) {
      const service = client.service(testTasks.sleepTask.service);
      expect(service).to.be.an('object');
      expect(service.name).to.equal(testTasks.sleepTask.service);
      done();
    });
  });

  describe('.job()', function() {
    it('creates a job object', function(done) {
      const jobId = 1;
      const job = client.job(jobId);
      expect(job).to.be.an('object');
      expect(job.jobId).to.equal(jobId);
      done();
    });
  });

  describe('.on()', function() {
    describe('\'JobAccepted\' event', function() {
      it('fires when job is accepted', function() {
        this.timeout(config.testTimeout2);

        const acceptedListener = sinon.spy();
        client.on('JobAccepted', acceptedListener);

        // Use a timeout to prevent events firing before listeners
        // are added.
        setTimeout(() => {
          return client
            .service(testTasks.sleepTask.service)
            .task(testTasks.sleepTask.name)
            .submitAndWait({inputParameters: testTasks.sleepTask.parameters})
            .then((results) => {
              assert(acceptedListener.calledOnce);
            });
        }, config.submitTimeout);
      });
    });

    describe('\'JobStarted\' event', function() {
      it('fires when job starts', function() {
        this.timeout(config.testTimeout2);

        const startedListener = sinon.spy();
        client.on('JobStarted', startedListener);

        // Use a timeout to prevent events firing before listeners
        // are added.
        setTimeout(() => {
          return client
            .service(testTasks.sleepTask.service)
            .task(testTasks.sleepTask.name)
            .submitAndWait({inputParameters: testTasks.sleepTask.parameters})
            .then((results) => {
              assert(startedListener.calledOnce);
            });
        }, config.submitTimeout);
      });
    });

    describe('\'JobCompleted\' event', function() {
      it('fires when job completes', function() {
        this.timeout(config.testTimeout2);

        let jobId = null;

        const completedListener = sinon.spy();
        client.on('JobCompleted', completedListener);

        setTimeout(() => {
          return client
            .service(testTasks.sleepTask.service)
            .task(testTasks.sleepTask.name)
            .submit({inputParameters: testTasks.sleepTask.parameters})
            .then((job) => {
              jobId = job.jobId;
              return job.wait();
            })
            .then((results) => {
              assert(completedListener.calledOnceWith({jobId: jobId, success: true}));
            });
        }, config.submitTimeout);

      });
    });

    describe('\'JobSucceeded\' event', function() {
      it('fires when job succeeds', function() {
        this.timeout(config.testTimeout2);

        let jobId = null;

        const failedListener = sinon.spy();
        client.on('JobFailed', failedListener);

        const completedListener = sinon.spy();
        client.on('JobCompleted', completedListener);

        const succeededListener = sinon.spy();
        client.on('JobSucceeded', succeededListener);

        setTimeout(() => {
          return client
            .service(testTasks.sleepTask.service)
            .task(testTasks.sleepTask.name)
            .submit({inputParameters: testTasks.sleepTask.parameters})
            .then((job) => {
              jobId = job.jobId;
              return job.wait();
            })
            .then((results) => {
              assert(failedListener.notCalled);
              assert(completedListener.calledOnce);
              assert(succeededListener.calledOnceWith({jobId: jobId, success: true}));
            });
        }, config.submitTimeout);
      });
    });

    describe('\'JobFailed\' event', function() {
      it('fires when job fails', function() {
        this.timeout(config.testTimeout2);

        let jobId = null;

        const failedListener = sinon.spy();
        client.on('JobFailed', failedListener);

        const completedListener = sinon.spy();
        client.on('JobCompleted', completedListener);

        const succeededListener = sinon.spy();
        client.on('JobSucceeded', succeededListener);

        setTimeout(() => {
          return client
            .service(testTasks.sleepTaskFail.service)
            .task(testTasks.sleepTaskFail.name)
            .submit({inputParameters: testTasks.sleepTaskFail.parameters})
            .then((job) => {
              jobId = job.jobId;
              return job.wait();
            }).catch((err) => {
              expect(err).to.equal('Task Failed');
              assert(succeededListener.notCalled);
              assert(completedListener.calledOnce);
              assert(failedListener.calledOnceWith({jobId: jobId, success: false}));
            });
        }, config.submitTimeout);
      });
    });

    describe('\'JobProgress\' event', function() {
      it('fires when job emits progress', function() {
        this.timeout(config.testTimeout2);

        let jobId = null;
        let testData = Object.assign({}, testTasks);
        const nProgress = 5;
        const progressMessage = 'Message';
        testData.sleepTask.parameters.N_PROGRESS = nProgress;
        testData.sleepTask.parameters.PROGRESS_MESSAGE = progressMessage;

        const progressListener = sinon.spy();
        client.on('JobProgress', progressListener);

        const completedListener = sinon.spy();
        client.on('JobCompleted', completedListener);

        setTimeout(() => {
          return client
            .service(testTasks.sleepTask.service)
            .task(testTasks.sleepTask.name)
            .submit({inputParameters: testData.sleepTask.parameters})
            .then((job) => {
              jobId = job.jobId;
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
