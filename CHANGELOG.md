# Change Log
All notable changes to this project will be documented in this file.

## 2.2.0 / 2018-03-22

### New Features
- Added Server.jobInfoList() for fetching an array of the current JobInfo objects.

## 2.1.0 / 2018-03-21

### New Features
- Added headers object to the ServerArgs object to allow custom headers to be used in requests.

## 2.0.0 / 2017-07-24

### New Features
- Added the ability to use the SDK in Node.js.  See documentation for more details.

### Breaking Changes
- Task class: Replaced 'server' and 'serviceName' constructor arguments with 'service'.  This only affects Task objects created using the Task class constructor; there is no change to Task objects created using the Service.Task() method.  See API documentation for more details.

## 1.0.0 / 2017-02-26

### New Features
- Add a change log.
