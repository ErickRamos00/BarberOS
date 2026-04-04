#!/usr/bin/env node

/**
 * Script de Teste - Email Configuration
 * Use: node test-email.js
 */

const fs = require('fs');
const path = require('path');

console.log(`
╔════════════════════════════════════════╗
║     🧪 TESTE DE CONFIGURAÇÃO EMAIL     ║
╚════════════════════════════════════════╝
`);

// 1. Verificar .env
console.log('📋 Verificando .env...\n');

const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ Arquivo .env não encontrado!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  }
});

// 2. Verificar provider
const provider = (envVars.EMAIL_PROVIDER || 'mailgun').toLowerCase();

console.log(`🔍 Provider: ${provider.toUpperCase()}\n`);

// 3. Validar o provider escolhido
let isConfigured = false;
let instruction = '';

if (provider === 'mailgun') {
  console.log('Configuração necessária para MAILGUN:');
  const hasKey = envVars.MAILGUN_API_KEY && !envVars.MAILGUN_API_KEY.includes('seu-');
  const hasDomain = envVars.MAILGUN_DOMAIN && !envVars.MAILGUN_DOMAIN.includes('seu-');
  
  console.log(`  ${hasKey ? '✅' : '❌'} MAILGUN_API_KEY = ${hasKey ? envVars.MAILGUN_API_KEY.substring(0, 15) + '...' : '[NÃO CONFIGURADA]'}`);
  console.log(`  ${hasDomain ? '✅' : '❌'} MAILGUN_DOMAIN = ${hasDomain ? envVars.MAILGUN_DOMAIN : '[NÃO CONFIGURADA]'}`);
  
  isConfigured = hasKey && hasDomain;
  instruction = `
📧 Setup Mailgun em 2 minutos:
1. Conta: https://www.mailgun.com
2. API Key: Settings → API Keys → Copie a Private Key
3. Domain: Sending → Domains → Copie o domínio
4. Cole em .env:
   MAILGUN_API_KEY=key-xxx
   MAILGUN_DOMAIN=sandboxabc.mailgun.org
  `;
} 
else if (provider === 'sendgrid') {
  console.log('Configuração necessária para SENDGRID:');
  const hasKey = envVars.SENDGRID_API_KEY && !envVars.SENDGRID_API_KEY.includes('seu-');
  
  console.log(`  ${hasKey ? '✅' : '❌'} SENDGRID_API_KEY = ${hasKey ? 'SG.' + envVars.SENDGRID_API_KEY.substring(3, 15) + '...' : '[NÃO CONFIGURADA]'}`);
  
  isConfigured = hasKey;
  instruction = `
📧 Setup SendGrid em 2 minutos:
1. Conta: https://sendgrid.com
2. API Key: Settings → API Keys → Create API Key
3. Cole em .env:
   SENDGRID_API_KEY=SG.abc123xyz
  `;
}
else if (provider === 'brevo') {
  console.log('Configuração necessária para BREVO:');
  const hasKey = envVars.BREVO_API_KEY && !envVars.BREVO_API_KEY.includes('seu-');
  
  console.log(`  ${hasKey ? '✅' : '❌'} BREVO_API_KEY = ${hasKey ? envVars.BREVO_API_KEY.substring(0, 15) + '...' : '[NÃO CONFIGURADA]'}`);
  
  isConfigured = hasKey;
  instruction = `
📧 Setup Brevo em 2 minutos:
1. Conta: https://www.brevo.com
2. API Key: Settings → SMTP & API → Create API Key
3. Cole em .env:
   BREVO_API_KEY=sua-api-key
  `;
}
else if (provider === 'smtp') {
  console.log('Configuração necessária para SMTP:');
  const hasHost = envVars.SMTP_HOST && !envVars.SMTP_HOST.includes('seu-');
  const hasUser = envVars.SMTP_USER && !envVars.SMTP_USER.includes('seu-');
  const hasPass = envVars.SMTP_PASSWORD && !envVars.SMTP_PASSWORD.includes('sua-');
  
  console.log(`  ${hasHost ? '✅' : '❌'} SMTP_HOST = ${hasHost ? envVars.SMTP_HOST : '[NÃO CONFIGURADA]'}`);
  console.log(`  ${hasUser ? '✅' : '❌'} SMTP_USER = ${hasUser ? envVars.SMTP_USER : '[NÃO CONFIGURADA]'}`);
  console.log(`  ${hasPass ? '✅' : '❌'} SMTP_PASSWORD = ${hasPass ? '***' : '[NÃO CONFIGURADA]'}`);
  
  isConfigured = hasHost && hasUser && hasPass;
  instruction = `
📧 Setup SMTP (Gmail, Outlook, etc):
1. Gmail:
   - SMTP_HOST=smtp.gmail.com
   - SMTP_PORT=587
   - SMTP_USER=seu-email@gmail.com
   - SMTP_PASSWORD=sua-app-password
2. Outlook:
   - SMTP_HOST=smtp-mail.outlook.com
   - SMTP_PORT=587
   - SMTP_USER=seu-email@outlook.com
   - SMTP_PASSWORD=sua-senha
  `;
}

console.log('\n' + '='.repeat(40) + '\n');

// 4. Resultado final
if (!isConfigured) {
  console.error(`
❌ Email NÃO está configurado!

${instruction}

Depois execute novamente:
  node test-email.js
  `);
  process.exit(1);
} else {
  console.log(`✨ Email configurado com sucesso!

📧 Provider: ${provider.toUpperCase()}
✅ Status: PRONTO PARA USAR

Próximas etapas:
1. Inicie o servidor: node server.js
2. Teste o envio de código
3. Verifique sua caixa de email

🧪 Para testar:
  curl -X POST http://localhost:3000/api/auth/send-code \\
    -H "Content-Type: application/json" \\
    -d '{"email":"seu-email@gmail.com","purpose":"verificacao"}'
  `);
  process.exit(0);
}

