const { Pool } = require('pg');
const config = require('../config');

// Configuração da conexão direta com Supabase PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necessário para Supabase/Vercel
  }
});

// Helper para converter ? (SQLite) para $1, $2 (PostgreSQL)
const convertSql = (sql) => {
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
};

/**
 * Funções de compatibilidade para manter o sistema funcionando
 * usando PostgreSQL direto no Supabase.
 */

const get = async (sql, params = []) => {
  try {
    const pgSql = convertSql(sql);
    const { rows } = await pool.query(pgSql, params);
    return rows[0] || null;
  } catch (err) {
    console.error('❌ Erro no Banco (GET):', err.message);
    console.error('SQL:', sql);
    return null;
  }
};

const all = async (sql, params = []) => {
  try {
    const pgSql = convertSql(sql);
    const { rows } = await pool.query(pgSql, params);
    return rows || [];
  } catch (err) {
    console.error('❌ Erro no Banco (ALL):', err.message);
    return [];
  }
};

const run = async (sql, params = []) => {
  try {
    const pgSql = convertSql(sql);
    
    // Se for um INSERT, queremos o ID de volta
    let finalSql = pgSql;
    if (sql.toLowerCase().includes('insert into')) {
      finalSql += ' RETURNING id';
    }

    const { rows, rowCount } = await pool.query(finalSql, params);
    
    return { 
      lastID: rows[0]?.id || 0, 
      changes: rowCount 
    };
  } catch (err) {
    console.error('❌ Erro no Banco (RUN):', err.message);
    throw err;
  }
};

// Mock para manter compatibilidade com o boot do servidor
const getDb = () => {
  console.log('💎 Conexão Direta PostgreSQL Ativa (Supabase)');
  return { serialize: (fn) => fn() }; 
};

module.exports = {
  getDb,
  run,
  get,
  all,
  pool // Exportamos o pool caso precise de funções avançadas
};
