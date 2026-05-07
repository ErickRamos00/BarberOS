/**
 * Middleware de autenticacao JWT centralizado
 * Todas as rotas devem usar este middleware em vez de hardcodar o secret
 */

const jwt = require('jsonwebtoken');
const config = require('../config');

function authenticateToken(req, res, next) {
  var authHeader = req.headers['authorization'];
  var token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: config.MESSAGES.ERROR_TOKEN_MISSING });
  }

  try {
    var decoded = jwt.verify(token, config.JWT_SECRET);
    req.userId = decoded.id;
    req.role = decoded.role || 'shop'; // Default role is shop
    req.barberId = decoded.barberId;
    next();
  } catch (err) {
    return res.status(401).json({ error: config.MESSAGES.ERROR_TOKEN_INVALID });
  }
}

module.exports = { authenticateToken };
