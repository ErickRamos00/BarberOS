/**
 * Middleware para tratamento de erros
 */

const config = require('../config');

class ErrorHandler extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Middleware de tratamento de erros
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || config.MESSAGES.ERROR_INTERNAL_SERVER;

  console.error(`[${new Date().toISOString()}] ERROR:`, {
    status: statusCode,
    message,
    path: req.path,
    method: req.method,
    stack: err.stack
  });

  res.status(statusCode).json({
    error: message,
    ...(config.isDevelopment() && { stack: err.stack })
  });
};

// Middleware para rotas não encontradas
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: `Rota não encontrada: ${req.path}`
  });
};

// Wrapper para funções async em rotas
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Wrapper com tratamento de validação
const validateRequest = (validationRules) => {
  return (req, res, next) => {
    const errors = [];

    for (const rule of validationRules) {
      const { field, required, type, min, max, custom } = rule;
      const value = req.body[field];

      // Verificar se é obrigatório
      if (required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} é obrigatório`);
        continue;
      }

      if (value !== undefined && value !== null && value !== '') {
        // Verificar tipo
        if (type && typeof value !== type) {
          errors.push(`${field} deve ser do tipo ${type}`);
        }

        // Verificar tamanho mínimo
        if (min !== undefined) {
          if (typeof value === 'string' && value.length < min) {
            errors.push(`${field} deve ter no mínimo ${min} caracteres`);
          }
          if (typeof value === 'number' && value < min) {
            errors.push(`${field} deve ser no mínimo ${min}`);
          }
        }

        // Verificar tamanho máximo
        if (max !== undefined) {
          if (typeof value === 'string' && value.length > max) {
            errors.push(`${field} deve ter no máximo ${max} caracteres`);
          }
          if (typeof value === 'number' && value > max) {
            errors.push(`${field} deve ser no máximo ${max}`);
          }
        }

        // Validação customizada
        if (custom && !custom(value)) {
          errors.push(`${field} é inválido`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    next();
  };
};

// Middleware de rate limiting simples
const createRateLimiter = (maxRequests = 100, windowMs = 60000) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const userRequests = requests.get(ip) || [];

    // Remover requisições antigas
    const recentRequests = userRequests.filter(time => now - time < windowMs);

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Muitas requisições. Tente novamente mais tarde.'
      });
    }

    recentRequests.push(now);
    requests.set(ip, recentRequests);

    next();
  };
};

module.exports = {
  ErrorHandler,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  validateRequest,
  createRateLimiter
};
