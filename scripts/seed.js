#!/usr/bin/env node

/**
 * Script de inicialização com dados de exemplo
 * Popula o banco de dados com dados iniciais
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const DB_PATH = path.join(__dirname, '..', 'barber.db');
const db = new sqlite3.Database(DB_PATH);

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

async function initTables() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password TEXT NOT NULL,
      shop_name TEXT NOT NULL,
      shop_slug TEXT UNIQUE,
      shop_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS barbers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      nickname TEXT,
      email TEXT,
      phone TEXT,
      commission REAL DEFAULT 40,
      color TEXT DEFAULT '#C0392B',
      start_time TEXT DEFAULT '09:00',
      end_time TEXT DEFAULT '19:00',
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS barber_specialties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barber_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      FOREIGN KEY (barber_id) REFERENCES barbers(id),
      FOREIGN KEY (service_id) REFERENCES services(id)
    )`,
    `CREATE TABLE IF NOT EXISTS barber_working_days (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barber_id INTEGER NOT NULL,
      day_of_week INTEGER NOT NULL,
      FOREIGN KEY (barber_id) REFERENCES barbers(id)
    )`,
    `CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      duration INTEGER NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      client_id INTEGER NOT NULL,
      barber_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      appointment_date DATETIME NOT NULL,
      status TEXT DEFAULT 'confirmed',
      observations TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (barber_id) REFERENCES barbers(id),
      FOREIGN KEY (service_id) REFERENCES services(id)
    )`,
    `CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT NOT NULL,
      total_spent REAL DEFAULT 0,
      visit_count INTEGER DEFAULT 0,
      last_visit DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      hours_config TEXT DEFAULT '{}',
      notifications TEXT DEFAULT '{"whatsapp":true,"email":true,"owner":true,"24h":false}',
      notification_time INTEGER DEFAULT 60,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS identity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      color_primary TEXT DEFAULT '#C0392B',
      color_bg TEXT DEFAULT '#0D0D0D',
      color_text TEXT DEFAULT '#F5F2ED',
      color_card TEXT DEFAULT '#1A1A1A',
      font_display TEXT DEFAULT 'Clash Display',
      welcome_message TEXT DEFAULT 'Reserve seu horário',
      logo_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS reactivation_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      inactive_days INTEGER DEFAULT 30,
      recurrence_days INTEGER DEFAULT 7,
      enabled INTEGER DEFAULT 1,
      max_daily_sends INTEGER DEFAULT 50,
      auto_resend_days INTEGER DEFAULT 7,
      send_time TEXT DEFAULT '10:00',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS whatsapp_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      provider TEXT DEFAULT 'manual',
      provider_name TEXT,
      api_token TEXT,
      phone_origin TEXT,
      webhook_url TEXT,
      is_connected INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS message_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      template_type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      variables TEXT DEFAULT '["nome","dias","barbearia","link","ultimo_servico","barbeiro"]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, template_type)
    )`,
    `CREATE TABLE IF NOT EXISTS message_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      client_id INTEGER NOT NULL,
      template_type TEXT NOT NULL,
      message_content TEXT,
      recipient_phone TEXT,
      provider TEXT,
      status TEXT DEFAULT 'pending',
      message_id TEXT,
      sent_at DATETIME,
      viewed_at DATETIME,
      scheduled_at DATETIME,
      error_message TEXT,
      retry_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (client_id) REFERENCES clients(id)
    )`
  ];

  for (const sql of tables) {
    await run(sql);
  }
  console.log('✅ Tabelas criadas');
}

async function seedInitialData() {
  try {
    console.log('🌱 Iniciando seed de dados...');
    
    await initTables();

    // Criar usuário demo
    const hashedPassword = await bcrypt.hash('demo123', 10);
    await run(
      `INSERT OR IGNORE INTO users (name, email, phone, shop_name, shop_slug, password)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['Demo Dono', 'demo@barberos.app', '(51) 99999-9999', 'Barbearia Demo', 'barbearia-demo', hashedPassword]
    );

    const user = await get('SELECT id FROM users WHERE email = ?', ['demo@barberos.app']);
    const userId = user ? user.id : 1;

    // Config e identity
    await run(`INSERT OR IGNORE INTO configs (user_id) VALUES (?)`, [userId]);
    await run(`INSERT OR IGNORE INTO identity (user_id) VALUES (?)`, [userId]);

    // Barbeiros
    const barbers = [
      { name: 'Lucas Ferreira', nickname: 'Lucas F.', email: 'lucas@barber.com', phone: '(51) 99111-2233', commission: 40, color: '#C0392B', start: '09:00', end: '19:00' },
      { name: 'Rafael Matos', nickname: 'Rafael M.', email: 'rafael@barber.com', phone: '(51) 99444-5566', commission: 40, color: '#2980B9', start: '10:00', end: '20:00' },
      { name: 'Diego Costa', nickname: 'Diego C.', email: 'diego@barber.com', phone: '(51) 99777-8899', commission: 35, color: '#27AE60', start: '09:00', end: '18:00' },
    ];

    for (const b of barbers) {
      const existing = await get('SELECT id FROM barbers WHERE user_id = ? AND name = ?', [userId, b.name]);
      if (!existing) {
        await run(
          `INSERT INTO barbers (user_id, name, nickname, email, phone, commission, color, start_time, end_time)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, b.name, b.nickname, b.email, b.phone, b.commission, b.color, b.start, b.end]
        );
      }
    }

    // Serviços
    const services = [
      { name: 'Corte Simples', duration: 30, price: 45, description: 'Corte tradicional na tesoura ou máquina' },
      { name: 'Degradê / Fade', duration: 40, price: 55, description: 'Degradê com acabamento perfeito' },
      { name: 'Barba', duration: 25, price: 35, description: 'Modelagem de barba com navalha e toalha quente' },
      { name: 'Corte + Barba', duration: 55, price: 75, description: 'Combo completo corte e barba' },
      { name: 'Pigmentação', duration: 30, price: 40, description: 'Pigmentação para disfarçar falhas' },
      { name: 'Corte Kids', duration: 30, price: 38, description: 'Corte para crianças até 10 anos' },
    ];

    for (const s of services) {
      const existing = await get('SELECT id FROM services WHERE user_id = ? AND name = ?', [userId, s.name]);
      if (!existing) {
        await run(
          `INSERT INTO services (user_id, name, duration, price, description)
           VALUES (?, ?, ?, ?, ?)`,
          [userId, s.name, s.duration, s.price, s.description]
        );
      }
    }

    // Clientes
    const clients = [
      { name: 'João Silva', phone: '(51) 99001-1111', email: 'joao@email.com' },
      { name: 'Carlos Santos', phone: '(51) 99002-2222', email: 'carlos@email.com' },
      { name: 'Pedro Costa', phone: '(51) 99003-3333', email: 'pedro@email.com' },
      { name: 'Marcos Alves', phone: '(51) 99004-4444', email: 'marcos@email.com' },
      { name: 'André Lima', phone: '(51) 99005-5555', email: 'andre@email.com' },
    ];

    for (const c of clients) {
      const existing = await get('SELECT id FROM clients WHERE user_id = ? AND phone = ?', [userId, c.phone]);
      if (!existing) {
        await run(
          `INSERT INTO clients (user_id, name, phone, email)
           VALUES (?, ?, ?, ?)`,
          [userId, c.name, c.phone, c.email]
        );
      }
    }

    // Agendamentos demo (para hoje)
    const today = new Date().toISOString().split('T')[0];
    const barberRows = [
      await get('SELECT id FROM barbers WHERE user_id = ? AND name = ?', [userId, 'Lucas Ferreira']),
      await get('SELECT id FROM barbers WHERE user_id = ? AND name = ?', [userId, 'Rafael Matos']),
      await get('SELECT id FROM barbers WHERE user_id = ? AND name = ?', [userId, 'Diego Costa']),
    ];
    const serviceRows = [
      await get('SELECT id FROM services WHERE user_id = ? AND name = ?', [userId, 'Corte Simples']),
      await get('SELECT id FROM services WHERE user_id = ? AND name = ?', [userId, 'Degradê / Fade']),
      await get('SELECT id FROM services WHERE user_id = ? AND name = ?', [userId, 'Barba']),
    ];
    const clientRows = [
      await get('SELECT id FROM clients WHERE user_id = ? AND name = ?', [userId, 'João Silva']),
      await get('SELECT id FROM clients WHERE user_id = ? AND name = ?', [userId, 'Carlos Santos']),
      await get('SELECT id FROM clients WHERE user_id = ? AND name = ?', [userId, 'Pedro Costa']),
    ];

    if (barberRows[0] && serviceRows[0] && clientRows[0]) {
      const appointments = [
        { client_id: clientRows[0].id, barber_id: barberRows[0].id, service_id: serviceRows[0].id, date: `${today} 09:00:00`, status: 'done' },
        { client_id: clientRows[1].id, barber_id: barberRows[1].id, service_id: serviceRows[1].id, date: `${today} 10:00:00`, status: 'confirmed' },
        { client_id: clientRows[2].id, barber_id: barberRows[0].id, service_id: serviceRows[2].id, date: `${today} 11:30:00`, status: 'confirmed' },
        { client_id: clientRows[0].id, barber_id: barberRows[2].id, service_id: serviceRows[0].id, date: `${today} 14:00:00`, status: 'pending' },
        { client_id: clientRows[1].id, barber_id: barberRows[1].id, service_id: serviceRows[1].id, date: `${today} 15:00:00`, status: 'confirmed' },
      ];

      for (const a of appointments) {
        const existing = await get(
          'SELECT id FROM appointments WHERE user_id = ? AND appointment_date = ? AND barber_id = ?',
          [userId, a.date, a.barber_id]
        );
        if (!existing) {
          await run(
            `INSERT INTO appointments (user_id, client_id, barber_id, service_id, appointment_date, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, a.client_id, a.barber_id, a.service_id, a.date, a.status]
          );
        }
      }
    }

    console.log('✅ Dados seed criados com sucesso!');
    console.log('\n📝 Credenciais de teste:');
    console.log('  Email: demo@barberos.app');
    console.log('  Senha: demo123');
  } catch (err) {
    console.error('❌ Erro ao fazer seed:', err.message);
  }
}

if (require.main === module) {
  seedInitialData().then(() => {
    console.log('✨ Iniciação concluída!');
    db.close();
    process.exit(0);
  }).catch(err => {
    console.error('Erro:', err);
    db.close();
    process.exit(1);
  });
}

module.exports = { seedInitialData };
