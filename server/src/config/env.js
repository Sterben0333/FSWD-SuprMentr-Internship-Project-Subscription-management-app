const dotenv = require('dotenv');
const path = require('path');

// Load .env from the project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const env = {
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
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
