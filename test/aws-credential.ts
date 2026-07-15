import {fromCognitoIdentityPool} from '@aws-sdk/credential-providers';
import type {AwsCredentialIdentity} from '@aws-sdk/types';
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';

export const getCredential = (
  user_id: string,
  password: string,
  pool_id: string,
  client_id: string,
  region_name: string,
  federation_id: string
): Promise<AwsCredentialIdentity> => new Promise( (resolve, reject) => {
  const authenticationData = {Username: user_id, Password: password};
  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
  const poolData = {UserPoolId: pool_id, ClientId: client_id};
  const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  const userData = {Username: user_id, Pool: userPool};
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess(result: AmazonCognitoIdentity.CognitoUserSession) {
      const loginsInfo: { [key: string]: string } = {};
      loginsInfo[`cognito-idp.${region_name}.amazonaws.com/${pool_id}`] = result.getIdToken().getJwtToken();
      // Exchange the user pool ID token for temporary AWS credentials
      // through the Cognito identity pool (successor of AWS.CognitoIdentityCredentials).
      const provider = fromCognitoIdentityPool({
        identityPoolId: federation_id, // your identity pool id here
        logins: loginsInfo,
        clientConfig: {region: region_name}
      });
      provider().then(resolve).catch((err: Error) => {
        reject(err.message);
      });
    },

    onFailure(err: Error) {
      reject(err.message);
    },
  });
});
