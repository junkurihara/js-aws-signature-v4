let pool_id: string;
let client_id: string;
let federation_id: string;
let user_id: string;
let password: string;
let region_name: string;
let host_name: string;
console.log(process.env);


pool_id = (process.env.POOL_ID) ? process.env.POOL_ID : '';
client_id = (process.env.CLIENT_ID) ? process.env.CLIENT_ID : '';
federation_id = (process.env.FEDERATION_ID)? process.env.FEDERATION_ID : '';
user_id = (process.env.USER_ID) ? process.env.USER_ID: '';
password = (process.env.PASSWORD) ? process.env.PASSWORD: '';
region_name = (process.env.REGION_NAME) ? process.env.REGION_NAME: '';
host_name = (process.env.HOST_NAME) ? process.env.HOST_NAME: '';

try {
  const authParams = require('./auth-params');
  pool_id = authParams.pool_id;
  client_id = authParams.client_id;
  federation_id = authParams.federation_id;
  user_id = authParams.user_id;
  password = authParams.password;
  region_name = authParams.region_name;
  host_name = authParams.host_name;
  console.log('Installed from auth-params.ts');
}
catch (e) {
  console.log('Installed from Environment variables');
}

export {pool_id, client_id, federation_id, user_id, password, region_name, host_name};
