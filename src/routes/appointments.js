const express = require('express');
const { run, get, all } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Middleware de autenticação
router.use(authenticateToken);

// Listar agendamentos
router.get('/', async (req, res) => {
  try {
    const { date, barber_id } = req.query;
    
    let sql = `
      SELECT a.id, a.user_id, a.client_id, a.barber_id, a.service_id,
             a.appointment_date, a.status, a.observations,
             c.name as client_name, c.phone as client_phone, c.email as client_email,
             b.name as barber_name, b.nickname as barber_nickname, b.color as barber_color,
             s.name as service_name, s.price, s.duration
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
      LEFT JOIN barbers b ON a.barber_id = b.id
      LEFT JOIN services s ON a.service_id = s.id
      WHERE a.user_id = ?
    `;
    
    const params = [req.userId];
    
    if (req.role === 'barber') {
      sql += ` AND a.barber_id = ?`;
      params.push(req.barberId);
    } else if (barber_id) {
      sql += ` AND a.barber_id = ?`;
      params.push(barber_id);
    }

    if (date) {
      sql += ` AND DATE(a.appointment_date) = ?`;
      params.push(date);
    }
    
    sql += ` ORDER BY a.appointment_date DESC`;
    
    const rows = await all(sql, params);
    
    // Normalize output for frontend
    const appointments = rows.map(a => {
      const dateObj = new Date(a.appointment_date);
      return {
        id: a.id,
        client: a.client_name || 'Cliente',
        phone: a.client_phone || '',
        email: a.client_email || '',
        service: String(a.service_id),
        barber: String(a.barber_id),
        date: a.appointment_date ? a.appointment_date.split(' ')[0] : dateObj.toISOString().split('T')[0],
        time: a.appointment_date ? a.appointment_date.split(' ')[1]?.slice(0,5) : dateObj.toTimeString().slice(0, 5),
        status: a.status || 'pending',
        obs: a.observations || '',
        // Extra fields for rich display
        service_name: a.service_name,
        barber_name: a.barber_name,
        barber_nickname: a.barber_nickname,
        barber_color: a.barber_color,
        price: a.price,
        duration: a.duration
      };
    });
    
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
       LEFT JOIN clients c ON a.client_id = c.id
       LEFT JOIN barbers b ON a.barber_id = b.id
       LEFT JOIN services s ON a.service_id = s.id
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

// Criar agendamento (accepts both frontend format and DB format)
router.post('/', async (req, res) => {
  try {
    let { client_id, barber_id, service_id, appointment_date, observations,
          client, phone, email, service, barber, date, time, obs, status } = req.body;
    
    // If frontend format, translate to DB format
    if (!client_id && client) {
      // Find or create client
      let clientRow = await get(
        'SELECT id FROM clients WHERE user_id = ? AND (name = ? OR phone = ?)',
        [req.userId, client, phone || '']
      );
      
      if (!clientRow && phone) {
        await run(
          'INSERT INTO clients (user_id, name, phone, email) VALUES (?, ?, ?, ?)',
          [req.userId, client, phone, email || '']
        );
        clientRow = await get('SELECT id FROM clients WHERE user_id = ? AND phone = ?', [req.userId, phone]);
      }
      
      if (!clientRow) {
        await run(
          'INSERT INTO clients (user_id, name, phone, email) VALUES (?, ?, ?, ?)',
          [req.userId, client, phone || '', email || '']
        );
        clientRow = await get('SELECT last_insert_rowid() as id');
      }
      
      client_id = clientRow.id;
    }
    
    if (!service_id && service) {
      service_id = parseInt(service) || service;
    }
    
    if (!barber_id && barber) {
      barber_id = parseInt(barber) || barber;
    }
    
    // If no barber, use the first one
    if (!barber_id) {
      const firstBarber = await get('SELECT id FROM barbers WHERE user_id = ? LIMIT 1', [req.userId]);
      barber_id = firstBarber ? firstBarber.id : 1;
    }
    
    if (!appointment_date && date && time) {
      appointment_date = `${date} ${time}:00`;
    }
    
    if (!observations) observations = obs || '';
    
    const result = await run(
      `INSERT INTO appointments (user_id, client_id, barber_id, service_id, appointment_date, status, observations)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, client_id, barber_id, service_id, appointment_date, status || 'confirmed', observations]
    );

    // Return in frontend format
    const apt = await get(
      `SELECT a.id, a.appointment_date, a.status, a.observations,
              c.name as client_name, c.phone as client_phone, c.email as client_email,
              b.name as barber_name, b.nickname as barber_nickname,
              s.name as service_name, s.price, s.duration
       FROM appointments a
       LEFT JOIN clients c ON a.client_id = c.id
       LEFT JOIN barbers b ON a.barber_id = b.id
       LEFT JOIN services s ON a.service_id = s.id
       WHERE a.id = ?`,
      [result.lastID]
    );

    const dateStr = apt.appointment_date ? apt.appointment_date.split(' ')[0] : '';
    const timeStr = apt.appointment_date ? apt.appointment_date.split(' ')[1]?.slice(0,5) : '';

    res.status(201).json({
      id: apt.id || result.lastID,
      client: apt.client_name || client,
      phone: apt.client_phone || phone,
      email: apt.client_email || email,
      service: String(service_id),
      barber: String(barber_id),
      date: dateStr,
      time: timeStr,
      status: status || 'confirmed',
      obs: observations
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Atualizar agendamento
router.put('/:id', async (req, res) => {
  try {
    let { barber_id, service_id, appointment_date, observations, status,
          barber, service, date, time, obs, client } = req.body;
    
    if (!barber_id && barber) barber_id = parseInt(barber) || barber;
    if (!service_id && service) service_id = parseInt(service) || service;
    if (!appointment_date && date && time) appointment_date = `${date} ${time}:00`;
    if (!observations) observations = obs || '';
    
    await run(
      `UPDATE appointments SET barber_id = ?, service_id = ?, appointment_date = ?, observations = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [barber_id, service_id, appointment_date, observations, status, req.params.id, req.userId]
    );

    res.json({ message: 'Agendamento atualizado' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Alterar status do agendamento
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const appointmentId = req.params.id;
    const userId = req.userId;
    
    let sql = 'UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?';
    let params = [status, appointmentId, userId];

    if (req.role === 'barber') {
      sql += ' AND barber_id = ?';
      params.push(req.barberId);
    }
    
    await run(sql, params);

    // Se finalizado, enviar sugestão de recorrência
    if (status === 'done') {
      try {
        const apt = await get(`
          SELECT a.*, c.name as client_name, c.email as client_email, c.recurrence_days,
                 u.shop_name, u.shop_slug, s.name as service_name
          FROM appointments a
          JOIN clients c ON a.client_id = c.id
          JOIN users u ON a.user_id = u.id
          JOIN services s ON a.service_id = s.id
          WHERE a.id = ? AND a.user_id = ?
        `, [appointmentId, userId]);

        if (apt && apt.client_email) {
          const { sendRecurrenceReminder } = require('../services/email');
          
          // Calcular data recomendada baseada na configuração do cliente (default 15)
          const recurrence = apt.recurrence_days || 15;
          const currentDate = new Date(apt.appointment_date.split(' ')[0] + 'T12:00:00');
          const recDate = new Date(currentDate);
          recDate.setDate(currentDate.getDate() + recurrence);
          const recommendedDate = recDate.toISOString().split('T')[0];

          // Enviar em background
          sendRecurrenceReminder(apt.client_email, {
            clientName: apt.client_name,
            shopName: apt.shop_name,
            shopSlug: apt.shop_slug,
            lastService: apt.service_name,
            recommendedDate: recommendedDate
          }).catch(err => console.error('Erro ao enviar lembrete de recorrência:', err));
        }
      } catch (e) {
        console.error('Erro ao processar automação de recorrência:', e);
      }
    }

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

// Obter horários disponíveis
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
      
      const isBooked = appointments.some(apt => {
        const aptTime = apt.appointment_date.split(' ')[1]?.slice(0, 5) || new Date(apt.appointment_date).toTimeString().slice(0, 5);
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
