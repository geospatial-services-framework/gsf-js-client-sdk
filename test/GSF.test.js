/**
 * Tests for the GSF object.
 */
const expect = require('chai').expect;
const GSF = require('../src/GSF');

/**
 * Begin tests
 */
 // Avoid using arrow functions with mocha:
 //  http://mochajs.org/#arrow-functions
describe('Testing GSF', function() {
  it('is a valid object', function(done) {
    expect(GSF).to.be.an('object');
    expect(GSF.server).to.exist;
    expect(GSF.server).to.be.a('function');
    done();
  });
});
