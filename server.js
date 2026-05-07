const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Configurações ultra-básicas embutidas para evitar carregar arquivos externos
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rota de teste interna
app.get('/api/test-direct', (req, res) => {
  res.json({ status: 'ok', source: 'server.js direto' });
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

module.exports = app;
