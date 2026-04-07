const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../server");

const SALT_ROUNDS = 10;

/**
 * Register a new user
 */
async function register(name, email, password) {
  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Email is already registered");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      plan: true,
      createdAt: true,
    },
  });

  // Generate JWT
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  return { user, token };
}

/**
 * Login user
 */
async function login(email, password) {
  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  // Generate JWT
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
}

/**
 * Get user profile
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
