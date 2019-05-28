import jschash from 'js-crypto-hash';
import jschmac from 'js-crypto-hmac';
import jseu from 'js-encoding-utils';

const DateIsoString = (d: Date) => {
  const pad = (number: number) => {
    if (number < 10) return `0${number}`;
    return number;
  };

  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T`
    +`${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
};

/**
 * Sign and generate version 4 signature
 * @param keyBuffer {Uint8Array} - signing key in Uint8Array
 * @param stringToSign {string} - String to be signed.
 * @returns {Promise<{Uint8Array}>} - signature bytes
 */
export const getSignature = async (keyBuffer: Uint8Array, stringToSign: String): Promise<Uint8Array> =>
  jschmac.compute(keyBuffer, jseu.encoder.stringToArrayBuffer(stringToSign), 'SHA-256');


interface awsCredentialInfo{
  accessKeyId: String,
  secretAccessKey: String,
  sessionToken: String,
  regionName: String
}

export const getSignedUrl = async (
  {accessKeyId, secretAccessKey, sessionToken, regionName}: awsCredentialInfo,
  method: String, serviceName: String, uriPath: String, headers: String
) => {
  const iso8601 = DateIsoString(new Date());
  const yyyymmdd = iso8601.slice(0,8);
  let queryString = 'X-Amz-Algorithm=AWS4-HMAC-SHA256';
  queryString += `&X-Amz-Credential=${
    encodeURIComponent(`${accessKeyId}/${yyyymmdd}/${regionName}/${serviceName}/aws4_request`)}`;
  queryString += `&X-Amz-Date=${iso8601}`;
  queryString += '&X-Amz-Expires=900'; // default 15 mins
  queryString += `&X-Amz-Security-Token=${encodeURIComponent(`${sessionToken}`)}`;
  queryString += '&X-Amz-SignedHeaders=host';

  const canonicalReq =
    `${method}\n`
    + `${uriPath}\n`
    + `${queryString}\n`
    + `${headers}\n\n`
    + 'host\nUNSIGNED-PAYLOAD';
  const hash = await jschash.compute(jseu.encoder.stringToArrayBuffer(canonicalReq), 'SHA-256');
  console.log(`canonical Request: ${canonicalReq}`);
  console.log(`hash: ${jseu.encoder.arrayBufferToHexString(hash)}`);

  const stringToSign = getStringToSign(iso8601, yyyymmdd, regionName, serviceName, hash);

  const signatureKey = await getSigningKey(secretAccessKey, yyyymmdd, regionName, serviceName);

  // compute hmac
  const signature = await getSignature(signatureKey, stringToSign);
  console.log(`signature: ${jseu.encoder.arrayBufferToHexString(signature)}`);

  return `${uriPath}?${queryString}&X-Amz-Signature=${encodeURIComponent(jseu.encoder.arrayBufferToHexString(signature))}`;

};

const getStringToSign = (iso8601: String, yyyymmdd: String, regionName: String, serviceName: String, hash: Uint8Array): String =>
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
  secretAccessKey: String,
  dateStamp: String,
  regionName: String,
  serviceName: String
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

