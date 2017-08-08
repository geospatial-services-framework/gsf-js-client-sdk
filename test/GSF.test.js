/**
 * Tests for the GSF object.
 */
import { expect } from 'chai';
import GSF from '../src/GSF';

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
