/**
 * Rotas de email - BarberOS
 * Endpoints para envio de emails e teste de configuração
 */

const express = require('express');
const { sendVerificationCode, verifyCode, sendEmail, testEmailConfig, sendAppointmentConfirmation, getEmailTemplate } = require('../services/email');

const router = express.Router();

// Testar configuração de email
router.get('/test-config', async (req, res) => {
  try {
    const config = await testEmailConfig();
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enviar email de teste
router.post('/test-send', async (req, res) => {
  try {
    const { to } = req.body;
    if (!to) {
      return res.status(400).json({ error: 'Campo "to" (email destino) é obrigatório' });
    }

    const content = `
      <p style="color:#F5F2ED;font-size:15px;line-height:1.6;margin:0 0 20px;">
        Este é um email de teste do BarberOS! 🎉
      </p>
      <p style="color:rgba(245,242,237,0.7);font-size:14px;line-height:1.6;margin:0 0 20px;">
        Se você está vendo este email, significa que a configuração de envio está funcionando corretamente.
      </p>
      <div style="background:#0D0D0D;border-radius:8px;padding:16px;text-align:center;">
        <p style="color:#27AE60;font-size:14px;font-weight:700;margin:0;">✅ Configuração OK!</p>
      </div>`;

    const html = getEmailTemplate('Email de Teste', content);
    const result = await sendEmail(to, 'BarberOS - Email de teste', html, 'Email de teste do BarberOS');

    if (result.success) {
      res.json({ message: 'Email de teste enviado com sucesso!', messageId: result.messageId });
    } else {
      res.status(500).json({ error: 'Falha ao enviar: ' + result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enviar código de verificação
router.post('/send-code', async (req, res) => {
  try {
    const { email, purpose = 'verificacao' } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    const result = await sendVerificationCode(email, purpose);

    if (result.success) {
      res.json({
        message: 'Código enviado com sucesso',
        email,
        expiresIn: 900,
        ...(result.code && { demoCode: result.code })
      });
    } else {
      res.status(500).json({ error: 'Erro ao enviar código: ' + result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verificar código
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email e código são obrigatórios' });
    }

    const result = verifyCode(email, code);
    
    if (result.valid) {
      res.json({ valid: true, message: result.message });
    } else {
      res.status(400).json({ valid: false, message: result.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enviar confirmação de agendamento
router.post('/appointment-confirmation', async (req, res) => {
  try {
    const { email, service, barber, date, time, shopName } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email do cliente é obrigatório' });
    }

    const result = await sendAppointmentConfirmation(email, { service, barber, date, time, shopName });

    if (result.success) {
      res.json({ message: 'Confirmação enviada!', messageId: result.messageId });
    } else {
      res.status(500).json({ error: 'Falha ao enviar: ' + result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
