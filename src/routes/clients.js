const express = require('express');
const { run, get, all } = require('../database');

const router = express.Router();

// Middleware de autenticação
router.use((req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, 'barber-secret-key-change-in-production');
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// Listar clientes
router.get('/', async (req, res) => {
  try {
    const clients = await all(
      'SELECT * FROM clients WHERE user_id = ? ORDER BY name',
      [req.userId]
    );
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
    res.status(201).json({ message: 'Cliente criado', client });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Atualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    await run(
      `UPDATE clients SET name = ?, email = ?, phone = ?
       WHERE id = ? AND user_id = ?`,
      [name, email, phone, req.params.id, req.userId]
    );

    const client = await get('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    res.json({ message: 'Cliente atualizado', client });
  } catch (err) {
    res.status(400).json({ error: err.message });
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
