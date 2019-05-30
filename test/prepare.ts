/**
 * prepare.ts
 */

const common = require('../webpack.common.js');


export const getTestEnv = () => {
  let envName;
  let message;
  let library;
  if(process.env.TEST_ENV === 'bundle'){
    envName = 'Bundle';
    message = '**This is a test with a bundled library';
    library = require(`../dist/${common.bundleName}`);
  }
  else if (process.env.TEST_ENV === 'window'){
    if(typeof window !== 'undefined' && typeof (<any>window)[common.libName] !== 'undefined'){
      envName = 'Window';
      library = (<any>window)[common.libName];
      message = '**This is a test with a library imported from window.**';
    }
    else{
      envName = 'Source (Not Window)';
      library = require(`../src/${common.entryName}`);
      message = '**This is a test with source codes in src.**';
    }
  }
  else {
    envName = 'Source';
    library = require(`../src/${common.entryName}`);
    message = '**This is a test with source codes in src.**';
  }

  return {library, envName, message};
};



// Get fetch in Node and Browsers
export const getFetch = () => {
  let fetch;
  const global = Function('return this;')();
  if (typeof window === 'undefined'){
    fetch = require('node-fetch');
    global.fetch = fetch;
  }
  else fetch = window.fetch;
  return fetch;
};
