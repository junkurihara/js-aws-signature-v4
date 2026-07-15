/**
 * prepare.ts
 */

import * as srcLibrary from '../src/index';
import base from '../lib.baseconfig';


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
    library = srcLibrary;
    message = '**This is a test with source codes in src.**';
  }

  return {library, envName, message};
};



// Get fetch in Node (built-in since Node.js 18) and browsers
export const getFetch = () => globalThis.fetch;
