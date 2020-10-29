const fs = require('fs');
const path = require('path');

/**
 * @param API
 * @param inputs
 * @param scratch
 * @param jobResults
 * @constructor
 */
function Clean(API, inputs, scratch, jobResults) {
  if (__dirname.indexOf('test') > 0) {
    const workspaceDir = path.resolve(__dirname, '..', 'fake-server', 'workspace');
    fs.rmdir(workspaceDir, { recursive: true }, jobResults.done);
  }
}

module.exports = Clean;
