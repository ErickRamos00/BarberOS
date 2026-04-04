const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('../config');

const DB_PATH = config.DATABASE_PATH;
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar no banco:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Conectado ao banco de dados SQLite');
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Promisify database methods
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('DB Error (run):', sql, err);
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('DB Error (get):', sql, err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('DB Error (all):', sql, err);
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
};

const initDatabase = () => {
  db.serialize(() => {
    console.log('🔄 Inicializando banco de dados...');
    // Tabela: Usuários (Donos)
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
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
      )
    `);

    // Tabela: Barbeiros
    db.run(`
      CREATE TABLE IF NOT EXISTS barbers (
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
      )
    `);

    // Tabela: Especialidades do barbeiro
    db.run(`
      CREATE TABLE IF NOT EXISTS barber_specialties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        barber_id INTEGER NOT NULL,
        service_id INTEGER NOT NULL,
        FOREIGN KEY (barber_id) REFERENCES barbers(id),
        FOREIGN KEY (service_id) REFERENCES services(id)
      )
    `);

    // Tabela: Dias de trabalho
    db.run(`
      CREATE TABLE IF NOT EXISTS barber_working_days (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        barber_id INTEGER NOT NULL,
        day_of_week INTEGER NOT NULL,
        FOREIGN KEY (barber_id) REFERENCES barbers(id)
      )
    `);

    // Tabela: Serviços
    db.run(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        duration INTEGER NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Tabela: Agendamentos
    db.run(`
      CREATE TABLE IF NOT EXISTS appointments (
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
      )
    `);

    // Tabela: Clientes
    db.run(`
      CREATE TABLE IF NOT EXISTS clients (
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
      )
    `);

    // Tabela: Configurações
    db.run(`
      CREATE TABLE IF NOT EXISTS configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        hours_config TEXT DEFAULT '{}',
        notifications TEXT DEFAULT '{"whatsapp":true,"email":true,"owner":true,"24h":false}',
        notification_time INTEGER DEFAULT 60,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Tabela: Identidade Visual
    db.run(`
      CREATE TABLE IF NOT EXISTS identity (
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
      )
    `);

    // Tabela: Regras de Reativação
    db.run(`
      CREATE TABLE IF NOT EXISTS reactivation_rules (
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
      )
    `);

    // Tabela: Configuração WhatsApp
    db.run(`
      CREATE TABLE IF NOT EXISTS whatsapp_config (
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
      )
    `);

    // Tabela: Templates de Mensagens
    db.run(`
      CREATE TABLE IF NOT EXISTS message_templates (
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
      )
    `);

    // Tabela: Histórico de Envios
    db.run(`
      CREATE TABLE IF NOT EXISTS message_history (
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
      )
    `);

    console.log('✅ Banco de dados inicializado com sucesso');
  });
};

module.exports = {
  db,
  run,
  get,
  all,
  initDatabase
};
