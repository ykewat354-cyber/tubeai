/**
 * Auth controller
 * Handles registration, login, and profile requests
 * Uses standardized response format via apiResponse()
 */

const { asyncHandler } = require("../middleware/errorHandler");
const { register, login, getUserProfile } = require("../services/authService");
const { apiResponse } = require("../utils/constants");

/**
 * POST /api/auth/register
 * Registers a new user and returns JWT token
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const result = await register(name, email, password);

  res.status(201).json(
    apiResponse(true, "Registration successful", {
      user: result.user,
      token: result.token,
    })
  );
});

/**
 * POST /api/auth/login
 * Authenticates user and returns JWT token
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await login(email, password);

  res.json(
    apiResponse(true, "Login successful", {
      user: result.user,
      token: result.token,
    })
  );
});

/**
 * GET /api/auth/me
 * Returns current user profile with statistics
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await getUserProfile(req.user.id);

  res.json(apiResponse(true, "OK", { user }));
});

module.exports = { register, login, getProfile };
