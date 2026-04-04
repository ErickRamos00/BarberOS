// routes/whatsapp.js - Gerenciamento de WhatsApp e mensagens

const express = require('express');
const router = express.Router();
const db = require('../database');
const { validateRequest, asyncHandler } = require('../middleware');
const { isValidPhone } = require('../validators');

// Provedores suportados
const PROVIDERS = {
  'z-api': 'Z-API',
  'evolution': 'Evolution API',
  '360dialog': '360dialog',
  'twilio': 'Twilio'
};

// GET: Configuração WhatsApp atual
router.get('/config', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  let config = await db.get('SELECT * FROM whatsapp_config WHERE user_id = ?', [userId]);
  
  if (!config) {
    config = { provider: 'manual', is_connected: 0 };
  }

  res.json({ success: true, config });
}));

// POST: Salvar configuração WhatsApp
router.post('/config', asyncHandler(async (req, res) => {
  validateRequest(req, ['provider']);
  const userId = req.user.id;
  const { provider, api_token, phone_origin, webhook_url } = req.body;

  if (!PROVIDERS[provider] && provider !== 'manual') {
    return res.status(400).json({ error: 'Provedor inválido' });
  }

  const exists = await db.get('SELECT id FROM whatsapp_config WHERE user_id = ?', [userId]);

  if (exists) {
    await db.run(
      'UPDATE whatsapp_config SET provider = ?, api_token = ?, phone_origin = ?, webhook_url = ?, updated_at = datetime("now") WHERE user_id = ?',
      [provider, api_token || null, phone_origin || null, webhook_url || null, userId]
    );
  } else {
    await db.run(
      'INSERT INTO whatsapp_config (user_id, provider, api_token, phone_origin, webhook_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime("now"), datetime("now"))',
      [userId, provider, api_token || null, phone_origin || null, webhook_url || null]
    );
  }

  res.json({ success: true, message: 'Configuração salva', provider });
}));

// POST: Testar conexão WhatsApp
router.post('/test', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const config = await db.get('SELECT * FROM whatsapp_config WHERE user_id = ?', [userId]);

  if (!config) {
    return res.status(400).json({ error: 'Nenhuma configuração encontrada' });
  }

  if (config.provider === 'manual') {
    return res.json({ success: true, message: 'Modo manual ativado', provider: 'manual' });
  }

  // Simulação de teste - em produção, consumir API real
  const testResults = {
    'z-api': { success: config.api_token ? true : false, message: 'Conexão Z-API testada' },
    'evolution': { success: config.api_token ? true : false, message: 'Conexão Evolution API testada' },
    '360dialog': { success: config.api_token ? true : false, message: 'Conexão 360dialog testada' },
    'twilio': { success: config.api_token ? true : false, message: 'Conexão Twilio testada' }
  };

  const result = testResults[config.provider] || { success: false, message: 'Provedor desconhecido' };
  
  if (result.success) {
    await db.run('UPDATE whatsapp_config SET is_connected = 1 WHERE user_id = ?', [userId]);
  }

  res.json({ success: true, ...result, connected: result.success });
}));

// POST: Enviar mensagem WhatsApp
router.post('/send', asyncHandler(async (req, res) => {
  validateRequest(req, ['phone', 'message']);
  const userId = req.user.id;
  const { phone, message, client_id } = req.body;

  if (!isValidPhone(phone)) {
    return res.status(400).json({ error: 'Telefone inválido' });
  }

  const config = await db.get('SELECT * FROM whatsapp_config WHERE user_id = ?', [userId]);

  // Registrar no histórico
  const history = await db.run(
    'INSERT INTO message_history (user_id, client_id, template_type, message_content, recipient_phone, provider, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"))',
    [userId, client_id || null, 'custom', message, phone, config?.provider || 'manual', 'pending']
  );

  if (config?.provider === 'manual') {
    const encodedMsg = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodedMsg}`;
    return res.json({ 
      success: true, 
      method: 'manual', 
      message: 'Abra o WhatsApp Web com a mensagem preenchida',
      whatsapp_link: whatsappUrl,
      history_id: history.lastID
    });
  }

  // Envio via API (simulado)
  res.json({ success: true, message: 'Mensagem enviada', provider: config?.provider, history_id: history.lastID });
}));

// GET: Templates de mensagens
router.get('/templates', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const templates = await db.all('SELECT * FROM message_templates WHERE user_id = ? ORDER BY template_type', [userId]);

  res.json({ success: true, templates });
}));

// POST: Salvar template
router.post('/templates', asyncHandler(async (req, res) => {
  validateRequest(req, ['template_type', 'title', 'content']);
  const userId = req.user.id;
  const { template_type, title, content } = req.body;

  const exists = await db.get('SELECT id FROM message_templates WHERE user_id = ? AND template_type = ?', [userId, template_type]);

  if (exists) {
    await db.run(
      'UPDATE message_templates SET title = ?, content = ?, updated_at = datetime("now") WHERE user_id = ? AND template_type = ?',
      [title, content, userId, template_type]
    );
  } else {
    await db.run(
      'INSERT INTO message_templates (user_id, template_type, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, datetime("now"), datetime("now"))',
      [userId, template_type, title, content]
    );
  }

  res.json({ success: true, message: 'Template salvo', template_type });
}));

module.exports = router;
