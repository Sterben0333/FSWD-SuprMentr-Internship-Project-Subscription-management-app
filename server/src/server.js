const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

const startServer = async () => {
  // Start Express server immediately so health checks pass right away
  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    console.log(`📊 Environment: ${env.NODE_ENV}`);
    console.log(`💊 Health check: http://localhost:${env.PORT}/api/health`);
  });

  // Connect to MongoDB Atlas
  try {
    await connectDB();
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
  }
};

startServer().catch((err) => {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
});
