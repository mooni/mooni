import * as dotenv from 'dotenv';
const { parsed: env } = dotenv.config();

export default {
  bityClientId: env['PRIVATE_BITY_CLIENT_ID'] || '',
  bityClientSecret: env['PRIVATE_BITY_CLIENT_SECRET'] || '',
  year: 2021,
}