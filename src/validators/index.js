/**
 * Funções de validação para o sistema
 */

// Validar email
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validar telefone
function isValidPhone(phone) {
  const re = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/;
  return re.test(phone);
}

// Validar senha (mínimo 8 caracteres)
function isValidPassword(password) {
  return password && password.length >= 8;
}

// Validar nome
function isValidName(name) {
  return name && name.trim().length >= 3;
}

// Validar preço
function isValidPrice(price) {
  const num = parseFloat(price);
  return !isNaN(num) && num > 0;
}

// Validar duração
function isValidDuration(duration) {
  const num = parseInt(duration);
  return !isNaN(num) && num > 0 && num <= 480; // máximo 8 horas
}

// Validar data
function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

// Validar horário
function isValidTime(timeString) {
  const re = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return re.test(timeString);
}

// Validar comissão
function isValidCommission(commission) {
  const num = parseFloat(commission);
  return !isNaN(num) && num >= 0 && num <= 100;
}

// Sanitizar string (prevenir XSS)
function sanitizeString(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .substring(0, 255); // limitar tamanho
}

// Validar cores (hex)
function isValidHexColor(color) {
  const re = /^#[0-9a-f]{6}$/i;
  return re.test(color);
}

// Validar URL
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

// Validar slug
function isValidSlug(slug) {
  const re = /^[a-z0-9-]+$/;
  return re.test(slug);
}

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidPassword,
  isValidName,
  isValidPrice,
  isValidDuration,
  isValidDate,
  isValidTime,
  isValidCommission,
  sanitizeString,
  isValidHexColor,
  isValidUrl,
  isValidSlug
};
