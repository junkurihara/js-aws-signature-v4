import chai from 'chai';
const expect = chai.expect;
import {getTestEnv} from './prepare';
const env = getTestEnv();
const lib = env.library;
const message = env.message;
const envName = env.envName;

describe(`${envName}: AWS version 4 signature test`, () => {
  it('Signing', () => {
    console.log(message);

    console.log(lib);

    expect(true).to.be.true;
  });
});
