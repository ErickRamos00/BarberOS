const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./src/config');
const db = require('./src/database');
const { errorHandler, notFoundHandler, createRateLimiter } = require('./src/middleware');

// Rotas
const authRoutes = require('./src/routes/auth');
const barberRoutes = require('./src/routes/barbers');
const serviceRoutes = require('./src/routes/services');
const appointmentRoutes = require('./src/routes/appointments');
const clientRoutes = require('./src/routes/clients');
const configRoutes = require('./src/routes/config');
const financeRoutes = require('./src/routes/finance');
const reactivationRoutes = require('./src/routes/reactivation');
const whatsappRoutes = require('./src/routes/whatsapp');
const messageHistoryRoutes = require('./src/routes/message-history');

const app = express();

// ===== SEGURANÇA =====
app.use(cors({ origin: config.CORS_ORIGIN }));
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

// ===== INICIALIZAÇÃO =====
db.initDatabase();

// ===== ROTAS =====
app.use('/api/auth', authRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/config', configRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/reactivation', reactivationRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/messages', messageHistoryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    environment: config.NODE_ENV,
    uptime: process.uptime()
  });
});

// Status
app.get('/api/status', (req, res) => {
  res.json({
    name: 'BarberOS',
    version: '1.0.0',
    author: 'BarberOS Team',
    status: 'running',
    timestamp: new Date()
  });
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ===== TRATAMENTO DE ERROS =====
app.use(notFoundHandler);
app.use(errorHandler);

// ===== INICIAR SERVIDOR =====
const server = app.listen(config.PORT, config.HOST, () => {
  console.log(`
╔════════════════════════════════════════╗
║         🚀 BarberOS Backend             ║
╚════════════════════════════════════════╝

📍 Server: http://${config.HOST}:${config.PORT}
🌍 Frontend: http://${config.HOST}:${config.PORT}
🔒 Environment: ${config.NODE_ENV.toUpperCase()}
📅 Started: ${new Date().toLocaleString('pt-BR')}

💡 Dicas úteis:
  • Acesse http://${config.HOST}:${config.PORT} no navegador
  • Use email: demo@barberos.app e senha: demo123
  • Veja os logs acima para monitorar requisições
  • Pressione Ctrl+C para parar o servidor

═════════════════════════════════════════
  `);

  if (!config.isProduction()) {
    console.log('ℹ️ Modo desenvolvimento ativo');
  } else {
    console.log('⚠️ Modo produção - Certifique-se de alterar JWT_SECRET');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n📛 Sinal SIGTERM recebido - Desligando...');
  server.close(() => {
    console.log('✅ Servidor encerrado com sucesso');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n📛 Sinal SIGINT recebido - Desligando...');
  server.close(() => {
    console.log('✅ Servidor encerrado com sucesso');
    process.exit(0);
  });
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada não tratada:', reason);
  process.exit(1);
});

module.exports = app;
