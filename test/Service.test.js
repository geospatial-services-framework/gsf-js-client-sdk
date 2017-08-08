/**
 * Tests for the Service class.
 */
import { expect } from 'chai';

import { verifyProperties } from './utils/testUtils.js';
import interfaces from './utils/interfaces.js';
import testTasks from './utils/testTasks.js';
import config from './config/config.js';

import Service from '../src/Service';
import GSF from '../src/GSF';

let service;

/**
 * Begin tests
 */
 // Avoid using arrow functions with mocha:
 //  http://mochajs.org/#arrow-functions
describe('Testing Service class', function() {
  before(function(done) {
    const server = GSF.server(config.localHTTPServer);
    service = new Service(server, testTasks.ENVIService);
    done();
  });

  // ==========================================================
  describe('Service() constructor', function() {
    it('returns a valid service object', function(done) {
      expect(service).to.be.an('object');
      expect(service.name).to.equal(testTasks.ENVIService);
      done();
    });
  });

  describe('.info()', function() {
    it('returns the service information', function(done) {
      this.timeout(config.testTimeout2);

      service.info().then((info) => {
        expect(info).to.be.an('object');
        verifyProperties(info, interfaces.serviceInfo);
        expect(info.name).to.equal(testTasks.ENVIService);
        expect(info.tasks.length).to.be.above(2);
        done();
      }).catch((err) => {
        done(err);
      });
    });

    it('rejects promise if error from request', function(done) {
      this.timeout(config.testTimeout2);

      const badServer = GSF.server(config.fakeServer);
      const badService = new Service(badServer, testTasks.ENVIService);

      badService.info().then(() => {
        done('Expected promise to be reject.');
      }).catch((err) => {
        expect(err).to.exist;
        expect(err).to.be.a('string');
        done();
      });
    });
  });

  describe('.task()', function() {
    it('returns a task object', function(done) {
      expect(service.task(testTasks.taskPass.name)).to.be.an('object');
      done();
    });
  });

  describe('.taskInfoList()', function() {
    it('returns a list of task info objects', function(done) {
      this.timeout(config.testTimeout2);

      service.taskInfoList().then((taskInfoList) => {
        expect(taskInfoList).to.be.an.array;
        expect(taskInfoList.length).to.be.above(2);
        taskInfoList.forEach((info) => {
          verifyProperties(info, interfaces.taskInfo);
          expect(info.parameters).to.be.an.object;
          expect(info.parameters).to.not.be.an.array;
          const keys = Object.keys(info.parameters);
          expect(keys.length).to.be.greaterThan(2);
          keys.forEach((param) => {
            verifyProperties(info.parameters[param], interfaces.taskParameters);
          });
        });
        done();
      }).catch((err) => {
        done(err);
      });
    });

    it('rejects promise if error from request', function(done) {
      this.timeout(config.testTimeout2);

      const badServer = GSF.server(config.fakeServer);
      const badService = new Service(badServer, testTasks.ENVIService);

      badService.taskInfoList().then(() => {
        done('Expected promise to be rejected.');
      }).catch((err) => {
        expect(err).to.exist;
        expect(err).to.be.a('string');
        done();
      });
    });
  });

  describe('.tasks()', function() {
    it('returns array of task objects', function(done) {
      this.timeout(config.testTimeout2);

      service.tasks().then((tasks) => {
        expect(tasks).to.be.an.array;
        expect(tasks.length).to.be.above(2);
        expect(tasks[0]).to.be.an('object');
        expect(tasks[0].name).to.be.an('string');
        done();
      }).catch((err) => {
        done(err);
      });
    });

    it('rejects promise if error from request', function(done) {
      this.timeout(config.testTimeout2);

      const badServer = GSF.server(config.fakeServer);
      service = new Service(badServer, testTasks.ENVIService);

      service.tasks().then(() => {
        done('Expected promise to be reject.');
      }).catch((err) => {
        expect(err).to.exist;
        expect(err).to.be.a('string');
        done();
      });
    });

  });

});
