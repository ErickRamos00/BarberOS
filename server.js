const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./src/config');
const { errorHandler, notFoundHandler, createRateLimiter } = require('./src/middleware');
const { getDb } = require('./src/database');

// Pré-inicializar banco de dados
getDb();

// Importação direta das rotas para garantir que a Vercel as inclua no build
const authRoutes = require('./src/routes/auth');
const barbersRoutes = require('./src/routes/barbers');
const servicesRoutes = require('./src/routes/services');
const appointmentsRoutes = require('./src/routes/appointments');
const clientsRoutes = require('./src/routes/clients');
const configRoutes = require('./src/routes/config');
const financeRoutes = require('./src/routes/finance');
const reactivationRoutes = require('./src/routes/reactivation');
const whatsappRoutes = require('./src/routes/whatsapp');
const messageHistoryRoutes = require('./src/routes/message-history');
const emailRoutes = require('./src/routes/email');
const shopRoutes = require('./src/routes/shop');
const automationRoutes = require('./src/routes/automation');

const app = express();

// ===== SEGURANÇA =====
app.use(cors()); // Liberado para garantir conectividade total
app.use(express.json({ limit: config.MAX_UPLOAD_SIZE }));
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiter
if (config.isProduction()) {
  app.use(createRateLimiter(config.MAX_REQUESTS_PER_MINUTE, 60000));
}

// ===== LOGGING =====
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ===== ROTAS =====
app.use('/api/auth', authRoutes);
app.use('/api/barbers', barbersRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/config', configRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/reactivation', reactivationRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/messages', messageHistoryRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/automation', automationRoutes);

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
      res.status(200).send('<h1>BarberOS - Iniciando...</h1><script>setTimeout(()=>location.reload(),2000)</script>');
    }
  });
});

// ===== TRATAMENTO DE ERROS =====
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
