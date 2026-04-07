/**
 * Authentication service
 * Handles user registration, login, and profile retrieval.
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../server");
const config = require("../config");

/**
 * Register a new user
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user: object, token: string}>}
 */
async function register(name, email, password) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(password, config.auth.bcryptRounds);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: { id: true, name: true, email: true, plan: true, createdAt: true },
  });

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    config.auth.jwtSecret,
    { expiresIn: config.auth.jwtExpiresIn }
  );

  return { user, token };
}

/**
 * Authenticate user with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user: object, token: string}>}
 */
async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    config.auth.jwtSecret,
    { expiresIn: config.auth.jwtExpiresIn }
  );

  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
}

/**
 * Get user profile with subscription stats
 * @param {string} userId
 * @returns {Promise<object>}
 */
async function getUserProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, email: true, plan: true,
      stripeCustomerId: true, subscriptionEnd: true, createdAt: true,
      _count: { select: { generations: true } },
    },
  });

  if (!user) throw new Error("User not found");
  return user;
}

module.exports = { register, login, getUserProfile };
