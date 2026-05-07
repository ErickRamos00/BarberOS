/**
 * Serviço de envio de emails - BarberOS
 * Suporta: SMTP (Gmail, Outlook, etc), Mailgun, SendGrid, Brevo, DEMO
 */

const nodemailer = require('nodemailer');
const axios = require('axios');

const { run, get } = require('../database');

// Códigos de verificação agora são salvos no Supabase para estabilidade na Vercel

// Cache do transporter SMTP
let smtpTransporter = null;

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ===== TEMPLATE HTML PROFISSIONAL =====
function getEmailTemplate(title, content, footerText = '') {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0D0D0D;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0D0D;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#C0392B 0%,#96281B 100%);padding:32px 40px;border-radius:12px 12px 0 0;text-align:center;">
          <div style="font-size:28px;margin-bottom:8px;">✂️</div>
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:2px;">BarberOS</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">${title}</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="background:#161616;padding:36px 40px;border-left:1px solid rgba(255,255,255,0.08);border-right:1px solid rgba(255,255,255,0.08);">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#111111;padding:24px 40px;border-radius:0 0 12px 12px;border:1px solid rgba(255,255,255,0.08);border-top:none;text-align:center;">
          ${footerText ? `<p style="margin:0 0 8px;color:rgba(255,255,255,0.4);font-size:12px;">${footerText}</p>` : ''}
          <p style="margin:0;color:rgba(255,255,255,0.25);font-size:11px;">&copy; ${new Date().getFullYear()} BarberOS - Sistema de Agendamento</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ===== PROVEDORES DE EMAIL =====

async function getSmtpTransporter() {
  if (smtpTransporter) return smtpTransporter;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!user || !pass) {
    throw new Error('SMTP_USER e SMTP_PASSWORD são obrigatórios para envio via SMTP');
  }

  smtpTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: { rejectUnauthorized: false }
  });

  // Verificar conexão
  try {
    await smtpTransporter.verify();
    console.log('✅ Conexão SMTP verificada com sucesso');
  } catch (err) {
    console.error('❌ Falha na verificação SMTP:', err.message);
    smtpTransporter = null;
    throw err;
  }

  return smtpTransporter;
}

async function sendWithSMTP(to, subject, htmlContent, textContent) {
  try {
    const transporter = await getSmtpTransporter();
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;

    const result = await transporter.sendMail({
      from: `"BarberOS" <${from}>`,
      to,
      subject,
      html: htmlContent,
      text: textContent || subject
    });

    console.log(`✅ Email enviado via SMTP para ${to} (ID: ${result.messageId})`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Erro SMTP:', error.message);
    smtpTransporter = null;
    return { success: false, error: error.message };
  }
}

async function sendWithMailgun(to, subject, htmlContent, textContent) {
  try {
    const apiKey = process.env.MAILGUN_API_KEY;
    const domain = process.env.MAILGUN_DOMAIN;
    const from = process.env.MAILGUN_FROM || `BarberOS <noreply@${domain}>`;

    if (!apiKey || !domain || apiKey === 'seu-api-key-aqui') {
      throw new Error('Credenciais do Mailgun não configuradas');
    }

    const FormData = require('form-data') || null;
    const params = new URLSearchParams();
    params.append('from', from);
    params.append('to', to);
    params.append('subject', subject);
    params.append('html', htmlContent);
    if (textContent) params.append('text', textContent);

    const response = await axios.post(
      `https://api.mailgun.net/v3/${domain}/messages`,
      params.toString(),
      {
        auth: { username: 'api', password: apiKey },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    console.log(`✅ Email enviado via Mailgun para ${to}`);
    return { success: true, messageId: response.data.id };
  } catch (error) {
    console.error('❌ Erro Mailgun:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

async function sendWithSendGrid(to, subject, htmlContent) {
  try {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey || apiKey.startsWith('SG.seu')) {
      throw new Error('API Key do SendGrid não configurada');
    }

    await axios.post('https://api.sendgrid.com/v3/mail/send', {
      personalizations: [{ to: [{ email: to }] }],
      from: { email: process.env.SENDGRID_FROM || 'noreply@barberos.app', name: 'BarberOS' },
      subject,
      content: [{ type: 'text/html', value: htmlContent }]
    }, {
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
    });

    console.log(`✅ Email enviado via SendGrid para ${to}`);
    return { success: true, messageId: `sg-${Date.now()}` };
  } catch (error) {
    console.error('❌ Erro SendGrid:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

async function sendWithBrevo(to, subject, htmlContent) {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey || apiKey === 'seu-api-key-aqui') {
      throw new Error('API Key do Brevo não configurada');
    }

    const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
      to: [{ email: to }],
      sender: { name: 'BarberOS', email: process.env.BREVO_FROM || 'noreply@barberos.app' },
      subject,
      htmlContent
    }, {
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json' }
    });

    console.log(`✅ Email enviado via Brevo para ${to}`);
    return { success: true, messageId: response.data.messageId };
  } catch (error) {
    console.error('❌ Erro Brevo:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

async function sendWithDemo(to, subject, htmlContent) {
  console.log(`
╔════════════════════════════════════════╗
║     📧 MODO DEMONSTRAÇÃO               ║
╚════════════════════════════════════════╝

📨 Para: ${to}
📝 Assunto: ${subject}

✅ Email simulado com sucesso!
   (Configure SMTP no .env para enviar de verdade)

💡 Para Gmail: EMAIL_PROVIDER=smtp, SMTP_HOST=smtp.gmail.com
   SMTP_USER=seu@gmail.com, SMTP_PASSWORD=sua-app-password
  `);
  return { success: true, messageId: `demo-${Date.now()}` };
}

// ===== FUNÇÃO PRINCIPAL =====
async function sendEmail(to, subject, htmlContent, textContent = null) {
  // Se SMTP_USER estiver presente, padrão é 'smtp', caso contrário 'demo'
  const defaultProvider = process.env.SMTP_USER ? 'smtp' : 'demo';
  const provider = (process.env.EMAIL_PROVIDER || defaultProvider).toLowerCase();
  console.log(`📧 Enviando email via [${provider}] para ${to}`);

  switch (provider) {
    case 'smtp':
    case 'gmail':
      return sendWithSMTP(to, subject, htmlContent, textContent);
    case 'mailgun':
      return sendWithMailgun(to, subject, htmlContent, textContent);
    case 'sendgrid':
      return sendWithSendGrid(to, subject, htmlContent);
    case 'brevo':
      return sendWithBrevo(to, subject, htmlContent);
    case 'demo':
    default:
      return sendWithDemo(to, subject, htmlContent);
  }
}

// ===== CÓDIGO DE VERIFICAÇÃO =====
async function sendVerificationCode(email, purpose = 'verificacao') {
  try {
    const code = generateCode();
    const expiresAt = Date.now() + 15 * 60 * 1000;

    // Salvar no banco de dados para persistência entre funções serverless
    await run(
      'INSERT INTO verification_codes (email, code, expires_at, purpose) VALUES (?, ?, ?, ?)',
      [email.toLowerCase(), code, expiresAt, purpose]
    );

    const content = `
      <p style="color:#F5F2ED;font-size:15px;line-height:1.6;margin:0 0 20px;">
        Use o código abaixo para completar sua verificação:
      </p>
      <div style="background:#0D0D0D;border:2px solid #C0392B;border-radius:10px;padding:24px;text-align:center;margin:24px 0;">
        <div style="font-size:36px;font-weight:700;letter-spacing:10px;color:#C0392B;font-family:'Courier New',monospace;">
          ${code}
        </div>
      </div>
      <p style="color:rgba(245,242,237,0.5);font-size:13px;margin:16px 0 0;">
        ⏱ Este código expira em <strong style="color:#F5F2ED;">15 minutos</strong>.<br>
        Se você não solicitou este código, ignore este email.
      </p>`;

    const html = getEmailTemplate('Código de Verificação', content, 'Este é um email automático, não responda.');
    const result = await sendEmail(email, `BarberOS - Código: ${code}`, html, `Seu código de verificação: ${code}`);

    if (result.success) {
      console.log(`✅ Código ${code} enviado para ${email}`);
      // Em modo demo, retornar código para facilitar testes
      const isDemoMode = (process.env.EMAIL_PROVIDER || 'demo') === 'demo';
      return { 
        success: true, 
        message: 'Código enviado com sucesso',
        ...(isDemoMode && { code })
      };
    }
    return { success: false, error: result.error };
  } catch (error) {
    console.error('❌ Erro ao enviar código:', error);
    return { success: false, error: error.message };
  }
}

async function verifyCode(email, code) {
  try {
    // Buscar o código mais recente para este email
    const stored = await get(
      'SELECT * FROM verification_codes WHERE email = ? AND code = ? ORDER BY created_at DESC LIMIT 1',
      [email.toLowerCase(), code]
    );

    if (!stored) {
      return { valid: false, message: 'Código incorreto ou não encontrado. Solicite um novo.' };
    }

    if (Date.now() > Number(stored.expires_at)) {
      await run('DELETE FROM verification_codes WHERE id = ?', [stored.id]);
      return { valid: false, message: 'Código expirado. Solicite um novo.' };
    }

    // Código válido! Limpar para não ser usado de novo
    await run('DELETE FROM verification_codes WHERE email = ?', [email.toLowerCase()]);
    
    return { valid: true, message: 'Código verificado com sucesso', purpose: stored.purpose };
  } catch (err) {
    console.error('❌ Erro na verificação do código:', err.message);
    return { valid: false, message: 'Erro interno na verificação' };
  }
}

// ===== EMAILS TRANSACIONAIS =====
async function sendWelcomeEmail(email, name, shopName) {
  const content = `
    <p style="color:#F5F2ED;font-size:16px;margin:0 0 8px;">Olá <strong>${name}</strong>! 👋</p>
    <p style="color:rgba(245,242,237,0.7);font-size:14px;line-height:1.7;margin:0 0 24px;">
      Sua barbearia <strong style="color:#C0392B;">${shopName}</strong> foi registrada com sucesso no BarberOS.
    </p>
    <div style="background:#0D0D0D;border-radius:8px;padding:20px;margin:0 0 20px;">
      <p style="color:rgba(245,242,237,0.5);font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Próximos passos:</p>
      <p style="color:#F5F2ED;font-size:14px;line-height:2;margin:0;">
        ✅ Cadastre seus barbeiros<br>
        ✅ Configure seus serviços e preços<br>
        ✅ Compartilhe seu link de agendamento<br>
        ✅ Personalize sua identidade visual
      </p>
    </div>`;
  
  const html = getEmailTemplate('Bem-vindo ao BarberOS!', content);
  return sendEmail(email, `Bem-vindo ao BarberOS, ${name}!`, html);
}

async function sendAppointmentConfirmation(email, data) {
  const content = `
    <p style="color:#F5F2ED;font-size:15px;margin:0 0 20px;">
      Seu agendamento foi confirmado! ✅
    </p>
    <div style="background:#0D0D0D;border-radius:8px;padding:20px;margin:0 0 20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="color:rgba(245,242,237,0.5);font-size:13px;padding:8px 0;">Serviço</td>
            <td style="color:#F5F2ED;font-size:14px;font-weight:600;text-align:right;padding:8px 0;">${data.service || '—'}</td></tr>
        <tr><td style="color:rgba(245,242,237,0.5);font-size:13px;padding:8px 0;border-top:1px solid rgba(255,255,255,0.06);">Barbeiro</td>
            <td style="color:#F5F2ED;font-size:14px;font-weight:600;text-align:right;padding:8px 0;border-top:1px solid rgba(255,255,255,0.06);">${data.barber || 'Qualquer disponível'}</td></tr>
        <tr><td style="color:rgba(245,242,237,0.5);font-size:13px;padding:8px 0;border-top:1px solid rgba(255,255,255,0.06);">Data</td>
            <td style="color:#F5F2ED;font-size:14px;font-weight:600;text-align:right;padding:8px 0;border-top:1px solid rgba(255,255,255,0.06);">${data.date || '—'}</td></tr>
        <tr><td style="color:rgba(245,242,237,0.5);font-size:13px;padding:8px 0;border-top:1px solid rgba(255,255,255,0.06);">Horário</td>
            <td style="color:#C0392B;font-size:16px;font-weight:700;text-align:right;padding:8px 0;border-top:1px solid rgba(255,255,255,0.06);">${data.time || '—'}</td></tr>
      </table>
    </div>
    <p style="color:rgba(245,242,237,0.5);font-size:13px;margin:0;">
      📍 ${data.shopName || 'BarberOS'}<br>
      Caso precise cancelar, entre em contato conosco.
    </p>`;

  const html = getEmailTemplate('Agendamento Confirmado', content);
  return sendEmail(email, `Agendamento confirmado - ${data.date} às ${data.time}`, html);
}

async function sendReactivationAlert(email, clientName, shopName) {
  const content = `
    <p style="color:#F5F2ED;font-size:15px;margin:0 0 16px;">
      Sentimos sua falta, <strong>${clientName}</strong>! 😊
    </p>
    <p style="color:rgba(245,242,237,0.7);font-size:14px;line-height:1.7;margin:0 0 24px;">
      Faz um tempo que você não nos visita na <strong style="color:#C0392B;">${shopName}</strong>. 
      Que tal agendar um horário?
    </p>`;
  
  const html = getEmailTemplate('Sentimos sua falta!', content);
  return sendEmail(email, `${shopName} - Sentimos sua falta!`, html);
}

/**
 * Envia email de recorrência/retenção (sugestão de retorno)
 */
async function sendRecurrenceReminder(email, data) {
  const { clientName, shopName, shopSlug, lastService, recommendedDate } = data;
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const bookingUrl = `${baseUrl}/s/${shopSlug}?date=${recommendedDate}`;

  const content = `
    <p style="color:#F5F2ED;font-size:16px;margin:0 0 8px;">Olá <strong>${clientName}</strong>! 👋</p>
    <p style="color:rgba(245,242,237,0.7);font-size:14px;line-height:1.7;margin:0 0 24px;">
      Esperamos que tenha gostado do seu último serviço (<strong>${lastService}</strong>) na <strong style="color:#C0392B;">${shopName}</strong>.
    </p>
    <p style="color:rgba(245,242,237,0.7);font-size:14px;line-height:1.7;margin:0 0 24px;">
      Para manter seu visual impecável, sugerimos que você retorne em breve. 
      O que acha do dia <strong style="color:#F5F2ED;">${new Date(recommendedDate + 'T12:00:00').toLocaleDateString('pt-BR')}</strong>?
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${bookingUrl}" style="background:#C0392B;color:#ffffff;padding:16px 32px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;box-shadow:0 4px 12px rgba(192,57,43,0.3);">
        Agendar agora ✓
      </a>
    </div>
    <p style="color:rgba(245,242,237,0.5);font-size:12px;text-align:center;">
      Se preferir outro horário, basta clicar no botão acima e escolher a melhor data.
    </p>`;
  
  const html = getEmailTemplate('Sugestão de Retorno', content, shopName);
  return sendEmail(email, `Hora de renovar o visual na ${shopName}! ✂️`, html);
}

// ===== TESTAR CONFIGURAÇÃO =====
async function testEmailConfig() {
  const provider = (process.env.EMAIL_PROVIDER || 'demo').toLowerCase();
  const result = { provider, configured: false, details: {} };

  if (provider === 'demo') {
    result.configured = true;
    result.details = { message: 'Modo demo ativo. Emails são simulados no console.' };
  } else if (provider === 'smtp' || provider === 'gmail') {
    result.configured = !!(process.env.SMTP_USER && process.env.SMTP_PASSWORD);
    result.details = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || '587',
      user: process.env.SMTP_USER ? '✅ Configurado' : '❌ Faltando',
      password: process.env.SMTP_PASSWORD ? '✅ Configurado' : '❌ Faltando'
    };
  } else if (provider === 'mailgun') {
    result.configured = !!(process.env.MAILGUN_API_KEY && process.env.MAILGUN_API_KEY !== 'seu-api-key-aqui');
    result.details = { apiKey: result.configured ? '✅ Configurado' : '❌ Faltando', domain: process.env.MAILGUN_DOMAIN || '❌ Faltando' };
  } else if (provider === 'sendgrid') {
    result.configured = !!(process.env.SENDGRID_API_KEY && !process.env.SENDGRID_API_KEY.startsWith('SG.seu'));
    result.details = { apiKey: result.configured ? '✅ Configurado' : '❌ Faltando' };
  } else if (provider === 'brevo') {
    result.configured = !!(process.env.BREVO_API_KEY && process.env.BREVO_API_KEY !== 'seu-api-key-aqui');
    result.details = { apiKey: result.configured ? '✅ Configurado' : '❌ Faltando' };
  }

  return result;
}

async function sendBarberAccessCode(email, data) {
  const { barberName, shopName, accessCode } = data;
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const loginUrl = `${baseUrl}/login/barbeiro`;

  const content = `
    <p style="color:#F5F2ED;font-size:16px;margin:0 0 8px;">Olá <strong>${barberName}</strong>! 👋</p>
    <p style="color:rgba(245,242,237,0.7);font-size:14px;line-height:1.7;margin:0 0 24px;">
      Você foi cadastrado como barbeiro na <strong style="color:#C0392B;">${shopName}</strong>. 
      Use o código abaixo para acessar sua agenda profissional no BarberOS.
    </p>
    <div style="background:#0D0D0D;border:2px solid #C0392B;border-radius:10px;padding:24px;text-align:center;margin:24px 0;">
      <div style="font-size:36px;font-weight:700;letter-spacing:10px;color:#C0392B;font-family:'Courier New',monospace;">
        ${accessCode}
      </div>
    </div>
    <div style="text-align:center;margin:32px 0;">
      <a href="${loginUrl}" style="background:#C0392B;color:#ffffff;padding:16px 32px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;">
        Acessar Painel do Barbeiro
      </a>
    </div>
    <p style="color:rgba(245,242,237,0.5);font-size:12px;text-align:center;margin:16px 0 0;">
      ⚠️ Por segurança, não compartilhe este código com ninguém.
    </p>`;
  
  const html = getEmailTemplate('Seu Acesso ao BarberOS', content, shopName);
  return sendEmail(email, `${shopName} - Seu código de acesso ao BarberOS`, html);
}

module.exports = {
  sendEmail,
  sendVerificationCode,
  verifyCode,
  sendWelcomeEmail,
  sendAppointmentConfirmation,
  sendReactivationAlert,
  sendRecurrenceReminder,
  sendBarberAccessCode,
  testEmailConfig,
  getEmailTemplate
};
