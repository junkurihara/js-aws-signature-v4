import chai from 'chai';
const expect = chai.expect;
import {getTestEnv} from './prepare';
const env = getTestEnv();
const lib = env.library;
const message = env.message;
const envName = env.envName;

import Amplify, {Auth} from 'aws-amplify';
import {pool_id, client_id, federation_id, user_id, password, region_name, host_name} from './auth-params';

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

    Amplify.configure({
      Auth: {
        region: 'ap-northeast-1',
        userPoolId: `${pool_id}`,
        userPoolWebClientId: `${client_id}`,
        identityPoolId: `${federation_id}`,
        mandatorySignIn: true,
      }
    });

    await Auth.signIn(user_id, password).catch((e: Error) => console.error(e));
  });


  it('Signing', async () => {
    const currentCredential = await Auth.currentCredentials();
    const uriPath = '/public/test-mine.txt';
    const headers = {ContentType: 'application/json'}; //
    const payload = {message: 'hello world my implementation'};

    console.log(message);

    const signedUrlGet = await lib.getSignedUrl(
      {
        accessKeyId: currentCredential.accessKeyId,
        secretAccessKey: currentCredential.secretAccessKey,
        sessionToken: currentCredential.sessionToken,
        regionName: region_name
      },
      'GET', host_name, 's3', uriPath, headers
    );

    console.log(`upload through my implementation: https://${host_name+signedUrlGet}`);
    const signedUrl = `https://${host_name+signedUrlGet}`;


    // upload
    const fetch = getFetch();
    const responseGet = await fetch(signedUrl, {
      method: 'GET',
      headers: {'Content-Type' : 'application/json'},
      mode: 'cors'
    }).catch( (e: Error) => console.error(e));
    console.log(`Get text to S3: ${responseGet.status}`);
    expect(responseGet.status === 200).to.be.true;
    const body = await responseGet.json();
    expect(body.toString() === payload.toString()).to.be.true;
    console.log(body.toString());
    expect(true).to.be.true;
  });
});
