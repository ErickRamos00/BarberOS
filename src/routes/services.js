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

// Listar serviços
router.get('/', async (req, res) => {
  try {
    const services = await all(
      'SELECT * FROM services WHERE user_id = ? AND active = 1 ORDER BY name',
      [req.userId]
    );
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obter um serviço
router.get('/:id', async (req, res) => {
  try {
    const service = await get(
      'SELECT * FROM services WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    
    if (!service) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar serviço
router.post('/', async (req, res) => {
  try {
    const { name, duration, price, description } = req.body;
    
    const result = await run(
      `INSERT INTO services (user_id, name, duration, price, description)
       VALUES (?, ?, ?, ?, ?)`,
      [req.userId, name, duration, price, description]
    );

    const service = await get('SELECT * FROM services WHERE id = ?', [result.lastID]);
    res.status(201).json({ message: 'Serviço criado', service });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Atualizar serviço
router.put('/:id', async (req, res) => {
  try {
    const { name, duration, price, description } = req.body;
    
    await run(
      `UPDATE services SET name = ?, duration = ?, price = ?, description = ?
       WHERE id = ? AND user_id = ?`,
      [name, duration, price, description, req.params.id, req.userId]
    );

    const service = await get('SELECT * FROM services WHERE id = ?', [req.params.id]);
    res.json({ message: 'Serviço atualizado', service });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Deletar serviço
router.delete('/:id', async (req, res) => {
  try {
    await run(
      'UPDATE services SET active = 0 WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    res.json({ message: 'Serviço removido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
