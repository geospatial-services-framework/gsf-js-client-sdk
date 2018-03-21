/**
 * Tests for the Server class.
 */
import { expect } from 'chai';

import * as testTasks from './utils/testTasks.js';
import config from './config/config.js';
import { verifyProperties } from './utils/testUtils.js';
import interfaces from './utils/interfaces.js';

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
      expect(server.headers).to.equal(config.localHTTPServer.headers);
      expect(server.URL).to.be.a('string');
      expect(server.rootURL).to.be.a('string');
      done();
    });
    it('returns a valid GSF object with no headers', function(done) {
      const server = GSF.server(config.localHTTPServerNoHeader);
      expect(server).to.be.an('object');
      expect(server.protocol).to.equal('http');
      expect(server.address).to.equal(config.localHTTPServerNoHeader.address);
      expect(server.port).to.equal(config.localHTTPServerNoHeader.port);
      expect(server.headers).to.be.empty;
      expect(server.URL).to.be.a('string');
      expect(server.rootURL).to.be.a('string');
      done();
    });
  });

  describe('.services()', function() {
    it('retrieves the services', function(done) {
      this.timeout(config.testTimeout2);

      server.services()
        .then((serviceList) => {
          expect(serviceList).to.be.an.array;
          expect(serviceList.length).to.be.above(1);
          expect(serviceList[0]).to.be.an('object');
          expect(serviceList.length).to.be.greaterThan(0);
          expect(serviceList[0].name).to.equal('IDL');
          expect(serviceList[1].name).to.equal('ENVI');
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it('rejects promise if error from request', function(done) {
      this.timeout(config.testTimeout2);

      const badServer = GSF.server(config.fakeServer);
      badServer.services()
        .then((serviceList) => {
          // This shouldnt get called.
          done('Bad request was not rejected.');
        })
        .catch((err) => {
          expect(err).to.be.an('string');
          expect(err.length).to.be.above(1);
          done();
        });
    });

  });

  describe('.jobs()', function() {
    // Note: This test could fail the first time
    // if running against
    // a brand new GSF server or one with a recently
    // flushed job database.
    it('retrieves a list of jobs', function(done) {
      this.timeout(config.testTimeout2);

      server.jobs()
        .then((jobList) => {
          expect(jobList).to.be.an.array;
          expect(jobList.length).to.be.above(1);
          expect(jobList[0]).to.be.an('object');
          expect(jobList[0].jobId).to.exist;
          expect(jobList[0].jobId).to.be.a('number');
          done();
        })
        .catch((err) => {
          done(err);
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
        }).catch((err) => {
          done(err);
        });
    });
    // Note: This test could fail the first time
    // if running against
    // a brand new GSF server or one with a recently
    // flushed job database.
    it('retrieves a list of jobs with status=Succeeded', function(done) {
      this.timeout(config.testTimeout1);

      const status = 'Succeeded';
      server.jobs({status: status})
        .then((jobList) => {
          expect(jobList).to.be.an.array;
          expect(jobList.length).to.be.above(1);
          done();
        }).catch((err) => {
          done(err);
        });

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
    it('retrieves a list of jobs with limit=10', function(done) {
      this.timeout(config.testTimeout2);

      const filter = {
        limit: 10
      };

      server.jobs(filter)
        .then((jobList) => {
          expect(jobList).to.be.an.array;
          expect(jobList.length).to.be.above(1);
          expect(jobList.length).to.be.below(11);
          expect(jobList[0]).to.be.an('object');
          expect(jobList[0].jobId).to.exist;
          expect(jobList[0].jobId).to.be.a('number');
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it('rejects promise if error from request', function(done) {
      this.timeout(config.testTimeout2);

      const badServer = GSF.server(config.fakeServer);
      badServer.jobs()
        .then((jobList) => {
          // This shouldnt get called.
          done('Bad request was not rejected.');
        })
        .catch((err) => {
          expect(err).to.be.an('string');
          expect(err.length).to.be.above(1);
          done();
        });
    });

  });

  describe('.jobInfoList()', function() {
    // Note: This test could fail the first time
    // if running against
    // a brand new GSF server or one with a recently
    // flushed job database.
    it.only('retrieves a list of jobs', function(done) {
      this.timeout(config.testTimeout2);

      server.jobInfoList()
        .then((jobList) => {
          console.log('jobList: ', jobList);
          expect(jobList).to.be.an.array;
          expect(jobList.length).to.be.above(1);
          // verifyProperties(jobList[0], interfaces.)

          done();
        })
        .catch((err) => {
          done(err);
        });
    });
    // Note: This test could fail the first time
    // if running against
    // a brand new GSF server or one with a recently
    // flushed job database.
    it('retrieves a list of jobs with offset=1', function(done) {
      this.timeout(config.testTimeout1);

      const offset = 1;
      server.jobInfoList()
        .then((jobList1) => {
          server.jobInfoList({offset: offset})
            .then((jobList2) => {
              expect(jobList2).to.be.an.array;
              expect(jobList2[0].jobId).to.equal(jobList1[0].jobId + offset);
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
    it('retrieves a list of jobs with status=Succeeded', function(done) {
      this.timeout(config.testTimeout1);

      const status = 'Succeeded';
      server.jobInfoList({status: status})
        .then((jobList) => {
          expect(jobList).to.be.an.array;
          expect(jobList.length).to.be.above(1);
          done();
        }).catch((err) => {
          done(err);
        });

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

      server.jobInfoList(filter1)
        .then((jobList1) => {
          server.jobInfoList(filter2)
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
    it('retrieves a list of jobs with limit=10', function(done) {
      this.timeout(config.testTimeout2);

      const filter = {
        limit: 10
      };

      server.jobInfoList(filter)
        .then((jobList) => {
          expect(jobList).to.be.an.array;
          expect(jobList.length).to.be.above(1);
          expect(jobList.length).to.be.below(11);
          expect(jobList[0]).to.be.an('object');
          expect(jobList[0].jobId).to.exist;
          expect(jobList[0].jobId).to.be.a('number');
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it('rejects promise if error from request', function(done) {
      this.timeout(config.testTimeout2);

      const badServer = GSF.server(config.fakeServer);
      badServer.jobInfoList()
        .then((jobList) => {
          // This shouldnt get called.
          done('Bad request was not rejected.');
        })
        .catch((err) => {
          expect(err).to.be.an('string');
          expect(err.length).to.be.above(1);
          done();
        });
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
      it('fires when job is accepted', function(done) {
        this.timeout(config.testTimeout2);

        let jobAcceptedFired = false;

        server.once('JobAccepted', function(data) {
          jobAcceptedFired = true;
        });

        server.once('JobCompleted', function(data) {
          try {
            expect(jobAcceptedFired).to.be.true;
            done();
          } catch (e) {
            done(e);
          }
        });

        // Use a timeout to prevent events firing before listeners
        // are added.
        setTimeout(() => {
          server.service(testTasks.sleepTask.service)
            .task(testTasks.sleepTask.name)
            .submit({parameters: testTasks.sleepTask.parameters})
            .catch((err) => {
              done(err);
            });
        }, config.submitTimeout);
      });
    });

    describe('\'JobStarted\' event', function() {
      it('fires when job starts', function(done) {
        this.timeout(config.testTimeout2);

        let jobStartedFired = false;

        server.once('JobStarted', function(data) {
          jobStartedFired = true;
        });

        server.once('JobCompleted', function(data) {
          try {
            expect(jobStartedFired).to.be.true;
            done();
          } catch (e) {
            done(e);
          }
        });
        // Use a timeout to prevent events firing before listeners
        // are added.
        setTimeout(() => {
          server.service(testTasks.sleepTask.service)
            .task(testTasks.sleepTask.name)
            .submit({parameters: testTasks.sleepTask.parameters})
            .catch((err) => {
              done(err);
            });
        }, config.submitTimeout);
      });
    });

    describe('\'JobCompleted\' event', function() {
      it('fires when job completes', function(done) {
        this.timeout(config.testTimeout2);

        let jobId = null;

        server.once('JobCompleted', function(data) {
          try {
            if (data.jobId === jobId) {
              expect(data.success).to.be.true;
              done();
            }
          } catch (e) {
            done(e);
          }
        });
        // Use a timeout to prevent events firing before listeners
        // are added.
        setTimeout(() => {
          server.service(testTasks.sleepTask.service)
            .task(testTasks.sleepTask.name)
            .submit({parameters: testTasks.sleepTask.parameters})
            .then((job) => {
              jobId = job.jobId;
            })
            .catch((err) => {
              done(err);
            });
        }, config.submitTimeout);
      });
    });

    describe('\'JobSucceeded\' event', function() {
      it('fires when job succeeds', function(done) {
        this.timeout(config.testTimeout2);

        let failedEventCalled = false;
        let succeededEventCalled = false;
        let completedEventCalled = false;
        let jobId = null;

        let allDone = function() {
          if (succeededEventCalled && completedEventCalled) {
            done();
          }
        };

        server.once('JobFailed', function() {
          failedEventCalled = true;
        });

        server.once('JobSucceeded', function(data) {
          try {
            if (data.jobId === jobId) {
              expect(failedEventCalled).to.be.false;
              succeededEventCalled = true;
              allDone();
            }
          } catch (e) {
            done(e);
          }
        });

        server.once('JobCompleted', () => {
          completedEventCalled = true;
          allDone();
        });

        server.service(testTasks.sleepTask.service)
          .task(testTasks.sleepTask.name)
          .submit({parameters: testTasks.sleepTask.parameters})
          .then((job) => {
            jobId = job.jobId;
          })
          .catch((err) => {
            done(err);
          });
      });
    });

    describe('\'JobFailed\' event', function() {
      it('fires when job fails', function(done) {
        this.timeout(config.testTimeout2);

        let succeededEventCalled = false;
        let failedEventCalled = false;
        let completedEventCalled = false;
        let allDone = function() {
          if (failedEventCalled && completedEventCalled) {
            done();
          }
        };

        let jobId = null;

        server.once('JobSucceeded', function(data) {
          try {
            if (data.jobId === jobId) {
              succeededEventCalled = true;
            }
          } catch (e) {
            done(e);
          }
        });

        server.once('JobFailed', function(data) {
          try {
            if (data.jobId === jobId) {
              expect(data.jobId).to.be.a('number');
              expect(succeededEventCalled).to.be.false;
              failedEventCalled = true;
              allDone();
            }
          } catch (e) {
            done(e);
          }
        });

        server.once('JobCompleted', () => {
          completedEventCalled = true;
          allDone();
        });
        // Use a timeout to prevent events firing before listeners
        // are added.
        setTimeout(() => {
          server.service(testTasks.sleepTaskFail.service)
            .task(testTasks.sleepTaskFail.name)
            .submit({parameters: testTasks.sleepTaskFail.parameters})
            .then((job) => {
              jobId = job.jobId;
            })
            .catch((err) => {
              done(err);
            });
        }, config.submitTimeout);
      });
    });

    describe('\'JobProgress\' event', function() {
      it('fires when job emits progress', function(done) {
        this.timeout(config.testTimeout2);

        let testData = JSON.parse(JSON.stringify(testTasks));
        const nProgress = 5;
        const progressMessage = 'Message';
        testData.sleepTask.parameters.N_PROGRESS = nProgress;
        testData.sleepTask.parameters.PROGRESS_MESSAGE = progressMessage;

        let nProgressEvents = 0;
        let jobId = null;

        server.on('JobProgress', function(data) {
          try {
            if (data.jobId === jobId) {
              nProgressEvents++;
              expect(data.progress).to.exist;
              expect(data.progress).to.be.a('number');
              expect(data.progress).to.be.above(-1);
              expect(data.progress).to.be.below(100);
              expect(data.message).to.exist;
              expect(data.message).to.equal(progressMessage);
            }
          } catch (e) {
            done(e);
          }

        });

        server.once('JobCompleted', function(data) {

          try {
            if (data.jobId === jobId) {
              expect(nProgressEvents).to.equal(nProgress);
              done();
            }
          } catch (e) {
            done(e);
          }

        });
        // Use a timeout to prevent events firing before listeners
        // are added.
        setTimeout(() => {
          server.service(testTasks.sleepTask.service)
            .task(testTasks.sleepTask.name)
            .submit({parameters: testData.sleepTask.parameters})
            .then((job) => {
              jobId = job.jobId;
            })
            .catch((err) => {
              done(err);
            });
        }, config.submitTimeout);

      });
    });
  });

});
