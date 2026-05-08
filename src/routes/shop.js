const express = require('express');
const { run, get, all } = require('../database');
const { sendAppointmentConfirmation } = require('../services/email');

const router = express.Router();

// Obter informações públicas da barbearia pelo slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Obter usuário/loja
    const shop = await get(
      'SELECT id, name as owner_name, shop_name, shop_slug FROM users WHERE shop_slug = ?',
      [slug]
    );
    
    if (!shop) {
      return res.status(404).json({ error: 'Barbearia não encontrada' });
    }

    // Obter identidade visual
    const identity = await get(
      'SELECT * FROM identity WHERE user_id = ?',
      [shop.id]
    );

    // Obter barbeiros (apenas ativos) com seus horários específicos
    const barbers = await all(
      'SELECT id, name, nickname, color, start_time, end_time FROM barbers WHERE user_id = ? AND active = 1',
      [shop.id]
    );

    for (let barber of barbers) {
      const workingDays = await all(
        'SELECT day_of_week, start_time, end_time, is_working FROM barber_working_days WHERE barber_id = ?',
        [barber.id]
      );
      barber.working_days = workingDays;
    }

    // Obter serviços
    const services = await all(
      'SELECT id, name, duration, price, description FROM services WHERE user_id = ?',
      [shop.id]
    );

    // Obter configurações (horas de funcionamento da loja)
    const config = await get(
      'SELECT hours_config FROM configs WHERE user_id = ?',
      [shop.id]
    );

    res.json({
      id: shop.id,
      name: shop.shop_name,
      slug: shop.shop_slug,
      identity: identity || {},
      barbers: barbers || [],
      services: services || [],
      hours: config && config.hours_config ? JSON.parse(config.hours_config) : {}
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar agendamento público (sem token)
router.post('/:slug/book', async (req, res) => {
  try {
    const { slug } = req.params;
    const { client, phone, email, service, barber, date, time, obs } = req.body;

    const shop = await get('SELECT id FROM users WHERE shop_slug = ?', [slug]);
    if (!shop) return res.status(404).json({ error: 'Barbearia não encontrada' });

    // 1. Garantir que o cliente existe
    let clientObj = await get(
      'SELECT id FROM clients WHERE user_id = ? AND (phone = ? OR email = ?)',
      [shop.id, phone, email]
    );

    if (!clientObj) {
      const result = await run(
        'INSERT INTO clients (user_id, name, phone, email) VALUES (?, ?, ?, ?)',
        [shop.id, client, phone, email]
      );
      clientObj = { id: result.lastID };
    }

    // 2. Criar agendamento
    const appointmentDate = `${date} ${time}`;
    const result = await run(
      `INSERT INTO appointments (user_id, client_id, barber_id, service_id, appointment_date, status, observations)
       VALUES (?, ?, ?, ?, ?, 'confirmed', ?)`,
      [shop.id, clientObj.id, barber, service, appointmentDate, obs]
    );

    // 3. Enviar email de confirmação
    if (email) {
      try {
        const svcObj = await get('SELECT name FROM services WHERE id = ?', [service]);
        const barbObj = await get('SELECT name FROM barbers WHERE id = ?', [barber]);
        const shopObj = await get('SELECT shop_name FROM users WHERE id = ?', [shop.id]);
        
        await sendAppointmentConfirmation(email, {
          clientName: client,
          service: svcObj ? svcObj.name : 'Serviço',
          barber: barbObj ? barbObj.name : 'Qualquer disponível',
          date: new Date(date + 'T12:00:00').toLocaleDateString('pt-BR'),
          time: time,
          shopName: shopObj ? shopObj.shop_name : 'Barbearia'
        });
      } catch (e) {
        console.error('Erro ao enviar email de confirmação pública:', e);
      }
    }

    res.status(201).json({ 
      message: 'Agendamento solicitado com sucesso!',
      id: result.lastID 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
