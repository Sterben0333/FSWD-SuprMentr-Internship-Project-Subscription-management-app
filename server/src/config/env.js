const dotenv = require('dotenv');
const path = require('path');

// Load .env from the project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const env = {
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Email config (optional — email reminders disabled if not set)
  EMAIL_HOST: process.env.EMAIL_HOST || null,
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT, 10) || 587,
  EMAIL_USER: process.env.EMAIL_USER || null,
  EMAIL_PASS: process.env.EMAIL_PASS || null,
  EMAIL_FROM: process.env.EMAIL_FROM || null,
};

// Validate required variables
const required = ['MONGODB_URI', 'JWT_SECRET'];
for (const key of required) {
  if (!env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    console.error(`   Please copy .env.example to .env and fill in values.`);
    process.exit(1);
  }
}

module.exports = env;
