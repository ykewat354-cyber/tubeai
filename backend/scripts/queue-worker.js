/**
 * Queue Worker — Background Job Processor
 *
 * This script runs as a separate process that processes queued jobs.
 * It handles:
 * - AI content generation (OpenAI API calls)
 * - Email delivery (nodemailer)
 *
 * Run:
 *   node scripts/queue-worker.js
 *
 * Production (PM2):
 *   pm2 start scripts/queue-worker.js --name tubeai-worker --instances 2
 */

const { Worker } = require('bullmq');
const { getRedisClient, closeRedis } = require('../src/config/redis');
const { prisma } = require('../src/server'); // Uses same Prisma instance
const { generateContent } = require('../src/config/openai');
const { getTransporter } = require('../src/services/emailService');
const logger = require('../src/utils/logger');
const config = require('../src/config');

require('dotenv').config();

// ========================================
// Generation Worker
// ========================================

const generationWorker = new Worker(
  'generation-queue',
  async (job) => {
    const { userId, topic, format, planLimits } = job.data;

    logger.info({
      message: 'Processing generation job',
      jobId: job.id,
      userId,
      topic: topic.substring(0, 50),
    });

    // Update progress
    await job.updateProgress(10);

    // Call OpenAI API
    await job.updateProgress(50);
    const result = await generateContent(topic, {
      model: planLimits.model,
      format,
    });

    await job.updateProgress(90);

    // Save to database
    const generation = await prisma.generation.create({
      data: {
        userId,
        topic: topic.trim().substring(0, 500),
        format,
        result,
        model: planLimits.model,
      },
    });

    await job.updateProgress(100);

    logger.info({
      message: 'Generation job completed',
      jobId: job.id,
      generationId: generation.id,
    });

    return {
      id: generation.id,
      topic: generation.topic,
      format: generation.format,
      result: generation.result,
      createdAt: generation.createdAt,
    };
  },
  {
    connection: getRedisClient(),
    concurrency: 3, // Process 3 generations in parallel
  }
);

generationWorker.on('completed', (job) => {
  logger.info({ message: 'Generation completed', jobId: job.id });
});

generationWorker.on('failed', (job, err) => {
  logger.error({
    message: 'Generation failed',
    jobId: job?.id,
    error: err.message,
    attempts: job?.attemptsMade,
  });
});

// ========================================
// Email Worker
// ========================================

const emailWorker = new Worker(
  'email-queue',
  async (job) => {
    const { to, subject, html, text } = job.data;

    logger.info({ message: 'Processing email job', to, subject });

    await job.updateProgress(50);

    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'TubeAI'}" <${process.env.EMAIL_FROM || 'noreply@tubeai.com'}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });

    await job.updateProgress(100);

    logger.info({ message: 'Email sent', to, messageId: info.messageId });
    return { messageId: info.messageId };
  },
  {
    connection: getRedisClient(),
    concurrency: 5, // 5 parallel emails
  }
);

emailWorker.on('completed', (job) => {
  logger.info({ message: 'Email sent', jobId: job.id });
});

emailWorker.on('failed', (job, err) => {
  logger.error({
    message: 'Email failed',
    jobId: job?.id,
    error: err.message,
    attempts: job?.attemptsMade,
  });
});

// ========================================
// Graceful Shutdown
// ========================================

async function shutdown() {
  logger.info({ message: 'Shutting down workers...' });
  await generationWorker.close();
  await emailWorker.close();
  await prisma.$disconnect();
  await closeRedis();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

logger.info({ message: 'Queue workers started', concurrency: { generation: 3, email: 5 } });

// Keep process alive
process.stdin.resume();
