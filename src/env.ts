export const getJscHmac = () => {
  let module;
  if(typeof window !== 'undefined' && typeof (<any>window).jscu !== 'undefined'){
    module = (<any>window).jscu.hmac;
  }
  else module = require('js-crypto-hmac');

  return module;
};

export const getJscHash = () => {
  let module;
  if(typeof window !== 'undefined' && typeof (<any>window).jscu !== 'undefined'){
    console.log('window');
    module = (<any>window).jscu.hash;
  }
  else module = require('js-crypto-hash');

  return module;
};
