const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./src/config');
const { errorHandler } = require('./src/middleware');

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
const emailRoutes = require('./src/routes/email');
const shopRoutes = require('./src/routes/shop');
const automationRoutes = require('./src/routes/automation');

const app = express();

// ===== SEGURANÇA =====
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json({ limit: config.MAX_UPLOAD_SIZE }));
app.use(express.static(path.join(__dirname, 'public')));

// Configurações básicas (Hardcoded para boot seguro)
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = '*';

// ===== LOGGING =====
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ===== INICIALIZAÇÃO =====
// Desativada no boot para garantir que o site abra

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
app.use('/api/email', emailRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/automation', automationRoutes);

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
app.get('*', (req, res) => {
  // Ignorar assets comuns se não existirem
  if (req.path.endsWith('.ico') || req.path.endsWith('.png') || req.path.endsWith('.jpg')) {
    return res.status(404).end();
  }
  
  // Se for uma rota de API que não existe, retorna 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  
  // Para qualquer outra rota, serve o index.html (SPA)
  const indexPath = path.join(__dirname, 'public', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // Se der erro ao servir o index, pelo menos não crasha o servidor todo
      res.status(200).send(`
        <html>
          <body style="background:#0d0d0d;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">
            <div style="text-align:center;">
              <h1>✂️ BarberOS</h1>
              <p>O sistema está iniciando... Por favor, atualize em alguns segundos.</p>
              <script>setTimeout(() => location.reload(), 3000)</script>
            </div>
          </body>
        </html>
      `);
    }
  });
});

// ===== TRATAMENTO DE ERROS =====
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
