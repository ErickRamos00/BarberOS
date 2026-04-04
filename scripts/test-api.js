#!/usr/bin/env node

/**
 * Script de testes básicos
 * Valida que o sistema está funcionando corretamente
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
let token = null;

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'blue') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function test(name, fn) {
  try {
    process.stdout.write(`  ├─ ${name}... `);
    await fn();
    log('✓ PASSOU', 'green');
    return true;
  } catch (err) {
    log(`✗ FALHOU: ${err.message}`, 'red');
    return false;
  }
}

async function runTests() {
  log('\n╔════════════════════════════════════╗', 'blue');
  log('║     BarberOS - Testes de APIs      ║', 'blue');
  log('╚════════════════════════════════════╝\n', 'blue');

  let passed = 0;
  let failed = 0;

  // 1. Health Check
  log('1. HEALTH CHECK', 'yellow');
  if (await test('GET /api/health', async () => {
    const res = await request('GET', '/api/health');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (res.body.status !== 'ok') throw new Error('Status inválido');
  })) passed++; else failed++;

  // 2. Status
  if (await test('GET /api/status', async () => {
    const res = await request('GET', '/api/status');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.body.version) throw new Error('Versão não encontrada');
  })) passed++; else failed++;

  // 3. Auth
  log('\n2. AUTENTICAÇÃO', 'yellow');
  if (await test('POST /api/auth/login (demo)', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: 'demo@barberos.app',
      password: 'demo123'
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.body.token) throw new Error('Token não fornecido');
    token = res.body.token;
  })) passed++; else failed++;

  if (await test('GET /api/auth/me (com token)', async () => {
    const res = await request('GET', '/api/auth/me');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.body.email) throw new Error('Email não encontrado');
  })) passed++; else failed++;

  // 4. Barbeiros
  log('\n3. BARBEIROS', 'yellow');
  if (await test('GET /api/barbers', async () => {
    const res = await request('GET', '/api/barbers');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!Array.isArray(res.body)) throw new Error('Resposta não é array');
  })) passed++; else failed++;

  // 5. Serviços
  log('\n4. SERVIÇOS', 'yellow');
  if (await test('GET /api/services', async () => {
    const res = await request('GET', '/api/services');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!Array.isArray(res.body)) throw new Error('Resposta não é array');
  })) passed++; else failed++;

  // 6. Clientes
  log('\n5. CLIENTES', 'yellow');
  if (await test('GET /api/clients', async () => {
    const res = await request('GET', '/api/clients');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!Array.isArray(res.body)) throw new Error('Resposta não é array');
  })) passed++; else failed++;

  // 7. Agendamentos
  log('\n6. AGENDAMENTOS', 'yellow');
  if (await test('GET /api/appointments', async () => {
    const res = await request('GET', '/api/appointments');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!Array.isArray(res.body)) throw new Error('Resposta não é array');
  })) passed++; else failed++;

  // 8. Config
  log('\n7. CONFIGURAÇÕES', 'yellow');
  if (await test('GET /api/config', async () => {
    const res = await request('GET', '/api/config');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  })) passed++; else failed++;

  if (await test('GET /api/config/identity/get', async () => {
    const res = await request('GET', '/api/config/identity/get');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  })) passed++; else failed++;

  // 9. Finance
  log('\n8. FINANCEIRO', 'yellow');
  if (await test('GET /api/finance/summary', async () => {
    const res = await request('GET', '/api/finance/summary?period=month');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (typeof res.body.revenue === 'undefined') throw new Error('Revenue não encontrado');
  })) passed++; else failed++;

  // Resultado final
  log('\n╔════════════════════════════════════╗', 'blue');
  log(`║  ✓ PASSOU: ${passed}`, 'green');
  log(`║  ✗ FALHOU: ${failed}`, failed > 0 ? 'red' : 'green');
  log('╚════════════════════════════════════╝\n', 'blue');

  if (failed === 0) {
    log('🎉 TODOS OS TESTES PASSARAM! Sistema pronto para produção.', 'green');
    process.exit(0);
  } else {
    log('⚠️  Alguns testes falharam. Verifique os logs.', 'red');
    process.exit(1);
  }
}

// Esperar servidor estar disponível
async function waitForServer(maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await request('GET', '/api/health');
      if (res.status === 200) {
        log('✓ Servidor online\n', 'green');
        return;
      }
    } catch (e) {
      if (i < maxAttempts - 1) {
        process.stdout.write('.');
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }
  log('✗ Servidor não respondeu', 'red');
  process.exit(1);
}

// Executar
log('Aguardando servidor...', 'yellow');
waitForServer().then(runTests).catch(err => {
  log(`Erro: ${err.message}`, 'red');
  process.exit(1);
});
