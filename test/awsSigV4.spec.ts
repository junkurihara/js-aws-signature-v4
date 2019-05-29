import chai from 'chai';
const expect = chai.expect;
import {getTestEnv} from './prepare';
const env = getTestEnv();
const lib = env.library;
const message = env.message;
const envName = env.envName;

import Amplify, {Auth} from 'aws-amplify';
import {pool_id, client_id, federation_id, user_id, password, region_name, host_name} from './auth-params';

// Get fetch in Node and Browsers
const getFetch = () => {
  let fetch;
  const global = Function('return this;')();
  if (typeof window === 'undefined'){
    fetch = require('node-fetch');
    global.fetch = fetch;
  }
  else fetch = window.fetch;
  return fetch;
};

describe(`${envName}: AWS version 4 signature test`, () => {
  before(async function () {
    this.timeout(50000);
    const global = Function('return this;')();
    if(typeof window === 'undefined') global.fetch = require('node-fetch');

    Amplify.configure({
      Auth: {
        region: 'ap-northeast-1',
        userPoolId: `${pool_id}`,
        userPoolWebClientId: `${client_id}`,
        identityPoolId: `${federation_id}`,
        mandatorySignIn: true,
        // authenticationFlowType: 'USER_PASSWORD_AUTH'
      }
    });

    await Auth.signIn(user_id, password).catch((e: Error) => console.error(e));
  });


  it('Signing', async () => {
    console.log(message);

    const currentCredential = await Auth.currentCredentials();
    const uriPath = '/public/test-mine.txt';
    const headers = {'Content-Type' : 'application/json', 'X-Amz-Meta-Foo': 'baz', 'X-Amz-Meta-Foobar': 'bazbaz'}; //
    const payload = {message: 'hello world my implementation'};

    const signedUrlGet = await lib.getSignedUrl(
      {
        accessKeyId: currentCredential.accessKeyId,
        secretAccessKey: currentCredential.secretAccessKey,
        sessionToken: currentCredential.sessionToken,
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
    const fetch = getFetch();
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
