const express = require('express');
const { run, get, all } = require('../database');
const { verifyToken } = require('./auth');

const router = express.Router();

// Apply verifyToken middleware
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

// Listar barbeiros
router.get('/', async (req, res) => {
  try {
    const barbers = await all(
      'SELECT * FROM barbers WHERE user_id = ? AND active = 1 ORDER BY name',
      [req.userId]
    );
    
    // Buscar especialidades e dias para cada barbeiro
    for (let barber of barbers) {
      barber.specialties = await all(
        'SELECT service_id FROM barber_specialties WHERE barber_id = ?',
        [barber.id]
      );
      barber.working_days = await all(
        'SELECT day_of_week FROM barber_working_days WHERE barber_id = ?',
        [barber.id]
      );
    }
    
    res.json(barbers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obter um barbeiro
router.get('/:id', async (req, res) => {
  try {
    const barber = await get(
      'SELECT * FROM barbers WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    
    if (!barber) {
      return res.status(404).json({ error: 'Barbeiro não encontrado' });
    }

    barber.specialties = await all(
      'SELECT service_id FROM barber_specialties WHERE barber_id = ?',
      [barber.id]
    );
    barber.working_days = await all(
      'SELECT day_of_week FROM barber_working_days WHERE barber_id = ?',
      [barber.id]
    );

    res.json(barber);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar barbeiro
router.post('/', async (req, res) => {
  try {
    const { name, nickname, email, phone, commission, color, start_time, end_time, specialties, working_days } = req.body;
    
    const result = await run(
      `INSERT INTO barbers (user_id, name, nickname, email, phone, commission, color, start_time, end_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, name, nickname, email, phone, commission, color, start_time, end_time]
    );

    const barberId = result.lastID;

    // Adicionar especialidades
    if (specialties && specialties.length) {
      for (let serviceId of specialties) {
        await run(
          'INSERT INTO barber_specialties (barber_id, service_id) VALUES (?, ?)',
          [barberId, serviceId]
        );
      }
    }

    // Adicionar dias de trabalho
    if (working_days && working_days.length) {
      for (let day of working_days) {
        await run(
          'INSERT INTO barber_working_days (barber_id, day_of_week) VALUES (?, ?)',
          [barberId, day]
        );
      }
    }

    const barber = await get('SELECT * FROM barbers WHERE id = ?', [barberId]);
    res.status(201).json({ message: 'Barbeiro criado', barber });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Atualizar barbeiro
router.put('/:id', async (req, res) => {
  try {
    const { name, nickname, email, phone, commission, color, start_time, end_time, specialties, working_days } = req.body;
    
    await run(
      `UPDATE barbers SET name = ?, nickname = ?, email = ?, phone = ?, commission = ?, color = ?, start_time = ?, end_time = ?
       WHERE id = ? AND user_id = ?`,
      [name, nickname, email, phone, commission, color, start_time, end_time, req.params.id, req.userId]
    );

    // Deletar e re-adicionar especialidades
    await run('DELETE FROM barber_specialties WHERE barber_id = ?', [req.params.id]);
    if (specialties && specialties.length) {
      for (let serviceId of specialties) {
        await run(
          'INSERT INTO barber_specialties (barber_id, service_id) VALUES (?, ?)',
          [req.params.id, serviceId]
        );
      }
    }

    // Deletar e re-adicionar dias de trabalho
    await run('DELETE FROM barber_working_days WHERE barber_id = ?', [req.params.id]);
    if (working_days && working_days.length) {
      for (let day of working_days) {
        await run(
          'INSERT INTO barber_working_days (barber_id, day_of_week) VALUES (?, ?)',
          [req.params.id, day]
        );
      }
    }

    const barber = await get('SELECT * FROM barbers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Barbeiro atualizado', barber });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Deletar barbeiro
router.delete('/:id', async (req, res) => {
  try {
    await run(
      'UPDATE barbers SET active = 0 WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    res.json({ message: 'Barbeiro removido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
