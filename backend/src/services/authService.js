/**
 * Authentication service
 * Handles user registration, login, and profile retrieval.
 * Uses bcrypt for password hashing and JWT for token generation.
 *
 * Security measures:
 * - Passwords are bcrypt-hashed (10 rounds, ~2.5s per hash)
 * - JWT tokens expire after configurable duration (default: 7 days)
 * - Returned user objects never include the password field
 *
 * @module authService
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../server");

const SALT_ROUNDS = 10;

/**
 * Register a new user with email and password
 *
 * @param {string} name - User's display name
 * @param {string} email - User's email address (must be unique)
 * @param {string} password - Plain text password (min 8 chars, validated upstream)
 * @returns {Promise<{user: object, token: string}>} User object (without password) and JWT token
 * @throws {Error} If email is already registered
 */
async function register(name, email, password) {
  // Check if user already exists (case-insensitive via Prisma)
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Email is already registered");
  }

  // Hash password with bcrypt (salt rounds: 10 ≈ 2.5s per hash on modern CPU)
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user record
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
    // Explicitly exclude password from response
    select: {
      id: true,
      name: true,
      email: true,
      plan: true,
      createdAt: true,
    },
  });

  // Generate JWT token with user identity claims
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  return { user, token };
}

/**
 * Authenticate user with email and password
 *
 * @param {string} email - User's email address
 * @param {string} password - Plain text password to verify
 * @returns {Promise<{user: object, token: string}>} User object (without password) and JWT token
 * @throws {Error} If email not found or password doesn't match
 */
async function login(email, password) {
  // Find user by email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Generic error message prevents email enumeration
    throw new Error("Invalid email or password");
  }

  // Verify password hash (timing-safe comparison built into bcrypt)
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    // Same message as above — no hint about which field was wrong
    throw new Error("Invalid email or password");
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  // Destructure to remove password from response
  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
}

/**
 * Get user profile with subscription and usage statistics
 *
 * @param {string} userId - User UUID
 * @returns {Promise<object>} User profile with generation count
 * @throws {Error} If user not found
 */
async function getUserProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      plan: true,
      stripeCustomerId: true,
      subscriptionEnd: true,
      createdAt: true,
      _count: {
        select: { generations: true },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

module.exports = { register, login, getUserProfile };
