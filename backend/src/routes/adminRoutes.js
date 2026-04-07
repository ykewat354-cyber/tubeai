/**
 * Admin Routes — Basic admin panel APIs
 *
 * Endpoints:
 * - GET /api/admin/users — List all users (paginated)
 * - GET /api/admin/stats — Platform-wide statistics
 * - GET /api/admin/user/:id — Single user detail
 * - PUT /api/admin/user/:id/plan — Manually change user plan
 * - PUT /api/admin/user/:id/reset-email — Re-send email verification
 *
 * Auth: Requires admin role (simple API key check for now)
 */

const express = require('express');
const router = express.Router();
const { prisma } = require('../../server');
const { asyncHandler } = require('../../middleware/errorHandler');
const { apiResponse } = require('../../utils/constants');
const config = require('../../config');
const logger = require('../../utils/logger');

// --- Admin auth middleware ---
function requireAdmin(req, res, next) {
  const adminKey = req.headers['x-admin-key'];
  const expectedKey = process.env.ADMIN_API_KEY;

  if (!expectedKey) {
    return res.status(500).json(apiResponse(false, 'Admin API key not configured'));
  }

  if (adminKey !== expectedKey) {
    logger.warn({ message: 'Unauthorized admin attempt', ip: req.ip });
    return res.status(403).json(apiResponse(false, 'Forbidden: admin access required'));
  }

  next();
}

router.use(requireAdmin);

/**
 * GET /api/admin/users?page=1&limit=20&search=email
 */
router.get('/users', asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const search = req.query.search || '';
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip, take: limit,
      select: {
        id: true, name: true, email: true, plan: true,
        emailVerified: true, subscriptionEnd: true,
        createdAt: true,
        _count: { select: { generations: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json(apiResponse(true, 'OK', { users }, {
    page, limit, total, totalPages: Math.ceil(total / limit),
  }));
}));

/**
 * GET /api/admin/user/:id
 */
router.get('/user/:id', asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: {
      generations: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, topic: true, format: true, model: true, createdAt: true },
      },
      _count: { select: { generations: true } },
    },
  });

  if (!user) return res.status(404).json(apiResponse(false, 'User not found'));

  res.json(apiResponse(true, 'OK', { user }));
}));

/**
 * GET /api/admin/stats — Platform-wide statistics
 */
router.get('/stats', asyncHandler(async (req, res) => {
  const [totalUsers, activeToday, totalGenerations, planDistribution, recentSignups] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        generations: {
          some: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        },
      },
    }),
    prisma.generation.count(),
    prisma.user.groupBy({
      by: ['plan'],
      _count: { id: true },
    }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [generationsToday, revenueEstimate] = await Promise.all([
    prisma.generation.count({ where: { createdAt: { gte: todayStart } } }),
    // Estimate: count active paid users * monthly price
    prisma.user.count({ where: { plan: { in: ['pro', 'pro-yearly'] } } }),
  ]);

  const mrr = revenueEstimate * 19; // Approximate: $19/month per paid user

  res.json(apiResponse(true, 'OK', {
    totalUsers,
    activeUsersToday: activeToday,
    totalGenerations,
    generationsToday,
    planDistribution,
    newUsersThisWeek: recentSignups,
    estimatedMRR: `$${mrr}/mo`,
    paidUsers: revenueEstimate,
  }));
}));

/**
 * PUT /api/admin/user/:id/plan — Change user's plan
 */
router.put('/user/:id/plan', asyncHandler(async (req, res) => {
  const { plan } = req.body;
  const validPlans = ['free', 'pro', 'pro-yearly'];

  if (!plan || !validPlans.includes(plan)) {
    return res.status(400).json(apiResponse(false, 'Invalid plan. Must be: free, pro, pro-yearly'));
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { plan, ...(plan === 'free' ? { stripeSubId: null, subscriptionEnd: null } : {}) },
    select: { id: true, name: true, email: true, plan: true },
  });

  logger.info({ message: 'Admin changed user plan', userId: user.id, to: plan });

  res.json(apiResponse(true, `User plan changed to ${plan}`, { user }));
}));

/**
 * PUT /api/admin/user/:id/reset-email — Re-send email verification
 */
router.put('/user/:id/reset-email', asyncHandler(async (req, res) => {
  const { generateToken } = require('../../services/emailService');
  const { sendEmail, verificationEmail } = require('../../services/emailService');

  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json(apiResponse(false, 'User not found'));

  const token = generateToken();
  await prisma.user.update({
    where: { id: user.id },
    data: { verificationToken: token, emailVerified: false },
  });

  const emailContent = verificationEmail(token, process.env.FRONTEND_URL);
  await sendEmail({ to: user.email, subject: emailContent.subject, html: emailContent.html });

  res.json(apiResponse(true, 'Verification email re-sent'));
}));

module.exports = router;
