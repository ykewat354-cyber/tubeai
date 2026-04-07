/**
 * Authentication Service
 * Handles registration, login, email verification, and password reset.
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../server");
const config = require("../config");
const { generateToken } = require("./emailService");
const logger = require("../utils/logger");

/**
 * Register a new user with email verification
 */
async function register(name, email, password) {
  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(password, config.auth.bcryptRounds);
  const verificationToken = generateToken();

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      verificationToken,
      emailVerified: false, // Require verification before full access
    },
    select: { id: true, name: true, email: true, plan: true, emailVerified: true, createdAt: true },
  });

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    config.auth.jwtSecret,
    { expiresIn: config.auth.jwtExpiresIn }
  );

  return { user, token, verificationToken };
}

/**
 * Authenticate user with email and password
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

  const { password: _, verificationToken: __, ...userWithoutSecrets } = user;
  return { user: userWithoutSecrets, token };
}

/**
 * Verify email using the token from verification email
 * @param {string} token - Verification token
 * @returns {Promise<object>} Updated user object
 */
async function verifyEmail(token) {
  const user = await prisma.user.findUnique({ where: { verificationToken: token } });

  if (!user) {
    throw new Error("Invalid or expired verification token");
  }

  if (user.emailVerified) {
    return { success: true, message: "Email already verified" };
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
    },
    select: { id: true, name: true, email: true, emailVerified: true },
  });

  logger.info({ message: "Email verified", userId: user.id });
  return { success: true, message: "Email verified successfully", user: updated };
}

/**
 * Initiate password reset — generates a code and returns it
 * Caller is responsible for sending it via email
 * @param {string} email
 * @returns {Promise<{code: string, userId: string}>}
 */
async function initiatePasswordReset(email) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Always return success to prevent email enumeration
    return { success: true, message: "If an account exists, a reset code has been sent." };
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15-minute expiry

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetCode: code,
      passwordResetExp: expiresAt,
    },
  });

  logger.info({ message: "Password reset initiated", userId: user.id });
  return { success: true, message: "Reset code sent", code }; // In prod, don't return code
}

/**
 * Complete password reset — verify code and set new password
 * @param {string} email
 * @param {string} code
 * @param {string} newPassword
 */
async function completePasswordReset(email, code, newPassword) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.passwordResetCode || !user.passwordResetExp) {
    throw new Error("Invalid or expired reset code");
  }

  // Check if code is expired
  if (new Date() > user.passwordResetExp) {
    throw new Error("Reset code has expired. Please request a new one.");
  }

  // Verify code
  if (user.passwordResetCode !== code) {
    throw new Error("Invalid reset code");
  }

  // Hash and update password
  const hashedPassword = await bcrypt.hash(newPassword, config.auth.bcryptRounds);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetCode: null,
      passwordResetExp: null,
    },
  });

  logger.info({ message: "Password reset completed", userId: user.id });
  return { success: true, message: "Password reset successfully" };
}

/**
 * Get user profile with subscription and usage statistics
 */
async function getUserProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, email: true, plan: true, emailVerified: true,
      stripeCustomerId: true, subscriptionEnd: true, createdAt: true,
      _count: { select: { generations: true } },
    },
  });

  if (!user) throw new Error("User not found");
  return user;
}

module.exports = {
  register,
  login,
  verifyEmail,
  initiatePasswordReset,
  completePasswordReset,
  getUserProfile,
};
