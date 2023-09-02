# js-aws-signature-v4
TypeScript implementation of AWS Signature Version 4


[![npm version](https://badge.fury.io/js/js-aws-sigv4.svg)](https://badge.fury.io/js/js-aws-sigv4)
[![Maintainability](https://api.codeclimate.com/v1/badges/84061cc18473d527bbf6/maintainability)](https://codeclimate.com/github/junkurihara/js-aws-signature-v4/maintainability)
[![codecov](https://codecov.io/gh/junkurihara/js-aws-signature-v4/branch/develop/graph/badge.svg)](https://codecov.io/gh/junkurihara/js-aws-signature-v4)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Unit Test](https://github.com/junkurihara/js-aws-signature-v4/actions/workflows/ci.yml/badge.svg)

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
