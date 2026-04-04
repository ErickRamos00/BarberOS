/**
 * Serviço de envio de emails
 * Suporta múltiplos provedores (Gmail, Outlook, SMTP customizado)
 */

const nodemailer = require('nodemailer');

// Código temporário armazenado em memória (substitua por banco de dados em produção)
const verificationCodes = new Map();

/**
 * Gera um código de verificação de 6 dígitos
 */
function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Transporter do nodemailer (configurado para Gmail por padrão)
 * Em produção, use variáveis de ambiente
 */
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const provider = process.env.EMAIL_PROVIDER || 'gmail';
  
  if (provider === 'gmail') {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'seu-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'sua-senha-app'
      }
    });
  } else if (provider === 'outlook') {
    transporter = nodemailer.createTransport({
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  } else if (provider === 'smtp') {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  } else {
    // Modo teste (não envia, apenas loga)
    transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 1025,
      secure: false
    });
  }

  return transporter;
}

/**
 * Envia código de verificação por email
 */
async function sendVerificationCode(email, purpose = 'verificacao') {
  try {
    const code = generateCode();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutos

    // Armazenar código
    verificationCodes.set(email, {
      code,
      expiresAt,
      purpose,
      attempts: 0
    });

    // Template HTML elegante
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; }
          .code-box { background: white; border: 2px solid #667eea; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
          .code-box .code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #667eea; }
          .code-box .expires { font-size: 12px; color: #666; margin-top: 10px; }
          .footer { background: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
          h1 { margin: 0; }
          p { margin: 10px 0; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✂️ BarberOS - Verificação de Email</h1>
          </div>
          
          <div class="content">
            <p>Olá,</p>
            
            <p>Você solicitou um código de verificação para ${purpose === 'login' ? 'fazer login' : 'verificar seu email'} em <strong>BarberOS</strong>.</p>
            
            <p>Use o código abaixo para completar o processo (válido por 15 minutos):</p>
            
            <div class="code-box">
              <div class="code">${code}</div>
              <div class="expires">Válido por 15 minutos</div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Aviso de segurança:</strong> Nunca compartilhe este código. Nós nunca pediremos seu código por email.
            </div>
            
            <p>Se você não solicitou este código, ignore este email.</p>
            
            <p>
              Atenciosamente,<br>
              <strong>Equipe BarberOS</strong><br>
              <small>Sistema de Agendamento para Barbearias</small>
            </p>
          </div>
          
          <div class="footer">
            <p>&copy; 2026 BarberOS. Todos os direitos reservados.</p>
            <p>Este é um email automático, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const transporter = getTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@barberos.app',
      to: email,
      subject: `Seu código de verificação: ${code}`,
      html: htmlTemplate,
      text: `Seu código de verificação é: ${code}\nVálido por 15 minutos.`
    });

    console.log(`✅ Código enviado para ${email}`);
    return { success: true, message: 'Código enviado com sucesso' };

  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Verifica se o código é válido
 */
function verifyCode(email, code) {
  const stored = verificationCodes.get(email);

  if (!stored) {
    return { valid: false, message: 'Nenhum código enviado para este email' };
  }

  // Verificar expiração
  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(email);
    return { valid: false, message: 'Código expirou. Solicite um novo.' };
  }

  // Limitar tentativas
  if (stored.attempts >= 5) {
    verificationCodes.delete(email);
    return { valid: false, message: 'Muitas tentativas. Solicite um novo código.' };
  }

  // Verificar código
  if (stored.code !== code) {
    stored.attempts++;
    return { valid: false, message: 'Código incorreto' };
  }

  // Código válido
  verificationCodes.delete(email);
  return { valid: true, message: 'Código verificado com sucesso', purpose: stored.purpose };
}

/**
 * Envia email de confirmação de cadastro
 */
async function sendWelcomeEmail(email, name, shopName) {
  try {
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; }
          .footer { background: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
          h1 { margin: 0; }
          .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✂️ Bem-vindo ao BarberOS!</h1>
          </div>
          
          <div class="content">
            <p>Olá <strong>${name}</strong>,</p>
            
            <p>Sua barbearia <strong>${shopName}</strong> foi registrada com sucesso! 🎉</p>
            
            <p>Você agora tem acesso completo a:</p>
            <ul>
              <li>📅 Agendamentos online</li>
              <li>👥 Gerenciamento de clientes</li>
              <li>💇 Controle de serviços</li>
              <li>💰 Relatórios financeiros</li>
              <li>💬 Integração WhatsApp (novo!)</li>
              <li>🔄 Sistema de reativação de clientes</li>
            </ul>
            
            <a href="http://localhost:3000" class="btn">Acessar Dashboard</a>
            
            <p>Se tiver qualquer dúvida, entre em contato conosco.</p>
            
            <p>
              Atenciosamente,<br>
              <strong>Equipe BarberOS</strong>
            </p>
          </div>
          
          <div class="footer">
            <p>&copy; 2026 BarberOS. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const transporter = getTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@barberos.app',
      to: email,
      subject: `Bem-vindo ao BarberOS, ${name}!`,
      html: htmlTemplate
    });

    console.log(`✅ Email de boas-vindas enviado para ${email}`);
    return { success: true };

  } catch (error) {
    console.error('❌ Erro ao enviar email de boas-vindas:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Envia alerta de reativação de cliente
 */
async function sendReactivationAlert(email, clientName, shopName) {
  try {
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; }
          .stat-box { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #f5576c; border-radius: 4px; }
          .footer { background: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔄 Cliente para Reativar!</h1>
          </div>
          
          <div class="content">
            <p>Olá,</p>
            
            <p>Seu sistema BarberOS identificou um cliente que pode estar desengajado:</p>
            
            <div class="stat-box">
              <strong>Cliente:</strong> ${clientName}<br>
              <strong>Barbearia:</strong> ${shopName}<br>
              <strong>Status:</strong> Sem visitas recentes
            </div>
            
            <p>Envie uma mensagem de reativação agora!</p>
            
            <p style="margin-top: 20px;">
              👋 Seus clientes continuam voltando com BarberOS!
            </p>
          </div>
          
          <div class="footer">
            <p>&copy; 2026 BarberOS. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const transporter = getTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@barberos.app',
      to: email,
      subject: `🔄 ${clientName} - Cliente para reativar em ${shopName}`,
      html: htmlTemplate
    });

    return { success: true };

  } catch (error) {
    console.error('❌ Erro ao enviar alerta:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendVerificationCode,
  verifyCode,
  sendWelcomeEmail,
  sendReactivationAlert,
  getTransporter
};
