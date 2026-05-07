const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./src/config');
const { errorHandler, notFoundHandler, createRateLimiter } = require('./src/middleware');

const app = express();

// ===== SEGURANÇA =====
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json({ limit: config.MAX_UPLOAD_SIZE }));
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiter (Proteção básica)
if (config.isProduction()) {
  app.use(createRateLimiter(config.MAX_REQUESTS_PER_MINUTE, 60000));
}

// ===== LOGGING =====
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'BarberOS está vivo!',
    time: new Date().toISOString(),
    node_version: process.version
  });
});

// Serve frontend
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('<h1>BarberOS - Quase lá!</h1><p>O servidor ligou, mas o arquivo visual está sendo localizado. Atualize em instantes.</p>');
    }
  });
});

// ===== TRATAMENTO DE ERROS =====
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
