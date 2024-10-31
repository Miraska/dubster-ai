const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config.js');

const generateAccessToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: "24h", algorithm: "HS256" });
const verifyToken = (token) => jwt.verify(token, JWT_SECRET);

module.exports = {
  generateAccessToken,
  verifyToken
};
