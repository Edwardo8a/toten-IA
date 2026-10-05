const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const env = {
  PORT: process.env.PORT || 4000,
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '',
  LOYVERSE_TOKEN: process.env.LOYVERSE_TOKEN || '',
  LOYVERSE_BASE_URL: (process.env.LOYVERSE_BASE_URL || 'https://api.loyverse.com/v1.0').replace(/\/+$/, ''),
  JWT_SECRET: process.env.JWT_SECRET || 'cafe_lobo_super_secret_jwt_key_hackathon_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  ADMIN_USER: process.env.ADMIN_USER || 'admin',
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH || ''
};

module.exports = env;
