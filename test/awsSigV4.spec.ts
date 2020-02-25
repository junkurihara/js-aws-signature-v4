import chai from 'chai';
const expect = chai.expect;
import {getTestEnv, getFetch} from './prepare';
import {getCredential} from './aws-credential';

const env = getTestEnv();
// @ts-ignore
const fetch = getFetch();
const lib = env.library;
const message = env.message;
const envName = env.envName;

import {pool_id, client_id, federation_id, user_id, password, region_name, host_name} from './params';
import {dateIsoString} from '../src/util';

describe(`${envName}: AWS version 4 signature test`, () => {
  let credential: AWS.Credentials;
  before(async function () {
    console.log(message);
    this.timeout(50000);

    credential = await getCredential(user_id, password, pool_id, client_id, region_name, federation_id);
  });


  it('AWS Signing key and signature version 4', async () => {
    await credential.getPromise();
    const signingKey = await lib.getSigningKey(
      credential.secretAccessKey,
      dateIsoString(new Date()),
      region_name,
      's3'
    );
    expect(signingKey).to.be.a.instanceof(Uint8Array);

    const signature = await lib.getSignature(
      signingKey,
      'stringToSign'
    );
    expect(signature).to.be.a.instanceof(Uint8Array);
  });


  it('AWS Signed URL without session token', async () => {
    await credential.getPromise();
    const uriPath = '/public/test-mine.txt';
    const headers = {'Content-Type' : 'application/json', 'X-Amz-Meta-Foo': 'baz', 'X-Amz-Meta-Foobar': 'bazbaz'}; //

    const signedUrlGet = await lib.getSignedUrl(
      {
        accessKeyId: credential.accessKeyId,
        secretAccessKey: credential.secretAccessKey,
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
    //console.log(signedUrlGet);
    expect(signedUrlGet).to.be.string;
  });


  it('AWS Signed URL with session token, check if the S3 upload and download work', async () => {

    const uriPath = '/public/test-mine.txt';
    const headers = {'Content-Type' : 'application/json', 'X-Amz-Meta-Foo': 'baz', 'X-Amz-Meta-Foobar': 'bazbaz'}; //
    const payload = {message: 'hello world my implementation'};


    ////////////////////////////////////////////////////////////////////////////////////////
    await credential.getPromise();
    const signedUrlPut = await lib.getSignedUrl(
      {
        accessKeyId: credential.accessKeyId,
        secretAccessKey: credential.secretAccessKey,
        sessionToken: credential.sessionToken,
        regionName: region_name
      },
      {
        method: 'PUT',
        hostName: host_name,
        serviceName: 's3',
        uriPath,
        headers: {'Content-Type': headers['Content-Type']}
      },
    );

    console.log(`upload through: ${signedUrlPut}`);

    // upload
    const responsePut = await fetch(signedUrlPut, {
      method: 'PUT',
      body: JSON.stringify(payload),
      headers: {'Content-Type': headers['Content-Type']},
      mode: 'cors'
    }).catch( (e: Error) => {
      console.error(e.message);
      throw new Error(e.message);
    });

    expect(responsePut.status === 200).to.be.true;


    ////////////////////////////////////////////////////////////////////////////////////////
    await credential.getPromise();
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

    // download
    const responseGet = await fetch(signedUrlGet, {
      method: 'GET',
      headers,
      mode: 'cors'
    }).catch( (e: Error) => {
      console.error(e.message);
      throw new Error(e.message);
    });

    expect(responseGet.status === 200).to.be.true;

    const body = await responseGet.json();
    expect(JSON.stringify(body) === JSON.stringify(payload)).to.be.true;
  });

});
