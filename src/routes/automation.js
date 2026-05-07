const express = require('express');
const { all, get, run } = require('../database');
const { sendRecurrenceReminder } = require('../services/email');
const router = express.Router();

/**
 * Rota para disparar lembretes de recorrência (Retenção)
 * Deve ser chamada via CRON job (ex: 1x por dia)
 * Identifica clientes que cortaram há 14 dias e sugere retorno para o 15º dia.
 */
router.post('/run-recurrence', async (req, res) => {
  try {
    const today = new Date();
    // 14 dias atrás
    const targetDate = new Date();
    targetDate.setDate(today.getDate() - 14);
    const targetDateStr = targetDate.toISOString().split('T')[0];

    // Buscar agendamentos finalizados de 14 dias atrás
    const pastAppointments = await all(`
      SELECT a.*, c.name as client_name, c.email as client_email, 
             u.shop_name, u.shop_slug, s.name as service_name
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      JOIN users u ON a.user_id = u.id
      JOIN services s ON a.service_id = s.id
      WHERE DATE(a.appointment_date) = ? 
      AND a.status = 'done'
      AND c.email IS NOT NULL AND c.email != ''
    `, [targetDateStr]);

    let sentCount = 0;
    const results = [];

    for (const apt of pastAppointments) {
      // Verificar se o cliente já tem um agendamento futuro
      const futureApt = await get(`
        SELECT id FROM appointments 
        WHERE client_id = ? AND DATE(appointment_date) >= DATE('now')
        AND status != 'cancelled'
        LIMIT 1
      `, [apt.client_id]);

      if (!futureApt) {
        // Sugerir retorno para amanhã (15 dias após o último corte)
        const recommendedDate = new Date();
        recommendedDate.setDate(today.getDate() + 1);
        const recommendedDateStr = recommendedDate.toISOString().split('T')[0];

        try {
          await sendRecurrenceReminder(apt.client_email, {
            clientName: apt.client_name,
            shopName: apt.shop_name,
            shopSlug: apt.shop_slug,
            lastService: apt.service_name,
            recommendedDate: recommendedDateStr
          });

          // Registrar no histórico de mensagens
          await run(`
            INSERT INTO message_history (user_id, client_id, template_type, message_content, recipient_phone, status)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            apt.user_id, 
            apt.client_id, 
            'recurrence_reminder', 
            `Lembrete de retorno sugerido para ${recommendedDateStr}`,
            apt.client_email,
            'sent'
          ]);

          sentCount++;
          results.push({ client: apt.client_name, status: 'sent' });
        } catch (emailErr) {
          console.error(`Erro ao enviar lembrete para ${apt.client_email}:`, emailErr);
          results.push({ client: apt.client_name, status: 'error', error: emailErr.message });
        }
      } else {
        results.push({ client: apt.client_name, status: 'skipped', reason: 'already_has_future_apt' });
      }
    }

    res.json({
      success: true,
      processed: pastAppointments.length,
      sent: sentCount,
      results
    });

  } catch (err) {
    console.error('Erro na automação de recorrência:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
