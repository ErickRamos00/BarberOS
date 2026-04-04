const express = require('express');
const { all, get } = require('../database');

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

// Relatório geral
router.get('/summary', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let dateFilter = '';
    if (period === 'week') {
      dateFilter = "DATE(a.appointment_date) >= DATE('now', '-7 days')";
    } else if (period === 'month') {
      dateFilter = "DATE(a.appointment_date) >= DATE('now', '-30 days')";
    } else if (period === 'year') {
      dateFilter = "DATE(a.appointment_date) >= DATE('now', '-365 days')";
    }

    // Total de receita
    const revenue = await get(
      `SELECT COALESCE(SUM(s.price), 0) as total
       FROM appointments a
       JOIN services s ON a.service_id = s.id
       WHERE a.user_id = ? AND a.status = 'confirmed' AND DATE(a.appointment_date) >= DATE('now', '-${period === 'week' ? '7' : period === 'year' ? '365' : '30'} days')`,
      [req.userId]
    );

    // Total de agendamentos
    const appointments = await get(
      `SELECT COUNT(*) as total
       FROM appointments a
       WHERE a.user_id = ? AND a.status = 'confirmed' AND DATE(a.appointment_date) >= DATE('now', '-${period === 'week' ? '7' : period === 'year' ? '365' : '30'} days')`,
      [req.userId]
    );

    // Total de clientes
    const clients = await get(
      `SELECT COUNT(*) as total
       FROM clients
       WHERE user_id = ?`,
      [req.userId]
    );

    res.json({
      period,
      revenue: revenue.total || 0,
      appointments: appointments.total || 0,
      clients: clients.total || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Receita por barbeiro
router.get('/by-barber', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let dateFilter = '';
    if (period === 'week') {
      dateFilter = "AND DATE(a.appointment_date) >= DATE('now', '-7 days')";
    } else if (period === 'month') {
      dateFilter = "AND DATE(a.appointment_date) >= DATE('now', '-30 days')";
    } else if (period === 'year') {
      dateFilter = "AND DATE(a.appointment_date) >= DATE('now', '-365 days')";
    }

    const data = await all(
      `SELECT b.nickname, SUM(s.price) as revenue, COUNT(a.id) as appointments
       FROM appointments a
       JOIN barbers b ON a.barber_id = b.id
       JOIN services s ON a.service_id = s.id
       WHERE a.user_id = ? AND a.status = 'confirmed' ${dateFilter}
       GROUP BY b.id
       ORDER BY revenue DESC`,
      [req.userId]
    );

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serviços mais vendidos
router.get('/top-services', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let dateFilter = '';
    if (period === 'week') {
      dateFilter = "AND DATE(a.appointment_date) >= DATE('now', '-7 days')";
    } else if (period === 'month') {
      dateFilter = "AND DATE(a.appointment_date) >= DATE('now', '-30 days')";
    } else if (period === 'year') {
      dateFilter = "AND DATE(a.appointment_date) >= DATE('now', '-365 days')";
    }

    const data = await all(
      `SELECT s.name, COUNT(a.id) as count, SUM(s.price) as revenue
       FROM appointments a
       JOIN services s ON a.service_id = s.id
       WHERE a.user_id = ? AND a.status = 'confirmed' ${dateFilter}
       GROUP BY s.id
       ORDER BY count DESC
       LIMIT 5`,
      [req.userId]
    );

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Histórico de transações/agendamentos
router.get('/transactions', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const data = await all(
      `SELECT a.id, a.appointment_date, c.name as client, s.name as service, 
              b.nickname as barber, s.price, a.status
       FROM appointments a
       JOIN clients c ON a.client_id = c.id
       JOIN barbers b ON a.barber_id = b.id
       JOIN services s ON a.service_id = s.id
       WHERE a.user_id = ?
       ORDER BY a.appointment_date DESC
       LIMIT ? OFFSET ?`,
      [req.userId, parseInt(limit), parseInt(offset)]
    );

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Receita por dia (para gráfico)
router.get('/daily-revenue', async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    let dateRange = "DATE('now', '-7 days')";
    if (period === 'month') {
      dateRange = "DATE('now', '-30 days')";
    } else if (period === 'year') {
      dateRange = "DATE('now', '-365 days')";
    }

    const data = await all(
      `SELECT DATE(a.appointment_date) as date, SUM(s.price) as revenue, COUNT(a.id) as appointments
       FROM appointments a
       JOIN services s ON a.service_id = s.id
       WHERE a.user_id = ? AND a.status = 'confirmed' AND DATE(a.appointment_date) >= ${dateRange}
       GROUP BY DATE(a.appointment_date)
       ORDER BY date DESC`,
      [req.userId]
    );

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Taxa de ocupação (agendamentos vs capacidade)
router.get('/occupancy-rate', async (req, res) => {
  try {
    const { date } = req.query;
    
    // Total de slots disponíveis
    const barbers = await all(
      `SELECT id, start_time, end_time FROM barbers WHERE user_id = ? AND active = 1`,
      [req.userId]
    );

    let totalSlots = 0;
    for (let barber of barbers) {
      const [startH, startM] = barber.start_time.split(':').map(Number);
      const [endH, endM] = barber.end_time.split(':').map(Number);
      const hours = (endH + endM / 60) - (startH + startM / 60);
      totalSlots += Math.floor(hours * 2); // assumindo slots de 30min
    }

    // Agendamentos marcados
    const booked = await get(
      `SELECT COUNT(*) as count FROM appointments 
       WHERE user_id = ? AND DATE(appointment_date) = ? AND status = 'confirmed'`,
      [req.userId, date]
    );

    const rate = totalSlots > 0 ? Math.round((booked.count / totalSlots) * 100) : 0;

    res.json({
      date,
      booked: booked.count || 0,
      available: totalSlots - (booked.count || 0),
      total: totalSlots,
      occupancy_rate: rate
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
