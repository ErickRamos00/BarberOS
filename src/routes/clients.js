const express = require('express');
const { run, get, all } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// Listar clientes
router.get('/', async (req, res) => {
  try {
    const clients = await all(
      'SELECT * FROM clients WHERE user_id = ? ORDER BY name',
      [req.userId]
    );
    
    // Add frontend-friendly alias
    for (let c of clients) {
      c.since = c.created_at || '';
    }
    
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obter um cliente com histórico de agendamentos
router.get('/:id', async (req, res) => {
  try {
    const client = await get(
      'SELECT * FROM clients WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    
    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // Obter histórico de agendamentos
    client.appointments = await all(
      `SELECT a.*, b.nickname as barber_name, s.name as service_name, s.price
       FROM appointments a
       JOIN barbers b ON a.barber_id = b.id
       JOIN services s ON a.service_id = s.id
       WHERE a.client_id = ?
       ORDER BY a.appointment_date DESC
       LIMIT 10`,
      [client.id]
    );

    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar cliente
router.post('/', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    // Verificar se já existe
    const existing = await get(
      'SELECT id FROM clients WHERE user_id = ? AND phone = ?',
      [req.userId, phone]
    );

    if (existing) {
      return res.status(400).json({ error: 'Cliente com esse telefone já existe' });
    }

    const result = await run(
      `INSERT INTO clients (user_id, name, email, phone)
       VALUES (?, ?, ?, ?)`,
      [req.userId, name, email, phone]
    );

    const client = await get('SELECT * FROM clients WHERE id = ?', [result.lastID]);
    client.since = client.created_at || '';
    res.status(201).json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Atualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, recurrence_days } = req.body;
    
    await run(
      `UPDATE clients SET name = ?, email = ?, phone = ?, recurrence_days = ?
       WHERE id = ? AND user_id = ?`,
      [name, email, phone, recurrence_days || 15, req.params.id, req.userId]
    );

    const client = await get('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    client.since = client.created_at || '';
    res.json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Enviar lembrete manual de recorrência
router.post('/:id/send-reminder', async (req, res) => {
  try {
    const clientId = req.params.id;
    const userId = req.userId;

    const client = await get('SELECT * FROM clients WHERE id = ? AND user_id = ?', [clientId, userId]);
    if (!client) return res.status(404).json({ error: 'Cliente não encontrado' });
    if (!client.email) return res.status(400).json({ error: 'Cliente não possui e-mail cadastrado' });

    const user = await get('SELECT shop_name, shop_slug FROM users WHERE id = ?', [userId]);
    
    // Pegar último serviço
    const lastApt = await get(`
      SELECT s.name as service_name, a.appointment_date 
      FROM appointments a 
      JOIN services s ON a.service_id = s.id 
      WHERE a.client_id = ? AND a.status = 'done' 
      ORDER BY a.appointment_date DESC LIMIT 1
    `, [clientId]);

    const lastService = lastApt ? lastApt.service_name : 'Serviços';
    const recurrence = client.recurrence_days || 15;
    
    // Calcular data recomendada
    const baseDate = lastApt ? new Date(lastApt.appointment_date.split(' ')[0] + 'T12:00:00') : new Date();
    const recDate = new Date(baseDate);
    recDate.setDate(baseDate.getDate() + recurrence);
    const recommendedDate = recDate.toISOString().split('T')[0];

    const { sendRecurrenceReminder } = require('../services/email');
    await sendRecurrenceReminder(client.email, {
      clientName: client.name,
      shopName: user.shop_name,
      shopSlug: user.shop_slug,
      lastService: lastService,
      recommendedDate: recommendedDate
    });

    res.json({ message: 'Lembrete enviado com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Buscar cliente por telefone (para agendamento rápido)
router.get('/search/phone', async (req, res) => {
  try {
    const { phone } = req.query;
    
    if (!phone) {
      return res.status(400).json({ error: 'Telefone é obrigatório' });
    }

    const client = await get(
      'SELECT * FROM clients WHERE user_id = ? AND phone LIKE ?',
      [req.userId, `%${phone}%`]
    );

    if (!client) {
      return res.json(null);
    }

    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar total gasto do cliente (chamado ao confirmar agendamento)
router.post('/:id/update-stats', async (req, res) => {
  try {
    const { amount } = req.body;
    
    await run(
      `UPDATE clients 
       SET total_spent = total_spent + ?, 
           visit_count = visit_count + 1,
           last_visit = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [amount, req.params.id, req.userId]
    );

    const client = await get('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    res.json({ message: 'Estatísticas atualizadas', client });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Deletar cliente
router.delete('/:id', async (req, res) => {
  try {
    await run(
      'DELETE FROM clients WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    res.json({ message: 'Cliente removido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
