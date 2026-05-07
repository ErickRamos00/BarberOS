/**
 * Configurações e constantes da aplicação
 */

require('dotenv').config();

const config = {
  // Servidor
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  HOST: process.env.HOST || 'localhost',

  // Segurança
  JWT_SECRET: process.env.JWT_SECRET || 'barber-secret-key-change-in-production',
  JWT_EXPIRES_IN: '30d',
  BCRYPT_ROUNDS: 10,

  // Banco de dados
  DATABASE_PATH: process.env.NODE_ENV === 'production' ? '/tmp/barber.db' : (process.env.DATABASE_PATH || './barber.db'),

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || process.env.BASE_URL || 'http://localhost:3000',

  // Limites
  MAX_UPLOAD_SIZE: '10mb',
  MAX_REQUESTS_PER_MINUTE: 100,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 horas

  // Validações
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 255,
  MAX_EMAIL_LENGTH: 255,
  MAX_PHONE_LENGTH: 20,
  MAX_COMMISSION: 100,
  MIN_DURATION: 5, // minutos
  MAX_DURATION: 480, // 8 horas
  MIN_PRICE: 0,
  MAX_PRICE: 9999.99,

  // Horários padrão
  DEFAULT_START_TIME: '09:00',
  DEFAULT_END_TIME: '18:00',
  DEFAULT_SLOT_DURATION: 30, // minutos

  // Cores padrão
  DEFAULT_COLORS: {
    primary: '#C0392B',
    bg: '#0D0D0D',
    text: '#F5F2ED',
    card: '#1A1A1A'
  },

  // Notificações padrão
  DEFAULT_NOTIFICATIONS: {
    whatsapp: true,
    email: true,
    owner: true,
    '24h': false
  },

  // Status de agendamento
  APPOINTMENT_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    DONE: 'done',
    CANCELLED: 'cancelled'
  },

  // Mensagens
  MESSAGES: {
    // Sucesso
    SUCCESS_LOGIN: 'Login bem-sucedido',
    SUCCESS_REGISTER: 'Usuário registrado com sucesso',
    SUCCESS_CREATED: 'Criado com sucesso',
    SUCCESS_UPDATED: 'Atualizado com sucesso',
    SUCCESS_DELETED: 'Deletado com sucesso',

    // Erros de autenticação
    ERROR_INVALID_CREDENTIALS: 'E-mail ou senha inválidos',
    ERROR_USER_NOT_FOUND: 'Usuário não encontrado',
    ERROR_UNAUTHORIZED: 'Não autorizado',
    ERROR_TOKEN_INVALID: 'Token inválido ou expirado',
    ERROR_TOKEN_MISSING: 'Token não fornecido',

    // Erros de validação
    ERROR_INVALID_EMAIL: 'E-mail inválido',
    ERROR_INVALID_PASSWORD: 'Senha deve ter pelo menos 8 caracteres',
    ERROR_INVALID_PHONE: 'Telefone inválido',
    ERROR_INVALID_PRICE: 'Preço deve ser um número maior que 0',
    ERROR_INVALID_DURATION: 'Duração deve ser entre 5 e 480 minutos',
    ERROR_MISSING_FIELDS: 'Campos obrigatórios não preenchidos',

    // Erros de negócio
    ERROR_EMAIL_EXISTS: 'E-mail já cadastrado no sistema',
    ERROR_PHONE_EXISTS: 'Telefone já cadastrado para este cliente',
    ERROR_SLUG_EXISTS: 'Este slug já está em uso',
    ERROR_BARBER_NOT_FOUND: 'Barbeiro não encontrado',
    ERROR_SERVICE_NOT_FOUND: 'Serviço não encontrado',
    ERROR_APPOINTMENT_NOT_FOUND: 'Agendamento não encontrado',
    ERROR_CLIENT_NOT_FOUND: 'Cliente não encontrado',

    // Erros de servidor
    ERROR_INTERNAL_SERVER: 'Erro interno do servidor',
    ERROR_DATABASE: 'Erro ao acessar o banco de dados'
  },

  // Produção checks
  isProduction() {
    return this.NODE_ENV === 'production';
  },

  isDevelopment() {
    return this.NODE_ENV === 'development';
  }
};

// Validar configurações críticas em produção
if (config.isProduction()) {
  if (config.JWT_SECRET === 'barber-secret-key-change-in-production') {
    console.error('❌ ERRO: JWT_SECRET não foi alterado em produção!');
    process.exit(1);
  }
  if (config.CORS_ORIGIN === '*') {
    console.warn('⚠️ AVISO: CORS_ORIGIN está aberto para todos em produção');
  }
}

module.exports = config;
