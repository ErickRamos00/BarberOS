#!/usr/bin/env node

/**
 * Script de inicialização com dados de exemplo
 * Popula o banco de dados com dados iniciais
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const DB_PATH = path.join(__dirname, '..', 'barber.db');

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) reject(err);
    });
    
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
      db.close();
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) reject(err);
    });
    
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
      db.close();
    });
  });
};

async function seedInitialData() {
  try {
    console.log('🌱 Iniciando seed de dados...');
    
    // Criar usuário demo
    const hashedPassword = await bcrypt.hash('demo123', 10);
    const userResult = await run(
      `INSERT OR IGNORE INTO users (name, email, phone, shop_name, shop_slug, password)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['Demo Dono', 'demo@barberos.app', '(51) 99999-9999', 'Barbearia Demo', 'barbearia-demo', hashedPassword]
    );

    let userId = 1;
    try {
      const user = await get('SELECT id FROM users WHERE email = ?', ['demo@barberos.app']);
      if (user) userId = user.id;
    } catch (e) {
      console.log('Usuário demo já existe');
    }

    // Criar config padrão
    await run(
      `INSERT OR IGNORE INTO configs (user_id) VALUES (?)`,
      [userId]
    );

    // Criar identidade visual padrão
    await run(
      `INSERT OR IGNORE INTO identity (user_id) VALUES (?)`,
      [userId]
    );

    // Adicionar barbeiros
    const barbers = [
      { name: 'Lucas Ferreira', nickname: 'Lucas F.', email: 'lucas@barber.com', phone: '(51) 99111-2233', commission: 40, color: '#C0392B' },
      { name: 'Rafael Matos', nickname: 'Rafael M.', email: 'rafael@barber.com', phone: '(51) 99444-5566', commission: 40, color: '#2980B9' },
      { name: 'Diego Costa', nickname: 'Diego C.', email: 'diego@barber.com', phone: '(51) 99777-8899', commission: 35, color: '#27AE60' },
    ];

    for (let barber of barbers) {
      await run(
        `INSERT OR IGNORE INTO barbers (user_id, name, nickname, email, phone, commission, color)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, barber.name, barber.nickname, barber.email, barber.phone, barber.commission, barber.color]
      );
    }

    // Adicionar serviços
    const services = [
      { name: 'Corte Simples', duration: 30, price: 45, description: 'Corte tradicional' },
      { name: 'Degradê / Fade', duration: 40, price: 55, description: 'Degradê com acabamento' },
      { name: 'Barba', duration: 25, price: 35, description: 'Modelagem de barba' },
      { name: 'Corte + Barba', duration: 55, price: 75, description: 'Combo completo' },
      { name: 'Pigmentação', duration: 30, price: 40, description: 'Pigmentação' },
      { name: 'Corte Kids', duration: 30, price: 38, description: 'Para crianças' },
    ];

    for (let service of services) {
      await run(
        `INSERT OR IGNORE INTO services (user_id, name, duration, price, description)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, service.name, service.duration, service.price, service.description]
      );
    }

    // Adicionar clientes
    const clients = [
      { name: 'João Silva', phone: '(51) 99001-1111', email: 'joao@email.com' },
      { name: 'Carlos Santos', phone: '(51) 99002-2222', email: 'carlos@email.com' },
      { name: 'Pedro Costa', phone: '(51) 99003-3333', email: 'pedro@email.com' },
    ];

    for (let client of clients) {
      await run(
        `INSERT OR IGNORE INTO clients (user_id, name, phone, email)
         VALUES (?, ?, ?, ?)`,
        [userId, client.name, client.phone, client.email]
      );
    }

    console.log('✅ Dados seed criados com sucesso!');
    console.log('\n📝 Credenciais de teste:');
    console.log('  Email: demo@barberos.app');
    console.log('  Senha: demo123');
  } catch (err) {
    console.error('❌ Erro ao fazer seed:', err.message);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedInitialData().then(() => {
    console.log('✨ Iniciação concluída!');
    process.exit(0);
  }).catch(err => {
    console.error('Erro:', err);
    process.exit(1);
  });
}

module.exports = { seedInitialData };
