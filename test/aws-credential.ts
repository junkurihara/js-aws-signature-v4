import AWS from 'aws-sdk';
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';

// Work around... for the problem that global.crypto is not defined in Node.js env.
// This maybe due to the upgrade fo core-js
if (typeof window === 'undefined') {
  // @ts-ignore
  global.crypto = require('crypto');
}

export const getCredential = (
  user_id: string,
  password: string,
  pool_id: string,
  client_id: string,
  region_name: string,
  federation_id: string
): Promise<AWS.Credentials> => new Promise( (resolve, reject) => {
  const authenticationData = {Username: user_id, Password: password};
  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
  const poolData = {UserPoolId: pool_id, ClientId: client_id};
  const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  const userData = {Username: user_id, Pool: userPool};
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess(result: any) {
      //POTENTIAL: Region needs to be set if not already set previously elsewhere.
      AWS.config.region = region_name;
      const loginsInfo: { [key: string]: string } = {};
      loginsInfo[`cognito-idp.${region_name}.amazonaws.com/${pool_id}`] = result.getIdToken().getJwtToken();
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: federation_id, // your identity pool id here
        Logins: loginsInfo
      });
      (< AWS.CognitoIdentityCredentials > AWS.config.credentials).refresh((error: Error) => {
        if (error) {
          reject(error.message);
        } else {
          // Instantiate aws sdk service objects now that the credentials have been updated.
          // example: var s3 = new AWS.S3();
          resolve(<AWS.Credentials> AWS.config.credentials);
        }
      });
    },

    onFailure(err: Error) {
      reject(err.message);
    },
  });
});
