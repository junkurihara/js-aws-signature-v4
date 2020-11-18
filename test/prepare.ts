/**
 * prepare.ts
 */

const base = require('../webpack.baseconfig');


export const getTestEnv = () => {
  let envName;
  let message;
  let library;

  if (process.env.TEST_ENV === 'window'){
    if(typeof window !== 'undefined' && typeof (<any>window)[base.libName] !== 'undefined'){
      envName = 'Window';
      library = (<any>window)[base.libName];
      message = '**This is a test with a library imported from window.**';
    }
    else throw new Error('The library is not loaded in window object.');
  }
  else {
    envName = 'Source';
    library = require('../src/index');
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
