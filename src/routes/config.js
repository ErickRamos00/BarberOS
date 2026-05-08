const express = require('express');
const { run, get } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// ===== CONFIGURAÇÕES =====

// Obter configurações
router.get('/', async (req, res) => {
  try {
    let config = await get(
      'SELECT * FROM configs WHERE user_id = ?',
      [req.userId]
    );
    
    if (!config) {
      await run('INSERT INTO configs (user_id) VALUES (?)', [req.userId]);
      config = await get('SELECT * FROM configs WHERE user_id = ?', [req.userId]);
    }

    config.hours_config = config.hours_config ? JSON.parse(config.hours_config) : {};
    config.notifications = config.notifications ? JSON.parse(config.notifications) : {
      whatsapp: true,
      email: true,
      owner: true,
      '24h': false
    };

    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar horas de funcionamento
router.put('/', async (req, res) => {
  try {
    const { hours_config, notifications } = req.body;
    
    if (hours_config) {
      await run(
        'UPDATE configs SET hours_config = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [JSON.stringify(hours_config), req.userId]
      );
    }

    if (notifications) {
      await run(
        'UPDATE configs SET notifications = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [JSON.stringify(notifications), req.userId]
      );
    }

    const config = await get('SELECT * FROM configs WHERE user_id = ?', [req.userId]);
    res.json({ message: 'Configurações atualizadas', config });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ===== IDENTIDADE VISUAL =====

// Obter identidade visual
router.get('/identity/get', async (req, res) => {
  try {
    let identity = await get(
      'SELECT * FROM identity WHERE user_id = ?',
      [req.userId]
    );
    
    if (!identity) {
      await run('INSERT INTO identity (user_id) VALUES (?)', [req.userId]);
      identity = await get('SELECT * FROM identity WHERE user_id = ?', [req.userId]);
    }

    res.json(identity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar identidade visual
router.put('/identity/update', async (req, res) => {
  try {
    const { color_primary, color_bg, color_text, color_card, font_display, welcome_message, logo_url } = req.body;
    
    const result = await run(
      `UPDATE identity SET 
        color_primary = ?, 
        color_bg = ?, 
        color_text = ?, 
        color_card = ?, 
        font_display = ?, 
        welcome_message = ?, 
        logo_url = ?,
        updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = ?`,
      [color_primary, color_bg, color_text, color_card, font_display, welcome_message, logo_url, req.userId]
    );

    // Se não atualizou nada (não existia a linha), criar agora
    if (result.changes === 0) {
      await run(
        `INSERT INTO identity (user_id, color_primary, color_bg, color_text, color_card, font_display, welcome_message, logo_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.userId, color_primary, color_bg, color_text, color_card, font_display, welcome_message, logo_url]
      );
    }

    const identity = await get('SELECT * FROM identity WHERE user_id = ?', [req.userId]);
    res.json({ message: 'Identidade visual atualizada', identity });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
