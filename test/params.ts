// require('dotenv').config();

const pool_id = (process.env.POOL_ID) ? process.env.POOL_ID : '';
const client_id = (process.env.CLIENT_ID) ? process.env.CLIENT_ID : '';
const federation_id = (process.env.FEDERATION_ID)? process.env.FEDERATION_ID : '';
const user_id = (process.env.USER_ID) ? process.env.USER_ID: '';
const password = (process.env.PASSWORD) ? process.env.PASSWORD: '';
const region_name = (process.env.REGION_NAME) ? process.env.REGION_NAME: '';
const host_name = (process.env.HOST_NAME) ? process.env.HOST_NAME: '';

export {pool_id, client_id, federation_id, user_id, password, region_name, host_name};
