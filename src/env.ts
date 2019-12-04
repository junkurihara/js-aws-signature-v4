export const getJscHmac = () => getModule('js-crypto-hmac');

export const getJscHash = () => getModule('js-crypto-hash');


const getModule = (name: 'js-crypto-hash'|'js-crypto-hmac') => {
  if(typeof window !== 'undefined' && typeof (<any>window).jscu !== 'undefined'){
    return (name === 'js-crypto-hash') ? (<any>window).jscu.hash: (<any>window).jscu.hmac;
  }
  else return (name === 'js-crypto-hash') ? require('js-crypto-hash'): require('js-crypto-hmac');
};
