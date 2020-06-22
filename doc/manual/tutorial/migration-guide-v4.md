# Migration Guide: Moving from v3 to v4
The purpose of this guide is to help you transition your application's source code from v3 to v4 of the SDK.  These changes will allow you to use the SDK with GSF 3.0 or later.

### Job IDs
Job IDs are now strings due to the addition of optional unique job IDs in GSF 3.0.

### Job Lists
#### New 'query' option
GSF 3.0 has added a powerful API for querying the job database.  The SDK now leverages this new query language and has removed some of the legacy job filters.  More information on this can be found in the [**Examples**] page or the GSF Job Search API Tutorial.

#### New 'sort' option
More flexible sorting is now available for job lists.  Please see [**JobListOptions**] documentation for more details

#### New 'totals' option
A new option called 'totals' has been introduced to the JobInfoListOptions object.  This can be used to retrieve total job counts by job status, as well as a grand total.  Please see the [**JobListOptions**] documentation for more details.

#### JobInfoList response has changed
Instead of just returning the array of JobInfo objects, the Client.JobInfoList() function now returns an object containing the count of filtered jobs, the total number of jobs in the database, and totals for each job status.  For more information see the [**JobInfoList**] documentation.

JobInfoList V3
```javascript
[
    <JobInfo>,
    <JobInfo>,
    ...
]
```

JobInfoList V4
```javascript
{
    total: 50,
    count: 10,
    jobs: [
        <JobInfo>,
        <JobInfo>,
        ...
    ]
}
```

#### The 'reverse' and 'status' options have been removed
The 'reverse' and 'status' options have been removed from the [**JobListOptions**] object in favor of the new query API.  Below are examples for converting to the new syntax.

##### Converting code that uses the 'reverse' option
Setting the 'reverse' option to true is equivalent to sorting the job list by jobSubmitted date in descending order.

```diff
const client = GSF.client({
    address: 'MyServer',
    port: '9191'
});

// Get job list with jobSubmitted date in descending order.
const jobListOptions = {
-    reverse: true
+    sort: [[ 'jobSubmitted', -1 ]]
};

client
    .jobs(jobListOptions)
    .then((jobList) => {
        console.log(jobList);
    }).catch((err) => {
        console.error(err);
    });
```

##### Converting code that uses the 'status' option
Setting the 'status' option is equivalent to querying by jobStatus using the new syntax.  For more examples on querying, please see the [**Examples**] or the GSF Job Search API Tutorial.

```diff
const client = GSF.client({
    address: 'MyServer',
    port: '9191'
});

// Filter job list by Failed status.
const jobListOptions = {
-    status: 'Failed'
+    query: {
+       jobStatus: {
+           '$eq': 'Failed'
+       }
+    }
};

client
    .jobs(jobListOptions)
    .then((jobList) => {
        console.log(jobList);
    }).catch((err) => {
        console.error(err);
    });
```

[**JobListOptions**]:../typedef/index.html#static-typedef-JobListOptions
[**Examples**]:../manual/examples.html