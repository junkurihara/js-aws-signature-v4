import chai from 'chai';
const expect = chai.expect;
import {getTestEnv, getFetch} from './prepare';
import {getCredential} from './aws-credential';

const env = getTestEnv();
const fetch = getFetch();
const lib = env.library;
const message = env.message;
const envName = env.envName;

import {pool_id, client_id, federation_id, user_id, password, region_name, host_name} from './params';

describe(`${envName}: AWS version 4 signature test`, () => {
  let credential: AWS.Credentials;
  before(async function () {
    console.log(message);
    this.timeout(50000);

    credential = await getCredential(user_id, password, pool_id, client_id, region_name, federation_id);
  });


  it('AWS Signed URL with session token', async () => {
    console.log(message);

    await credential.getPromise();
    const uriPath = '/public/test-mine.txt';
    const headers = {'Content-Type' : 'application/json', 'X-Amz-Meta-Foo': 'baz', 'X-Amz-Meta-Foobar': 'bazbaz'}; //
    const payload = {message: 'hello world my implementation'};

    const signedUrlGet = await lib.getSignedUrl(
      {
        accessKeyId: credential.accessKeyId,
        secretAccessKey: credential.secretAccessKey,
        sessionToken: credential.sessionToken,
        regionName: region_name
      },
      {
        method: 'GET',
        hostName: host_name,
        serviceName: 's3',
        uriPath,
        headers
      },
    );

    console.log(`download through my implementation: ${signedUrlGet}`);
    const signedUrl = signedUrlGet;

    // download
    const responseGet = await fetch(signedUrl, {
      method: 'GET',
      headers,
      mode: 'cors'
    }).catch( (e: Error) => console.error(e));

    console.log(`Get text to S3: ${responseGet.status}`);
    expect(responseGet.status === 200).to.be.true;
    const body = await responseGet.json();
    expect(JSON.stringify(body) === JSON.stringify(payload)).to.be.true;
    console.log(JSON.stringify(body));
    expect(true).to.be.true;
  });

});
