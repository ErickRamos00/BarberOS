const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

// Configurações do Supabase (Puxadas da Vercel)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase;
try {
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('📡 Cliente Supabase criado com sucesso');
  } else {
    console.error('⚠️ AVISO: SUPABASE_URL ou SUPABASE_KEY ausentes nas variáveis da Vercel!');
  }
} catch (err) {
  console.error('❌ Erro catastrófico ao criar cliente Supabase:', err.message);
}

/**
 * Funções de compatibilidade para manter o sistema funcionando
 * enquanto migramos do SQLite para Supabase.
 */

// Helper para converter query SQL simples em comandos Supabase
const parseSql = (sql) => {
  const tableMatch = sql.match(/FROM\s+(\w+)|INSERT\s+INTO\s+(\w+)|UPDATE\s+(\w+)|DELETE\s+FROM\s+(\w+)/i);
  const table = tableMatch ? (tableMatch[1] || tableMatch[2] || tableMatch[3] || tableMatch[4]) : null;
  return table;
};

const get = async (sql, params = []) => {
  if (!supabase) return null;
  const table = parseSql(sql);
  if (!table) throw new Error('Tabela não identificada na query');

  let query = supabase.from(table).select('*');

  // Lógica simples para WHERE (ex: email = ?)
  const whereMatch = sql.match(/WHERE\s+(\w+)\s*=/i);
  if (whereMatch && params.length > 0) {
    query = query.eq(whereMatch[1], params[0]);
  }

  const { data, error } = await query.single();
  if (error && error.code !== 'PGRST116') { // PGRST116 = Not Found (comum em login/verificação)
    console.error('Supabase Get Error:', error);
    return null;
  }
  return data;
};

const all = async (sql, params = []) => {
  if (!supabase) {
    console.error('❌ Supabase não inicializado para ALL');
    return [];
  }
  const table = parseSql(sql);
  console.log(`🔍 Supabase ALL [${table}] - Params:`, params);
  if (!table) throw new Error('Tabela não identificada na query');

  let query = supabase.from(table).select('*');

  // Lógica para filtros básicos (user_id = ?)
  const whereMatch = sql.match(/WHERE\s+(\w+)\s*=/i);
  if (whereMatch && params.length > 0) {
    query = query.eq(whereMatch[1], params[0]);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Supabase All Error:', error);
    return [];
  }
  return data;
};

const run = async (sql, params = []) => {
  if (!supabase) {
    console.error('❌ Supabase não inicializado para RUN');
    return { lastID: 0, changes: 0 };
  }
  const table = parseSql(sql);
  console.log(`📝 Supabase RUN [${table}] - Params:`, params);
  if (!table) throw new Error('Tabela não identificada na query');

  // INSERT
  if (sql.toLowerCase().includes('insert into')) {
    const colsMatch = sql.match(/\((.*?)\)/);
    if (!colsMatch) throw new Error('Colunas não encontradas no INSERT');
    
    const cols = colsMatch[1].split(',').map(c => c.trim());
    const dataObj = {};
    cols.forEach((col, index) => {
      dataObj[col] = params[index];
    });

    const { data, error } = await supabase.from(table).insert([dataObj]).select();
    if (error) throw error;
    return { lastID: data?.[0]?.id };
  }

  // UPDATE
  if (sql.toLowerCase().includes('update')) {
    const whereMatch = sql.match(/WHERE\s+(\w+)\s*=/i);
    const setMatch = sql.match(/SET\s+(.*?)\s+WHERE/i);
    
    if (setMatch && whereMatch) {
      const setParts = setMatch[1].split(',').map(p => p.trim().split('=')[0].trim());
      const dataObj = {};
      setParts.forEach((col, index) => {
        dataObj[col] = params[index];
      });

      const whereVal = params[params.length - 1]; // Geralmente o ID é o último parâmetro
      const { error } = await supabase.from(table).update(dataObj).eq(whereMatch[1], whereVal);
      if (error) throw error;
    }
  }

  // DELETE
  if (sql.toLowerCase().includes('delete')) {
    const whereMatch = sql.match(/WHERE\s+(\w+)\s*=/i);
    if (whereMatch && params.length > 0) {
      const { error } = await supabase.from(table).delete().eq(whereMatch[1], params[0]);
      if (error) throw error;
    }
  }

  return { changes: 1 };
};

// Mock para manter compatibilidade com o boot do servidor
const getDb = () => {
  console.log('✅ Supabase Cloud Database Ativo');
  return { serialize: (fn) => fn() }; 
};

module.exports = {
  getDb,
  run,
  get,
  all,
  supabase // Exportamos o cliente caso queira usar nativamente no futuro
};
