/**
 * Email Service
 *
 * Sends emails via configurable SMTP provider (Resend, Gmail, SendGrid, etc.)
 * Uses Nodemailer — lightweight, battle-tested, zero external API deps.
 *
 * Features:
 * - HTML + text fallback for all emails
 * - Verification email with secure token
 * - Password reset email
 * - Welcome email for new users
 * - Configurable provider (just change SMTP settings)
 *
 * Setup:
 *   EMAIL_PROVIDER=resend|gmail|smtp
 *   EMAIL_HOST=smtp.resend.com
 *   EMAIL_PORT=587
 *   EMAIL_USER=apikey
 *   EMAIL_PASS=your_api_key
 *   EMAIL_FROM=noreply@yourdomain.com
 */

const nodemailer = require("nodemailer");
const crypto = require("crypto");
const logger = require("../utils/logger");
const config = require("../config");

/**
 * Create and cache Nodemailer transporter
 * Lazy-initialized on first send
 */
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const provider = process.env.EMAIL_PROVIDER || "smtp";

  if (provider === "resend") {
    // Resend: https://resend.com
    transporter = nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 465,
      secure: true,
      auth: {
        user: "resend",
        pass: process.env.EMAIL_PASS,
      },
    });
  } else if (provider === "gmail") {
    // Gmail: Use App Password (not account password)
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Generic SMTP
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "localhost",
      port: parseInt(process.env.EMAIL_PORT, 10) || 587,
      secure: false,
      auth: process.env.EMAIL_USER
        ? { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        : undefined,
    });
  }

  return transporter;
}

/**
 * Send an email with HTML + text fallback
 * @param {object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body
 * @param {string} options.text - Plain text fallback
 * @returns {Promise<string>} messageId
 */
async function sendEmail({ to, subject, html, text }) {
  const mailer = getTransporter();

  const fromName = process.env.EMAIL_FROM_NAME || "TubeAI";
  const from = process.env.EMAIL_FROM || "noreply@tubeai.com";

  try {
    const info = await mailer.sendMail({
      from: `"${fromName}" <${from}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for text fallback
    });

    logger.info({ message: "Email sent", to, subject, messageId: info.messageId });
    return info.messageId;
  } catch (error) {
    logger.error({ message: "Email send failed", to, subject, error: error.message });
    throw new Error("Failed to send email. Please try again later.");
  }
}

/**
 * Generate a cryptographically secure token
 * @returns {string} 32-byte hex token
 */
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Generate a 6-digit verification code
 * @returns {string}
 */
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ===================== Email Templates =====================

/**
 * Email verification template
 */
function verificationEmail(token, appUrl) {
  const verifyUrl = `${appUrl}/auth/verify-email?token=${token}`;

  return {
    subject: "Verify your TubeAI account",
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ef4444;">🎬 Verify your TubeAI account</h1>
        <p>Click the button below to verify your email address:</p>
        <a href="${verifyUrl}"
           style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px;
                  text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
          Verify Email
        </a>
        <p style="color: #64748b; font-size: 14px;">
          Or copy this link: ${verifyUrl}
        </p>
        <p style="color: #64748b; font-size: 12px;">This link expires in 24 hours.</p>
      </div>
    `,
  };
}

/**
 * Password reset email template
 */
function passwordResetEmail(code, appUrl) {
  return {
    subject: "Reset your TubeAI password",
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ef4444;">🔑 Reset your password</h1>
        <p>Use this code to reset your password:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px;
                    background: #f1f5f9; border-radius: 8px; text-align: center; margin: 20px 0;">
          ${code}
        </div>
        <p style="color: #64748b; font-size: 14px;">
          Or visit: ${appUrl}/auth/reset-password?code=${code}
        </p>
        <p style="color: #64748b; font-size: 12px;">This code expires in 15 minutes.</p>
      </div>
    `,
  };
}

/**
 * Welcome email template for new users
 */
function welcomeEmail(name) {
  return {
    subject: "Welcome to TubeAI! 🎬",
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ef4444;">Welcome to TubeAI, ${name}! 🎬</h1>
        <p>Your account has been created successfully.</p>
        <p>You get <strong>3 free AI generations per day</strong> to create video ideas, titles, and scripts.</p>
        <p><a href="${process.env.FRONTEND_URL}/dashboard">Go to Dashboard →</a></p>
        <p style="color: #64748b; font-size: 14px;">Need help? Reply to this email anytime.</p>
      </div>
    `,
  };
}

// ===================== Public API =====================

module.exports = {
  getTransporter,
  sendEmail,
  generateToken,
  generateVerificationCode,
  verificationEmail,
  passwordResetEmail,
  welcomeEmail,
};
