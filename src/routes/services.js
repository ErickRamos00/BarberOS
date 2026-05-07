const express = require('express');
const { run, get, all } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// Listar serviços
router.get('/', async (req, res) => {
  try {
    const services = await all(
      'SELECT * FROM services WHERE user_id = ? AND active = 1 ORDER BY name',
      [req.userId]
    );
    
    // Add frontend-friendly aliases
    for (let svc of services) {
      svc.desc = svc.description || '';
      // Find barbers that can do this service via barber_specialties
      const barberLinks = await all(
        'SELECT barber_id FROM barber_specialties WHERE service_id = ?',
        [svc.id]
      );
      svc.barbers = barberLinks.map(b => String(b.barber_id));
    }
    
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
    const { name, duration, price, barbers } = req.body;
    const description = req.body.description || req.body.desc || '';
    
    const result = await run(
      `INSERT INTO services (user_id, name, duration, price, description)
       VALUES (?, ?, ?, ?, ?)`,
      [req.userId, name, duration || 30, price || 0, description]
    );

    const serviceId = result.lastID;
    
    // Link barbers via barber_specialties
    if (barbers && barbers.length) {
      for (const bid of barbers) {
        await run('INSERT OR IGNORE INTO barber_specialties (barber_id, service_id) VALUES (?, ?)', [bid, serviceId]);
      }
    }

    const service = await get('SELECT * FROM services WHERE id = ?', [serviceId]);
    service.desc = service.description || '';
    service.barbers = barbers || [];
    res.status(201).json(service);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Atualizar serviço
router.put('/:id', async (req, res) => {
  try {
    const { name, duration, price, barbers } = req.body;
    const description = req.body.description || req.body.desc || '';
    
    await run(
      `UPDATE services SET name = ?, duration = ?, price = ?, description = ?
       WHERE id = ? AND user_id = ?`,
      [name, duration, price, description, req.params.id, req.userId]
    );

    // Update barber links
    if (barbers) {
      await run('DELETE FROM barber_specialties WHERE service_id = ?', [req.params.id]);
      for (const bid of barbers) {
        await run('INSERT OR IGNORE INTO barber_specialties (barber_id, service_id) VALUES (?, ?)', [bid, req.params.id]);
      }
    }

    const service = await get('SELECT * FROM services WHERE id = ?', [req.params.id]);
    service.desc = service.description || '';
    service.barbers = barbers || [];
    res.json(service);
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
