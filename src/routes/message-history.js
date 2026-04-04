// routes/message-history.js - Histórico de envios

const express = require('express');
const router = express.Router();
const db = require('../database');
const { asyncHandler } = require('../middleware');

// GET: Listar histórico de mensagens
router.get('/', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { status = '', search = '', limit = 100, offset = 0 } = req.query;

  let query = 'SELECT mh.*, c.name as client_name FROM message_history mh LEFT JOIN clients c ON mh.client_id = c.id WHERE mh.user_id = ?';
  const params = [userId];

  if (status && status !== 'all') {
    query += ' AND mh.status = ?';
    params.push(status);
  }

  if (search) {
    query += ' AND (c.name LIKE ? OR c.phone LIKE ? OR mh.recipient_phone LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  query += ' ORDER BY mh.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const messages = await db.all(query, params);

  // Contar total
  let countQuery = 'SELECT COUNT(*) as total FROM message_history mh LEFT JOIN clients c ON mh.client_id = c.id WHERE mh.user_id = ?';
  const countParams = [userId];
  
  if (status && status !== 'all') {
    countQuery += ' AND mh.status = ?';
    countParams.push(status);
  }

  if (search) {
    countQuery += ' AND (c.name LIKE ? OR c.phone LIKE ? OR mh.recipient_phone LIKE ?)';
    countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const countResult = await db.get(countQuery, countParams);

  res.json({
    success: true,
    messages,
    total: countResult.total,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
}));

// GET: Estatísticas do histórico
router.get('/stats', asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const stats = await db.all(`
    SELECT 
      status,
      COUNT(*) as count,
      template_type
    FROM message_history
    WHERE user_id = ?
    GROUP BY status, template_type
  `, [userId]);

  const totals = await db.get(`
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
      COUNT(CASE WHEN status = 'viewed' THEN 1 END) as viewed,
      COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
    FROM message_history
    WHERE user_id = ?
  `, [userId]);

  res.json({
    success: true,
    stats,
    totals
  });
}));

// POST: Atualizar status de mensagem
router.post('/:id/status', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'sent', 'viewed', 'failed', 'scheduled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }

  const message = await db.get('SELECT * FROM message_history WHERE id = ? AND user_id = ?', [id, userId]);
  if (!message) {
    return res.status(404).json({ error: 'Mensagem não encontrada' });
  }

  const timestamp = status === 'viewed' ? 'datetime("now")' : 'NULL';
  const dateField = status === 'viewed' ? ', viewed_at = datetime("now")' : '';

  await db.run(
    `UPDATE message_history SET status = ?${dateField} WHERE id = ? AND user_id = ?`,
    [status, id, userId]
  );

  res.json({ success: true, message: 'Status atualizado' });
}));

// GET: Exportar histórico como CSV
router.get('/export/csv', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { status = '' } = req.query;

  let query = 'SELECT mh.*, c.name as client_name FROM message_history mh LEFT JOIN clients c ON mh.client_id = c.id WHERE mh.user_id = ?';
  const params = [userId];

  if (status && status !== 'all') {
    query += ' AND mh.status = ?';
    params.push(status);
  }

  query += ' ORDER BY mh.created_at DESC';

  const messages = await db.all(query, params);

  // Gerar CSV
  let csv = 'Data,Cliente,Telefone,Tipo,Status,Provedor\n';
  messages.forEach(msg => {
    csv += `"${msg.created_at}","${msg.client_name || ''}","${msg.recipient_phone}","${msg.template_type}","${msg.status}","${msg.provider}"\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="historico-mensagens.csv"');
  res.send(csv);
}));

module.exports = router;
