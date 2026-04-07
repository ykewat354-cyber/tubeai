/**
 * PM2 Ecosystem Configuration
 *
 * Features:
 * - 2 API instances (auto load-balanced)
 * - 2 worker instances (4 parallel generations)
 * - Auto-restart on crash
 * - Log rotation
 * - Memory limit (restart if exceeded)
 *
 * Usage:
 *   pm2 start ecosystem.config.js
 */
module.exports = {
  apps: [
    {
      name: 'tubeapi',
      script: 'src/server.js',
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '500M',
      autorestart: true,
      watch: false,
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      merge_logs: true,
    },
    {
      name: 'tube-worker',
      script: 'scripts/queue-worker.js',
      instances: 2,
      max_memory_restart: '300M',
      autorestart: true,
      watch: false,
      env_production: {
        NODE_ENV: 'production',
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: 'logs/pm2-worker-error.log',
      out_file: 'logs/pm2-worker-out.log',
      merge_logs: true,
    },
  ],
};
