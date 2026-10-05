const jwt = require('jsonwebtoken');
const env = require('./env');

function signToken(payload, options = {}) {
  const expiresIn = options.expiresIn || env.JWT_EXPIRES_IN;
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn, ...options });
}

function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

module.exports = {
  signToken,
  verifyToken
};
