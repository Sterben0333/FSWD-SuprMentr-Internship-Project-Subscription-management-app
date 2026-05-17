const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');
const { initCronJobs } = require('./jobs/lifecycleJobs');

const startServer = async () => {
  // Connect to MongoDB Atlas
  await connectDB();

  // Initialize cron jobs
  initCronJobs();

  // Start Express server
  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    console.log(`📊 Environment: ${env.NODE_ENV}`);
    console.log(`💊 Health check: http://localhost:${env.PORT}/api/health`);
  });
};

startServer().catch((err) => {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
});
