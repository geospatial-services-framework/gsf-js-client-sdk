# Change Log
All notable changes to this project will be documented in this file.

## 2.0.0 / 2017-07-24

### New Features
- Added the ability to use the SDK in Node.js.  The npm package's main script now points to the source code instead of a transpiled and bundled distribution file.  See documentation for more details.

### Breaking Changes
- Task class: Replaced 'server' and 'serviceName' constructor arguments with 'service'.  This only affects Task objects created using the Task class constructor; there is no change to Task objects created using the Service.Task() method.  See API documentation for more details.

## 1.0.0 / 2017-02-26

### New Features
- Add a change log.
