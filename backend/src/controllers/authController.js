const { asyncHandler } = require("../middleware/errorHandler");
const { register, login, getUserProfile } = require("../services/authService");

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const result = await register(name, email, password);

  res.status(201).json({
    message: "Registration successful",
    user: result.user,
    token: result.token,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await login(email, password);

  res.json({
    message: "Login successful",
    user: result.user,
    token: result.token,
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await getUserProfile(req.user.id);

  res.json({ user });
});

module.exports = { register, login, getProfile };
