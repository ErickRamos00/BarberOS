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

// Listar agendamentos
router.get('/', async (req, res) => {
  try {
    const { date, barber_id } = req.query;
    
    let sql = `
      SELECT a.*, c.name as client_name, c.phone as client_phone, c.email as client_email,
             b.nickname as barber_name, s.name as service_name, s.price, s.duration
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      JOIN barbers b ON a.barber_id = b.id
      JOIN services s ON a.service_id = s.id
      WHERE a.user_id = ?
    `;
    
    const params = [req.userId];
    
    if (date) {
      sql += ` AND DATE(a.appointment_date) = ?`;
      params.push(date);
    }
    
    if (barber_id) {
      sql += ` AND a.barber_id = ?`;
      params.push(barber_id);
    }
    
    sql += ` ORDER BY a.appointment_date DESC`;
    
    const appointments = await all(sql, params);
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obter um agendamento
router.get('/:id', async (req, res) => {
  try {
    const appointment = await get(
      `SELECT a.*, c.name as client_name, b.nickname as barber_name, s.name as service_name, s.price, s.duration
       FROM appointments a
       JOIN clients c ON a.client_id = c.id
       JOIN barbers b ON a.barber_id = b.id
       JOIN services s ON a.service_id = s.id
       WHERE a.id = ? AND a.user_id = ?`,
      [req.params.id, req.userId]
    );
    
    if (!appointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar agendamento
router.post('/', async (req, res) => {
  try {
    const { client_id, barber_id, service_id, appointment_date, observations } = req.body;
    
    const result = await run(
      `INSERT INTO appointments (user_id, client_id, barber_id, service_id, appointment_date, observations)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.userId, client_id, barber_id, service_id, appointment_date, observations]
    );

    const appointment = await get(
      `SELECT a.*, c.name as client_name, b.nickname as barber_name, s.name as service_name
       FROM appointments a
       JOIN clients c ON a.client_id = c.id
       JOIN barbers b ON a.barber_id = b.id
       JOIN services s ON a.service_id = s.id
       WHERE a.id = ?`,
      [result.lastID]
    );

    res.status(201).json({ message: 'Agendamento criado', appointment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Atualizar agendamento
router.put('/:id', async (req, res) => {
  try {
    const { barber_id, service_id, appointment_date, observations, status } = req.body;
    
    await run(
      `UPDATE appointments SET barber_id = ?, service_id = ?, appointment_date = ?, observations = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [barber_id, service_id, appointment_date, observations, status, req.params.id, req.userId]
    );

    const appointment = await get(
      `SELECT a.*, c.name as client_name, b.nickname as barber_name, s.name as service_name
       FROM appointments a
       JOIN clients c ON a.client_id = c.id
       JOIN barbers b ON a.barber_id = b.id
       JOIN services s ON a.service_id = s.id
       WHERE a.id = ?`,
      [req.params.id]
    );

    res.json({ message: 'Agendamento atualizado', appointment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Alterar status do agendamento
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    await run(
      'UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [status, req.params.id, req.userId]
    );

    res.json({ message: 'Status atualizado', status });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Deletar agendamento
router.delete('/:id', async (req, res) => {
  try {
    await run(
      'DELETE FROM appointments WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    res.json({ message: 'Agendamento removido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obter horários disponíveis para um barbeiro em uma data
router.get('/:barber_id/available-times', async (req, res) => {
  try {
    const { date, service_id } = req.query;
    
    const barber = await get(
      'SELECT start_time, end_time FROM barbers WHERE id = ? AND user_id = ?',
      [req.params.barber_id, req.userId]
    );
    
    const service = await get(
      'SELECT duration FROM services WHERE id = ?',
      [service_id]
    );
    
    if (!barber || !service) {
      return res.status(404).json({ error: 'Barbeiro ou serviço não encontrado' });
    }

    // Obter agendamentos já marcados para essa data e barbeiro
    const appointments = await all(
      `SELECT appointment_date FROM appointments 
       WHERE barber_id = ? AND DATE(appointment_date) = ? AND status != 'cancelled'`,
      [req.params.barber_id, date]
    );

    const timeSlots = [];
    const [startHour, startMin] = barber.start_time.split(':').map(Number);
    const [endHour, endMin] = barber.end_time.split(':').map(Number);
    
    let currentTime = new Date(date);
    currentTime.setHours(startHour, startMin, 0);
    
    const endTime = new Date(date);
    endTime.setHours(endHour, endMin, 0);
    
    const duration = service.duration || 30;
    
    while (currentTime < endTime) {
      const timeStr = currentTime.toTimeString().slice(0, 5);
      
      // Verificar se esse horário tá ocupado
      const isBooked = appointments.some(apt => {
        const aptTime = new Date(apt.appointment_date).toTimeString().slice(0, 5);
        return aptTime === timeStr;
      });
      
      if (!isBooked) {
        timeSlots.push(timeStr);
      }
      
      currentTime.setMinutes(currentTime.getMinutes() + duration);
    }

    res.json(timeSlots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
