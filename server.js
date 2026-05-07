const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./src/config');
const { errorHandler } = require('./src/middleware');

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

// Health check direto no app
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
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`📍 Servidor rodando em: http://0.0.0.0:${PORT}`);
  });
}

// Exportar o app para a Vercel
module.exports = app;
