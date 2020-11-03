const fs = require('fs');
const path = require('path');

/**
 * Test task that writes files to the workspace.
 * @param API
 * @param inputs
 * @param scratch
 * @param jobResults
 * @constructor
 */
function WriteFiles(API, inputs, scratch, jobResults) {

  let workspaceDir = process.cwd();

  // If this is using the fake server, the directory is different.
  if (__dirname.indexOf('test') > 0) {
    workspaceDir = path.resolve(__dirname, '..', 'fake-server', 'workspace', API.currentID);
    fs.mkdirSync(workspaceDir, {recursive: true});
  }

  const textFile = path.resolve(workspaceDir, 'file.txt');
  fs.appendFile(textFile, inputs.TEXT || 'Some text.', () => {
    const binFile = path.resolve(workspaceDir, 'file.bin');
    const buffArr = new ArrayBuffer(inputs.BYTE_LENGTH || 8);
    fs.appendFile(binFile, Buffer.from(buffArr), () => {
      jobResults.done(null, {}); 
    });
  });  
}

module.exports = WriteFiles;
