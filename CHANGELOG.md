# Change Log
All notable changes to this project will be documented in this file.

## 4.0.0 / 2020-06-22

### New Features
- Support for GSF 3.0:
    - Add 'query' option to JobListOptions for more advanced querying of the job database.
    - Add 'sort' option to the JobListOptions for flexible sorting of the job list.
    - Add 'totals' option to JobListOptions for totals broken down by job status.

### Breaking Changes
- Changes related to GSF 3.0:
    - Change jobId type from number to string to support the new 'uniqueJobIds' configuration option in GSF.
    - Remove 'reverse' and 'status' options from JobListOptions in favor or more powerful 'sort' and 'query' options.
    - The JobInfoList is now an object containing the jobs array, job count, and totals.

For a detailed summary of the changes, see the V4 Migration Guide and examples in the documentation.

## 3.0.0 / 2018-03-21

### New Features
- Updated the SDK to use the new GSF HTTP API.

### Breaking Changes
- Several breaking changes were made for this release.  For a detailed summary of the changes, see the Migration Guide in the documentation.

## 2.2.0 / 2018-03-22

### New Features
- Added Server.jobInfoList() for fetching an array of the current JobInfo objects.

### Bug Fixes
- Fix #10 - Server.jobInfoList() will retrieve full JobInfo objects from the server.

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
