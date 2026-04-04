// routers/reactivation.js - Gerenciamento de clientes inativos

const express = require('express');
const router = express.Router();
const db = require('../database');
const { validateRequest, asyncHandler } = require('../middleware');
const { isValidPhone, sanitizeString } = require('../validators');

// GET: Listar clientes para reativação
router.get('/', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { days = 30, status = 'all' } = req.query;

  let query = `
    SELECT c.*, 
           (SELECT MAX(date) FROM appointments WHERE client_id = c.id) as last_visit,
           (SELECT service FROM appointments WHERE client_id = c.id ORDER BY date DESC LIMIT 1) as last_service,
           (SELECT barber FROM appointments WHERE client_id = c.id ORDER BY date DESC LIMIT 1) as last_barber
    FROM clients c WHERE c.user_id = ?
    AND (? = 'all' OR (
      ? = 'inactive' AND last_visit < datetime('now', '-' || ? || ' days')
    ))
    ORDER BY last_visit DESC LIMIT 500
  `;

  const clients = await db.all(query, [userId, status, status, days]);
  res.json({ success: true, clients, summary: { total: clients.length, inactive: clients.filter(c => !c.last_visit || new Date(c.last_visit) < new Date(Date.now() - days * 86400000)).length } });
}));

// POST: Enviar mensagem para clientes selecionados
router.post('/send-bulk', asyncHandler(async (req, res) => {
  validateRequest(req, ['client_ids', 'template_type']);
  const { client_ids, template_type, message } = req.body;
  const userId = req.user.id;

  const template = await db.get('SELECT * FROM message_templates WHERE user_id = ? AND template_type = ?', [userId, template_type]);
  if (!template) return res.status(404).json({ error: 'Template não encontrado' });

  const results = [];
  for (const clientId of client_ids) {
    const history = await db.run(
      'INSERT INTO message_history (user_id, client_id, template_type, message_content, recipient_phone, status, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime("now"))',
      [userId, clientId, template_type, message || template.content, '', 'pending']
    );
    results.push({ clientId, messageId: history.lastID });
  }

  res.json({ success: true, sent: results.length, results });
}));

// GET: Badge com total de inativos
router.get('/inactive-count', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const days = req.query.days || 30;

  const count = await db.get(`
    SELECT COUNT(*) as total FROM clients c
    WHERE c.user_id = ? AND (
      c.last_visit IS NULL OR 
      c.last_visit < datetime('now', '-' || ? || ' days')
    )
  `, [userId, days]);

  res.json({ success: true, inactive_count: count.total });
}));

module.exports = router;
