/**
 * Tests for the Server class.
 */
const chai = require('chai');
chai
  .use(require('chai-things'))
  .use(require('chai-as-promised'));
/* eslint no-unused-vars: "off" */
const should = chai.should();
const expect = chai.expect;
const assert = chai.assert;

import * as sinon from 'sinon';

import * as testTasks from './utils/testTasks.js';
import config from './config/config.js';

import GSF from '../src/GSF';

let server;

/**
 * Begin tests
 */
// Avoid using arrow functions with mocha:
//  http://mochajs.org/#arrow-functions
describe('Testing Server class', function() {
  before(function(done) {
    server = GSF.server(config.localHTTPServer);
    done();
  });

  afterEach(function(done) {
    // Remove progress listeners after each test.  Other events use .once().
    server.removeAllListeners('JobAccepted');
    server.removeAllListeners('JobCompleted');
    server.removeAllListeners('JobSucceeded');
    server.removeAllListeners('JobFailed');
    server.removeAllListeners('JobProgress');
    done();
  });

  // =============================================================
  describe('Server() constructor', function() {
    it('returns a valid GSF object', function(done) {
      expect(server).to.be.an('object');
      expect(server.protocol).to.equal('http');
      expect(server.address).to.equal(config.localHTTPServer.address);
      expect(server.port).to.equal(config.localHTTPServer.port);
      expect(server.URL).to.be.a('string');
      expect(server.rootURL).to.be.a('string');
      done();
    });
  });

  describe('.services()', function() {
    it('retrieves the services', function() {
      // this.timeout(config.testTimeout2);
      this.timeout('900000');
      return server
        .services()
        .then((serviceList) => {
          expect(serviceList).to.be.an.array;
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
        .server(config.fakeServer);

      return assert.isRejected(badServer.services(),
        /Error requesting services/);
    });

  });

  describe('.jobs()', function() {
    // Note: This test could fail the first time
    // if running against
    // a brand new GSF server or one with a recently
    // flushed job database.
    it('retrieves a list of jobs', function() {
      this.timeout(config.testTimeout2);

      return server
        .jobs()
        .then((jobList) => {
          expect(jobList).to.be.an.array;
          expect(jobList.length).to.be.above(1);
          expect(jobList[0]).to.be.an('object');
          expect(jobList[0].jobId).to.exist;
          expect(jobList[0].jobId).to.be.a('number');
        });
    });
    // Note: This test could fail the first time
    // if running against
    // a brand new GSF server or one with a recently
    // flushed job database.
    it('retrieves a list of jobs with offset=1', function(done) {
      this.timeout(config.testTimeout1);

      const offset = 1;
      server.jobs()
        .then((jobList1) => {
          server.jobs({offset: offset})
            .then((jobList2) => {
              expect(jobList2).to.be.an.array;
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
    // a brand new GSF server or one with a recently
    // flushed job database.
    it('retrieves a list of jobs with status=Succeeded', function() {
      this.timeout(config.testTimeout1);

      const status = 'Succeeded';

      const jobList = server.jobs({status: status});

      return Promise.all([
        expect(jobList).to.eventually.be.fulfilled,
        expect(jobList).to.eventually.be.an('array'),
        expect(jobList).to.eventually.all.have.property('jobId')
      ]);

    });
    // Note: This test could fail the first time
    // if running against
    // a brand new GSF server or one with a recently
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

      server.jobs(filter1)
        .then((jobList1) => {
          server.jobs(filter2)
            .then((jobList2) => {
              expect(jobList2).to.be.an.array;
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
    // a brand new GSF server or one with a recently
    // flushed job database.
    it('retrieves a list of jobs with limit=10', function() {
      this.timeout(config.testTimeout2);

      const filter = {
        limit: 10
      };

      return server
        .jobs(filter)
        .then((jobList) => {
          expect(jobList).to.be.an.array;
          expect(jobList.length).to.be.above(1);
          expect(jobList.length).to.be.below(11);
          expect(jobList[0]).to.be.an('object');
          expect(jobList[0].jobId).to.exist;
          expect(jobList[0].jobId).to.be.a('number');
        });
    });

    it('rejects promise if error from request', function() {
      this.timeout(config.testTimeout2);

      const badServer = GSF.server(config.fakeServer);
      return assert.isRejected(badServer.jobs(),
        /Error requesting jobs/);
    });

  });

  describe('.service()', function() {
    it('returns a new service object', function(done) {
      const service = server.service(testTasks.sleepTask.service);
      expect(service).to.be.an('object');
      expect(service.name).to.equal(testTasks.sleepTask.service);
      done();
    });
  });

  describe('.job()', function() {
    it('creates a job object', function(done) {
      const jobId = 1;
      const job = server.job(jobId);
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
        server.on('JobAccepted', acceptedListener);

        // Use a timeout to prevent events firing before listeners
        // are added.
        setTimeout(() => {
          return server
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
        server.on('JobStarted', startedListener);

        // Use a timeout to prevent events firing before listeners
        // are added.
        setTimeout(() => {
          return server
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
        server.on('JobCompleted', completedListener);

        setTimeout(() => {
          return server
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
        server.on('JobFailed', failedListener);

        const completedListener = sinon.spy();
        server.on('JobCompleted', completedListener);

        const succeededListener = sinon.spy();
        server.on('JobSucceeded', succeededListener);

        setTimeout(() => {
          return server
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
        server.on('JobFailed', failedListener);

        const completedListener = sinon.spy();
        server.on('JobCompleted', completedListener);

        const succeededListener = sinon.spy();
        server.on('JobSucceeded', succeededListener);

        setTimeout(() => {
          return server
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
        server.on('JobProgress', progressListener);

        const completedListener = sinon.spy();
        server.on('JobCompleted', completedListener);

        setTimeout(() => {
          return server
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
