/**
 * BarberOS - Pre-Deploy Diagnostic System
 * Este script valida se o ambiente está configurado corretamente para produção.
 */

const fs = require('fs');
const path = require('path');
const { all, get } = require('../src/database');
require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(status, message, type = 'info') {
  const icon = status === 'ok' ? '✅' : (status === 'warn' ? '⚠️' : '❌');
  const color = status === 'ok' ? colors.green : (status === 'warn' ? colors.yellow : colors.red);
  console.log(`${icon} ${colors.blue}[${type.toUpperCase()}]${colors.reset} ${color}${message}${colors.reset}`);
}

async function runDiagnostics() {
  console.log(`\n${colors.cyan}╔══════════════════════════════════════════════════════╗`);
  console.log(`║          📊 BarberOS - DIAGNÓSTICO PRÉ-DEPLOY        ║`);
  console.log(`╚══════════════════════════════════════════════════════╝${colors.reset}\n`);

  let criticalErrors = 0;
  let warnings = 0;

  // 1. Verificação de Ambiente (.env)
  console.log(`${colors.magenta}--- 🌍 AMBIENTE ---${colors.reset}`);
  
  if (process.env.NODE_ENV === 'production') {
    log('ok', 'NODE_ENV está definido como production', 'env');
  } else {
    log('warn', `NODE_ENV está como '${process.env.NODE_ENV}'. Mude para 'production' no deploy.`, 'env');
    warnings++;
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.includes('change-in-production')) {
    log('fail', 'JWT_SECRET está com o valor padrão! RISCO DE SEGURANÇA.', 'security');
    criticalErrors++;
  } else {
    log('ok', 'JWT_SECRET personalizado detectado', 'security');
  }

  if (process.env.BASE_URL && (process.env.BASE_URL.includes('localhost') || process.env.BASE_URL.includes('127.0.0.1'))) {
    log('warn', `BASE_URL aponta para localhost (${process.env.BASE_URL}). Os links de e-mail não funcionarão na internet.`, 'config');
    warnings++;
  } else {
    log('ok', `BASE_URL configurada: ${process.env.BASE_URL}`, 'config');
  }

  // 2. Verificação de E-mail
  console.log(`\n${colors.magenta}--- 📧 SERVIÇO DE E-MAIL ---${colors.reset}`);
  const provider = process.env.EMAIL_PROVIDER || 'demo';
  if (provider === 'demo') {
    log('fail', 'EMAIL_PROVIDER está como "demo". E-mails reais NÃO serão enviados.', 'email');
    criticalErrors++;
  } else {
    log('ok', `Provedor de e-mail configurado: ${provider}`, 'email');
    if (provider === 'smtp' && (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD)) {
      log('fail', 'Configuração SMTP incompleta (User/Pass faltando)', 'email');
      criticalErrors++;
    }
  }

  // 3. Verificação de Banco de Dados
  console.log(`\n${colors.magenta}--- 🗄️ BANCO DE DADOS ---${colors.reset}`);
  try {
    const tables = await all("SELECT name FROM sqlite_master WHERE type='table'");
    const tableNames = tables.map(t => t.name);
    const requiredTables = ['users', 'barbers', 'services', 'appointments', 'clients', 'configs', 'identity'];
    
    let dbOk = true;
    for (const table of requiredTables) {
      if (tableNames.includes(table)) {
        process.stdout.write(`${colors.green}  ✓ ${table}${colors.reset} `);
      } else {
        process.stdout.write(`${colors.red}  ✗ ${table}${colors.reset} `);
        dbOk = false;
        criticalErrors++;
      }
    }
    console.log('\n');
    if (dbOk) log('ok', 'Estrutura do banco de dados está completa', 'database');
    else log('fail', 'Faltam tabelas essenciais no banco de dados!', 'database');

    const userCount = await get("SELECT COUNT(*) as count FROM users");
    log('ok', `Usuários cadastrados: ${userCount.count}`, 'database');

  } catch (err) {
    log('fail', `Erro ao conectar/ler banco de dados: ${err.message}`, 'database');
    criticalErrors++;
  }

  // 4. Verificação de Estrutura de Pastas
  console.log(`\n${colors.magenta}--- 📁 SISTEMA DE ARQUIVOS ---${colors.reset}`);
  const publicPath = path.join(__dirname, '../public');
  if (fs.existsSync(publicPath)) {
    log('ok', 'Pasta /public encontrada', 'fs');
  } else {
    log('fail', 'Pasta /public não encontrada! O frontend não será servido.', 'fs');
    criticalErrors++;
  }

  // Resultado Final
  console.log(`\n${colors.cyan}══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`RESULTADO: ${criticalErrors > 0 ? colors.red + '❌ REPROVADO' : (warnings > 0 ? colors.yellow + '⚠️ ATENÇÃO' : colors.green + '✅ APROVADO')}${colors.reset}`);
  console.log(`Erros Críticos: ${criticalErrors}`);
  console.log(`Avisos: ${warnings}`);
  console.log(`${colors.cyan}══════════════════════════════════════════════════════${colors.reset}\n`);

  if (criticalErrors > 0) {
    console.log(`${colors.red}O sistema NÃO está pronto para deploy. Corrija os erros críticos acima.${colors.reset}\n`);
    process.exit(1);
  } else if (warnings > 0) {
    console.log(`${colors.yellow}O sistema pode ser enviado, mas verifique os avisos para evitar problemas em produção.${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.green}🚀 TUDO PRONTO! O sistema está validado para produção.${colors.reset}\n`);
    process.exit(0);
  }
}

runDiagnostics();
