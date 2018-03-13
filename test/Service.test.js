/**
 * Tests for the Service class.
 */
const chai = require('chai');
chai
  .use(require('chai-things'))
  .use(require('chai-as-promised'));
/* eslint no-unused-vars: "off" */
const should = chai.should();
const expect = chai.expect;
const assert = chai.assert;

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
    const client = GSF.client(config.localHTTPServer);
    service = new Service(client, testTasks.ENVIService);
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
    it('returns the service information', function() {
      this.timeout(config.testTimeout2);
      return service
        .info()
        .then((info) => {
          expect(info).to.be.an('object');
          verifyProperties(info, interfaces.serviceInfo);
          expect(info.name).to.equal(testTasks.ENVIService);
        });
    });

    it('rejects promise if error from request', function() {
      this.timeout(config.testTimeout2);

      const badInfo = GSF
        .client(config.fakeServer)
        .service(testTasks.ENVIService)
        .info();

      return assert.isRejected(badInfo, /Error requesting service info/);
    });
  });

  describe('.task()', function() {
    it('returns a task object', function(done) {
      expect(service.task(testTasks.taskPass.name)).to.be.an('object');
      done();
    });
  });

  describe('.taskInfoList()', function() {
    it('returns a list of task info objects', function() {
      this.timeout(config.testTimeout2);

      return service
        .taskInfoList()
        .then((taskInfoList) => {
          expect(taskInfoList).to.be.an.array;
          expect(taskInfoList.length).to.be.above(2);
          taskInfoList.forEach((info) => {
            verifyProperties(info, interfaces.taskInfo);
            expect(info.inputParameters).to.be.an.array;
            expect(info.outputParameters).to.be.an.array;
            [...info.inputParameters,
              ...info.outputParameters].forEach((param) => {
              verifyProperties(param, interfaces.taskParameters);
            });
          });
        });
    });

    it('rejects promise if error from request', function() {
      this.timeout(config.testTimeout2);

      const badInfoList = GSF
        .client(config.fakeServer)
        .service(testTasks.ENVIService)
        .taskInfoList();

      return assert.isRejected(badInfoList, /Error requesting task info/);
    });
  });

  describe('.tasks()', function() {
    it('returns array of task objects', function() {
      this.timeout(config.testTimeout2);

      return service
        .tasks()
        .then((tasks) => {
          expect(tasks).to.be.an.array;
          expect(tasks.length).to.be.above(2);
          expect(tasks[0]).to.be.an('object');
          expect(tasks[0].name).to.be.an('string');
        });
    });

    it('rejects promise if error from request', function() {
      this.timeout(config.testTimeout2);

      const badInfoList = GSF
        .client(config.fakeServer)
        .service(testTasks.ENVIService)
        .tasks();

      return assert.isRejected(badInfoList, /Error requesting tasks/);
    });

  });

});
