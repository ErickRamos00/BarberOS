const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./src/config');
const { errorHandler, notFoundHandler, createRateLimiter } = require('./src/middleware');

const app = express();

// ===== SEGURANÇA =====
app.use(cors()); // Liberado para garantir conectividade total na Vercel
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

// ===== ROTAS DINÂMICAS (SAFE BOOT) =====
// Carregamos as rotas dentro de blocos try/catch para evitar que erro no require de uma delas (como o sqlite3)
// derrube o servidor inteiro no boot da Vercel.

const registerSafeRoute = (path, modulePath) => {
  try {
    const route = require(modulePath);
    app.use(path, route);
    console.log(`✅ Rota registrada: ${path}`);
  } catch (err) {
    console.error(`⚠️ Falha ao registrar rota ${path}:`, err.message);
  }
};

// Registro de todas as rotas do sistema
registerSafeRoute('/api/auth', './src/routes/auth');
registerSafeRoute('/api/barbers', './src/routes/barbers');
registerSafeRoute('/api/services', './src/routes/services');
registerSafeRoute('/api/appointments', './src/routes/appointments');
registerSafeRoute('/api/clients', './src/routes/clients');
registerSafeRoute('/api/config', './src/routes/config');
registerSafeRoute('/api/finance', './src/routes/finance');
registerSafeRoute('/api/reactivation', './src/routes/reactivation');
registerSafeRoute('/api/whatsapp', './src/routes/whatsapp');
registerSafeRoute('/api/messages', './src/routes/message-history');
registerSafeRoute('/api/email', './src/routes/email');
registerSafeRoute('/api/shop', './src/routes/shop');
registerSafeRoute('/api/automation', './src/routes/automation');

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
