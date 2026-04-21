const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '7d';

/**
 * Register a new user
 */
const register = async ({ name, email, password }) => {
  // Check if user already exists
  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict('Email already registered');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const user = await User.create({
    name,
    email,
    passwordHash,
  });

  // Generate token
  const token = generateToken(user);

  return {
    user: sanitizeUser(user),
    token,
  };
};

/**
 * Login with email and password
 */
const login = async ({ email, password }) => {
  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Generate token
  const token = generateToken(user);

  return {
    user: sanitizeUser(user),
    token,
  };
};

/**
 * Get current user profile
 */
const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return sanitizeUser(user);
};

/**
 * Update user profile
 */
const updateProfile = async (userId, updates) => {
  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return sanitizeUser(user);
};

// ——— Helpers ———

function generateToken(user) {
  return jwt.sign(
    { userId: user._id, email: user.email },
    env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

function sanitizeUser(user) {
  const obj = user.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
}

module.exports = { register, login, getMe, updateProfile };
