/**
 * Middleware unit tests
 * Tests auth, rate limiter, validation, and error handling
 *
 * Run: npm test -- tests/middleware.test.js
 */

const jwt = require("jsonwebtoken");
const { z } = require("zod");

// ========================
// Auth middleware tests
// ========================
describe("Auth Middleware", () => {
  let authenticate;

  beforeEach(() => {
    jest.mock("jsonwebtoken");
    // Reset module cache to re-import with mocked jwt
    delete require.cache[require.resolve("../src/middleware/auth")];
    authenticate = require("../src/middleware/auth").authenticate;
    process.env.JWT_SECRET = "test-secret";
  });

  afterEach(() => {
    jest.resetModules();
  });

  it("should reject requests without Authorization header", () => {
    const req = { headers: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Access denied. No token provided.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should reject requests with invalid token prefix", () => {
    const req = { headers: { authorization: "Token invalid" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});

// ========================
// Validation middleware tests
// ========================
describe("Validation Middleware", () => {
  const { validate } = require("../src/middleware/validate");

  it("should pass valid data through", () => {
    const schema = z.object({ name: z.string().min(1) });
    const middleware = validate(schema);

    const req = { body: { name: "Test" } };
    const res = {};
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should reject invalid data with 400", () => {
    const schema = z.object({ email: z.string().email() });
    const middleware = validate(schema);

    const resJson = jest.fn();
    const req = { body: { email: "not-an-email" } };
    const res = { status: jest.fn().mockReturnThis(), json: resJson };
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(resJson).toHaveBeenCalledWith({
      error: "Validation failed",
      details: expect.any(Array),
    });
    expect(next).not.toHaveBeenCalled();
  });
});
