/**
 * BullMQ Job Queue Configuration
 *
 * Queue Types:
 * - generation-queue: AI content generation (expensive, async)
 * - email-queue: Email delivery (network I/O, retryable)
 *
 * Benefits:
 * - Non-blocking API responses (return job ID immediately)
 * - Retry failed jobs automatically
 * - Job progress tracking
 * - Concurrency control
 */

const { Queue } = require('bullmq');
const { getRedisClient } = require('./redis');
const logger = require('../utils/logger');
const connection = getRedisClient();

// AI Generation Queue
const generationQueue = new Queue('generation-queue', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { age: 3600, count: 1000 },
    removeOnFail: { age: 86400 * 7 },
  },
});

// Email Delivery Queue
const emailQueue = new Queue('email-queue', {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 10000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

/** Add generation job — returns immediately with jobId */
async function enqueueGeneration(jobData) {
  const job = await generationQueue.add('generate-content', jobData, {
    jobId: `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    priority: jobData.planName === 'free' ? 10 : 1,
  });
  logger.info({ message: 'Generation job queued', jobId: job.id });
  return job.id;
}

/** Add email job — returns immediately */
async function enqueueEmail(jobData) {
  const job = await emailQueue.add('send-email', jobData);
  return job.id;
}

/** Check job status */
async function getJobStatus(jobId) {
  let queue = jobId.startsWith('gen-') ? generationQueue
    : jobId.startsWith('email-') ? emailQueue : null;

  if (!queue) return { status: 'not-found' };

  const job = await queue.getJob(jobId);
  if (!job) return { status: 'not-found' };

  const state = await job.getState();
  return {
    status: state,
    progress: job.progress || 0,
    attemptsMade: job.attemptsMade,
    ...(state === 'completed' && { result: job.returnvalue }),
    ...(state === 'failed' && { error: job.failedReason }),
  };
}

async function getQueueStats() {
  const [gW, gA, gC, gF, eW, eA] = await Promise.all([
    generationQueue.getWaitingCount(),
    generationQueue.getActiveCount(),
    generationQueue.getCompletedCount(),
    generationQueue.getFailedCount(),
    emailQueue.getWaitingCount(),
    emailQueue.getActiveCount(),
  ]);
  return {
    generation: { waiting: gW, active: gA, completed: gC, failed: gF },
    email: { waiting: eW, active: eA },
  };
}

async function closeQueues() {
  await generationQueue.close();
  await emailQueue.close();
  logger.info({ message: 'Queues closed' });
}

module.exports = { generationQueue, emailQueue, enqueueGeneration, enqueueEmail, getJobStatus, getQueueStats, closeQueues };
