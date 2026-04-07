/**
 * Auth controller — handles registration, login, email verification, password reset
 */

const config = require("../config");
const { asyncHandler } = require("../middleware/errorHandler");
const {
  register,
  login,
  verifyEmail,
  initiatePasswordReset,
  completePasswordReset,
  getUserProfile,
} = require("../services/authService");
const { sendEmail, verificationEmail, passwordResetEmail, welcomeEmail } = require("../services/emailService");
const { track } = require("../services/analyticsService");
const { apiResponse } = require("../utils/constants");

const appUrl = process.env.FRONTEND_URL || "http://localhost:3000";

/** POST /api/auth/register */
const registerCtrl = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const result = await register(name, email, password);

  // Send verification email (don't block response)
  const emailContent = verificationEmail(result.verificationToken, appUrl);
  sendEmail({ to: email, subject: emailContent.subject, html: emailContent.html }).catch((e) =>
    console.error("Verification email failed:", e.message)
  );

  // Send welcome email
  const welcome = welcomeEmail(name);
  sendEmail({ to: email, subject: welcome.subject, html: welcome.html }).catch((e) =>
    console.error("Welcome email failed:", e.message)
  );

  // Track signup
  track("user_registered", result.user.id, { name, ip: req.ip }).catch(() => {});

  res.status(201).json(
    apiResponse(true, "Registration successful. Check your email to verify.", {
      user: result.user,
      token: result.token,
    })
  );
});

/** POST /api/auth/login */
const loginCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await login(email, password);

  track("login", result.user.id, { ip: req.ip }).catch(() => {});

  res.json(apiResponse(true, "Login successful", { user: result.user, token: result.token }));
});

/** POST /api/auth/verify-email */
const verifyEmailCtrl = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const result = await verifyEmail(token);

  res.json(apiResponse(result.success, result.message, result.user || null));
});

/** POST /api/auth/request-reset */
const requestPasswordResetCtrl = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await initiatePasswordReset(email);

  // Send reset email if user exists
  if (result.code && email) {
    const emailContent = passwordResetEmail(result.code, appUrl);
    sendEmail({ to: email, subject: emailContent.subject, html: emailContent.html }).catch((e) =>
      console.error("Reset email failed:", e.message)
    );
  }

  res.json(apiResponse(true, result.message));
});

/** POST /api/auth/reset-password */
const completePasswordResetCtrl = asyncHandler(async (req, res) => {
  const { email, code, password } = req.body;
  const result = await completePasswordReset(email, code, password);

  res.json(apiResponse(true, result.message));
});

/** GET /api/auth/me */
const getProfileCtrl = asyncHandler(async (req, res) => {
  const user = await getUserProfile(req.user.id);
  res.json(apiResponse(true, "OK", { user }));
});

module.exports = {
  register: registerCtrl,
  login: loginCtrl,
  verifyEmail: verifyEmailCtrl,
  requestPasswordReset: requestPasswordResetCtrl,
  completePasswordReset: completePasswordResetCtrl,
  getProfile: getProfileCtrl,
};
