const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Genera un token JWT para un usuario
 * @param {Object} payload - Datos del usuario (id, username, rol)
 * @returns {String} Token JWT
 */
const generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

/**
 * Verifica y decodifica un token JWT
 * @param {String} token - Token JWT a verificar
 * @returns {Object} Datos decodificados del token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};

module.exports = {
  generateToken,
  verifyToken
};

