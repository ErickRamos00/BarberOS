const express = require('express');
const bcrypt = require('bcryptjs');
const { run, get, all } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { sendBarberAccessCode } = require('../services/email');

const router = express.Router();

// Apply verifyToken middleware
router.use(authenticateToken);

// Listar barbeiros
router.get('/', async (req, res) => {
  try {
    const barbers = await all(
      'SELECT * FROM barbers WHERE user_id = ? AND active = 1 ORDER BY name',
      [req.userId]
    );

    // Buscar especialidades e dias para cada barbeiro
    for (let barber of barbers) {
      const specs = await all(
        'SELECT service_id FROM barber_specialties WHERE barber_id = ?',
        [barber.id]
      );
      barber.specialties = specs.map(s => s.service_id);

      const days = await all(
        'SELECT day_of_week FROM barber_working_days WHERE barber_id = ?',
        [barber.id]
      );
      barber.days = days.map(d => d.day_of_week);
      if (!barber.days.length) barber.days = [1, 2, 3, 4, 5, 6]; // default

      // Add frontend-friendly aliases
      barber.nick = barber.nickname || barber.name;
      barber.start = barber.start_time || '09:00';
      barber.end = barber.end_time || '19:00';
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
    const { name, email, phone, commission, color, specialties } = req.body;
    const nickname = req.body.nickname || req.body.nick || name;
    const start_time = req.body.start_time || req.body.start || '09:00';
    const end_time = req.body.end_time || req.body.end || '19:00';
    const working_days = req.body.working_days || req.body.days || [];

    // Gerar código de acesso aleatório de 6 dígitos
    const accessCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(accessCode, 10);

    const result = await run(
      `INSERT INTO barbers (user_id, name, nickname, email, phone, commission, color, start_time, end_time, access_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, name, nickname, email, phone, commission || 40, color || '#C0392B', start_time, end_time, hashedCode]
    );

    const barberId = result.lastID;

    // Enviar código por email (se houver email)
    if (email) {
      try {
        const owner = await get('SELECT shop_name FROM users WHERE id = ?', [req.userId]);
        await sendBarberAccessCode(email, {
          barberName: name,
          shopName: owner.shop_name,
          accessCode: accessCode
        });
      } catch (e) {
        console.error('Erro ao enviar email para barbeiro:', e);
      }
    }

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
    // Add frontend-friendly aliases
    barber.nick = barber.nickname || barber.name;
    barber.start = barber.start_time || '09:00';
    barber.end = barber.end_time || '19:00';
    barber.days = working_days;
    barber.specialties = specialties || [];
    res.status(201).json(barber);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Atualizar barbeiro
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, commission, color, specialties } = req.body;
    const nickname = req.body.nickname || req.body.nick || name;
    const start_time = req.body.start_time || req.body.start || '09:00';
    const end_time = req.body.end_time || req.body.end || '19:00';
    const working_days = req.body.working_days || req.body.days || [];

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
    barber.nick = barber.nickname || barber.name;
    barber.start = barber.start_time || '09:00';
    barber.end = barber.end_time || '19:00';
    barber.days = working_days;
    barber.specialties = specialties || [];
    res.json(barber);
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
