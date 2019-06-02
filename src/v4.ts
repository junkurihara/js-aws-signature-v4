import jseu from 'js-encoding-utils';
import {dateIsoString} from './util';
import {getJscHmac, getJscHash} from './env';

const jschmac = getJscHmac();
const jschash = getJscHash();

interface awsCredentialInfo{
  accessKeyId: string,
  secretAccessKey: string,
  sessionToken: string,
  regionName: string
}

interface httpHeaders { [key: string]: string }

interface awsRequestInfo{
  method: string,
  hostName: string,
  serviceName: string,
  uriPath: string,
  headers?: httpHeaders,
  httpProto?: 'http'|'https',
  expires?: number
}

/**
 * Get signed URL
 * @param accessKeyId {string}
 * @param secretAccessKey {string}
 * @param sessionToken {string}
 * @param regionName {string}
 * @param method {string}
 * @param hostName {string}
 * @param serviceName {string}
 * @param uriPath {string}
 * @param headers {httpHeaders}
 * @param httpProto {string}
 * @param expires {number}
 */
export const getSignedUrl = async (
  {accessKeyId, secretAccessKey, sessionToken, regionName}: awsCredentialInfo,
  {method, hostName, serviceName, uriPath, headers={}, httpProto='https', expires=900}: awsRequestInfo,
): Promise<string> => {

  const newHeaders = Object.assign({'host': hostName}, headers);
  const stringifiedHeaders = sortedStringifiedHeaders(newHeaders);
  const signedHeaders = getSignedHeaders(stringifiedHeaders);

  // get query string
  const {queryString, iso8601, yyyymmdd}: awsQueryString = getQueryString(accessKeyId, sessionToken, regionName, signedHeaders, serviceName, expires);

  // compose canonical request
  const {canonicalRequest, additionalQueryString}: awsCanonicalRequest = getCanonicalRequest(method, uriPath, queryString, stringifiedHeaders, signedHeaders);

  // compute hash of canonical request
  const hash: Uint8Array = await jschash.compute(jseu.encoder.stringToArrayBuffer(canonicalRequest), 'SHA-256');

  // console.log(`canonical Request: ${canonicalRequest}`);
  // console.log(`hash: ${jseu.encoder.arrayBufferToHexString(hash)}`);

  // compose stringToSign
  const stringToSign: string = getStringToSign(iso8601, yyyymmdd, regionName, serviceName, hash);

  // derive siningKey
  const signatureKey = await getSigningKey(secretAccessKey, yyyymmdd, regionName, serviceName);

  // compute hmac
  const signature = await getSignature(signatureKey, stringToSign);
  // console.log(`signature: ${jseu.encoder.arrayBufferToHexString(signature)}`);

  return `${httpProto}://${hostName}${uriPath}?${queryString}${additionalQueryString}&X-Amz-Signature=${encodeURIComponent(jseu.encoder.arrayBufferToHexString(signature))}`;

};

/**
 * Stringify and sort http headers
 * @param headers {httpHeaders}
 * @returns {Array<string>}
 */
const sortedStringifiedHeaders = (headers: httpHeaders): Array<string> => {

  const upper: Array<string> = Object.keys(headers).map( (k) => `${k}:${headers[k]}`);
  const lower = upper.map( (m) => m.toLowerCase());
  lower.sort();

  return lower;
};

/**
 * Get signed headers
 * @param stringifiedHeaders {Array<string>}
 * @returns {string}
 */
const getSignedHeaders = (stringifiedHeaders: Array<string>): string => {
  let signedHeaders = '';

  for(let i = 0; i < stringifiedHeaders.length; i++ ){
    signedHeaders += stringifiedHeaders[i].split(':')[0];
    if(i !== stringifiedHeaders.length-1) signedHeaders += ';';
  }

  return signedHeaders;
};



interface awsQueryString {
  queryString: string,
  iso8601: string,
  yyyymmdd: string
}
/**
 * Get query string
 * @param accessKeyId {string}
 * @param sessionToken {string}
 * @param regionName {string}
 * @param signedHeaders {string}
 * @param serviceName {string}
 * @param expires {number}
 * @returns {awsQueryString}
 */
const getQueryString = (
  accessKeyId: string, sessionToken: string, regionName: string, signedHeaders: string, serviceName: string, expires: number
): awsQueryString => {

  const iso8601 = dateIsoString(new Date());
  const yyyymmdd = iso8601.slice(0,8);
  let queryString = 'X-Amz-Algorithm=AWS4-HMAC-SHA256';
  queryString += `&X-Amz-Credential=${
    encodeURIComponent(`${accessKeyId}/${yyyymmdd}/${regionName}/${serviceName}/aws4_request`)}`;
  queryString += `&X-Amz-Date=${iso8601}`;
  queryString += `&X-Amz-Expires=${expires}`; // default 15 mins
  queryString += `&X-Amz-Security-Token=${encodeURIComponent(`${sessionToken}`)}`;
  queryString += `&X-Amz-SignedHeaders=${encodeURIComponent(signedHeaders)}`;

  return {queryString, iso8601, yyyymmdd};
};


interface awsCanonicalRequest{
  canonicalRequest: string,
  additionalQueryString: string
}

/**
 * Get Canonical request.
 * @param method {string}
 * @param uriPath {string}
 * @param queryString {string}
 * @param stringifledHeaders {Array<string>}
 * @param signedHeaders {string}
 * @param headers {Object}
 * @returns {string}
 */
const getCanonicalRequest = (
  method: string,
  uriPath: string,
  queryString: string,
  stringifledHeaders: Array<string>,
  signedHeaders: string
): awsCanonicalRequest => {

  let canonicalRequest =
    `${method}\n`
    + `${uriPath}\n`
    + `${queryString}\n`;

  for(let i = 0; i < stringifledHeaders.length; i++) canonicalRequest += `${stringifledHeaders[i]}\n`;

  canonicalRequest += `\n${signedHeaders}\nUNSIGNED-PAYLOAD`;

  return {canonicalRequest, additionalQueryString: ''};
};

/**
 * Get stringToSign.
 * @param iso8601 {string}
 * @param yyyymmdd {string}
 * @param regionName {string}
 * @param serviceName {string}
 * @param hash {string}
 * @returns {string}
 */
const getStringToSign = (iso8601: string, yyyymmdd: string, regionName: string, serviceName: string, hash: Uint8Array): string =>
  `AWS4-HMAC-SHA256
${iso8601}
${yyyymmdd}/${regionName}/${serviceName}/aws4_request
${jseu.encoder.arrayBufferToHexString(hash)}`;

/**
 * Compute signing key to be used for signature generation.
 * @param secretAccessKey {string} - AWS secret access key.
 * @param dateStamp {string} - date stamp in yyyymmdd format.
 * @param regionName {string} - retion name like 'ap-northeast-1'
 * @param serviceName {string} - like 's3'
 * @returns {Promise<{Uint8Array}>} - signing key bytes
 */
export const getSigningKey = async (
  secretAccessKey: string,
  dateStamp: string,
  regionName: string,
  serviceName: string
): Promise<Uint8Array> => {
  try {
    const kDate: Uint8Array = await jschmac.compute(
      jseu.encoder.stringToArrayBuffer(`AWS4${secretAccessKey}`),
      jseu.encoder.stringToArrayBuffer(dateStamp),
      'SHA-256'
    );

    const kRegion: Uint8Array = await jschmac.compute(
      kDate, jseu.encoder.stringToArrayBuffer(regionName), 'SHA-256'
    );

    const kService: Uint8Array = await jschmac.compute(
      kRegion, jseu.encoder.stringToArrayBuffer(serviceName), 'SHA-256'
    );

    return jschmac.compute(
      kService, jseu.encoder.stringToArrayBuffer('aws4_request'), 'SHA-256');
  } catch (e) {
    throw new Error(`Failed to generate signature key: ${e.message}`);
  }
};

/**
 * Sign and generate version 4 signature
 * @param keyBuffer {Uint8Array} - signing key in Uint8Array
 * @param stringToSign {string} - String to be signed.
 * @returns {Promise<{Uint8Array}>} - signature bytes
 */
export const getSignature = async (keyBuffer: Uint8Array, stringToSign: string): Promise<Uint8Array> =>
  jschmac.compute(keyBuffer, jseu.encoder.stringToArrayBuffer(stringToSign), 'SHA-256');
