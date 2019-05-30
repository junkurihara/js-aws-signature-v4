# js-aws-signature-v4
Java(Type)Script implementation of AWS Signature Version 4

[![npm version](https://badge.fury.io/js/js-aws-sigv4.svg)](https://badge.fury.io/js/js-aws-sigv4)
[![CircleCI](https://circleci.com/gh/junkurihara/js-aws-signature-v4.svg?style=svg)](https://circleci.com/gh/junkurihara/js-aws-signature-v4)
[![Dependencies](https://david-dm.org/junkurihara/js-aws-signature-v4.svg)](https://david-dm.org/junkurihara/js-aws-signature-v4)
[![Coverage Status](https://coveralls.io/repos/github/junkurihara/js-aws-signature-v4/badge.svg?branch=develop)](https://coveralls.io/github/junkurihara/js-aws-signature-v4?branch=develop)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


> **WARNING**: At this time this solution should be considered suitable for research and experimentation, further code and security review is needed before utilization in a production application.

# Introduction and Overview
This tiny library is being developed to generate AWS signature version 4 and pre-signed url. This library is designed to be 'universal', i.e., it works both on most browsers and on Node.js just by importing from npm/source code.


# Installation
At your project directory, do either one of the following.

- From npm/yarn:
  
  ```shell
  $ npm install --save js-aws-sigv4 // npm
  $ yarn add js-aws-sigv4 // yarn
  ```
  
- From GitHub:
  ```shell
  $ git clone https://github.com/junkurihara/js-aws-signature-v4.git
  ```
  
Then you should import the package as follows.
```javascript
import jsAwsSigV4 from 'js-aws-sigv4'; // for npm
```
  
# Usage
## Get signature itself
```javascript
const signingKey = await jsAwsSigv4.getSigningKey(
  credential.secretAccessKey,
  dateIsoString(new Date()),
  region_name,
  's3'
);

const signature = await jsAwsSigv4.getSignature(
  signingKey,
  'stringToSign'
);
```

## Get pre-signed URL
```javascript
const uriPath = '/public/test.txt';
const headers = {'Content-Type' : 'application/json', 'X-Amz-Meta-Foo': 'barbaz', 'X-Amz-Meta-Foobar': 'bazbaz'};

const signedUrlGet = await jsAwsSigv4.getSignedUrl(
  {
    accessKeyId: credential.accessKeyId,
    secretAccessKey: credential.secretAccessKey,
    sessionToken: credential.sessionToken, // optional
    regionName: region_name
  },
  {
    method: 'GET',
    hostName: host_name,
    serviceName: 's3',
    uriPath,
    headers // optional
  },
);

```

# License
Licensed under the MIT license, see `LICENSE` file.
