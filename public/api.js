const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:3000/api' 
  : '/api';

let authToken = localStorage.getItem('token');

// Helper para fazer requisições autenticadas
async function apiCall(method, endpoint, body = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro desconhecido');
    }

    return data;
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error);
    throw error;
  }
}

// ===== AUTH APIs =====
async function apiRegister(name, email, phone, shop_name, password) {
  const data = await apiCall('POST', '/auth/register', {
    name, email, phone, shop_name, password
  });
  authToken = data.token;
  localStorage.setItem('token', authToken);
  return data;
}

async function apiLogin(email, password) {
  const data = await apiCall('POST', '/auth/login', { email, password });
  authToken = data.token;
  localStorage.setItem('token', authToken);
  return data;
}

async function apiBarberLogin(email, access_code) {
  const data = await apiCall('POST', '/auth/barber/login', { email, access_code });
  authToken = data.token;
  localStorage.setItem('token', authToken);
  return data;
}

async function apiGetUser() {
  return await apiCall('GET', '/auth/me');
}

async function apiUpdateUser(user_data) {
  return await apiCall('PUT', '/auth/me', user_data);
}

async function apiChangePassword(password, newPassword) {
  return await apiCall('POST', '/auth/change-password', { password, newPassword });
}

// ===== BARBERS APIs =====
async function apiGetBarbers() {
  return await apiCall('GET', '/barbers');
}

async function apiGetBarber(id) {
  return await apiCall('GET', `/barbers/${id}`);
}

async function apiCreateBarber(barber_data) {
  return await apiCall('POST', '/barbers', barber_data);
}

async function apiUpdateBarber(id, barber_data) {
  return await apiCall('PUT', `/barbers/${id}`, barber_data);
}

async function apiDeleteBarber(id) {
  return await apiCall('DELETE', `/barbers/${id}`);
}

// ===== SERVICES APIs =====
async function apiGetServices() {
  return await apiCall('GET', '/services');
}

async function apiGetService(id) {
  return await apiCall('GET', `/services/${id}`);
}

async function apiCreateService(service_data) {
  return await apiCall('POST', '/services', service_data);
}

async function apiUpdateService(id, service_data) {
  return await apiCall('PUT', `/services/${id}`, service_data);
}

async function apiDeleteService(id) {
  return await apiCall('DELETE', `/services/${id}`);
}

// ===== APPOINTMENTS APIs =====
async function apiGetAppointments(filters = {}) {
  const params = new URLSearchParams();
  if (filters.date) params.append('date', filters.date);
  if (filters.barber_id) params.append('barber_id', filters.barber_id);

  return await apiCall('GET', `/appointments?${params.toString()}`);
}

async function apiGetAppointment(id) {
  return await apiCall('GET', `/appointments/${id}`);
}

async function apiCreateAppointment(apt_data) {
  return await apiCall('POST', '/appointments', apt_data);
}

async function apiUpdateAppointment(id, apt_data) {
  return await apiCall('PUT', `/appointments/${id}`, apt_data);
}

async function apiChangeAppointmentStatus(id, status) {
  return await apiCall('PATCH', `/appointments/${id}/status`, { status });
}

async function apiDeleteAppointment(id) {
  return await apiCall('DELETE', `/appointments/${id}`);
}

async function apiGetAvailableTimes(barber_id, date, service_id) {
  return await apiCall('GET', `/appointments/${barber_id}/available-times?date=${date}&service_id=${service_id}`);
}

// ===== CLIENTS APIs =====
async function apiGetClients() {
  return await apiCall('GET', '/clients');
}

async function apiGetClient(id) {
  return await apiCall('GET', `/clients/${id}`);
}

async function apiCreateClient(client_data) {
  return await apiCall('POST', '/clients', client_data);
}

async function apiUpdateClient(id, client_data) {
  return await apiCall('PUT', `/clients/${id}`, client_data);
}

async function apiSearchClientByPhone(phone) {
  return await apiCall('GET', `/clients/search/phone?phone=${phone}`);
}

async function apiUpdateClientStats(id, amount) {
  return await apiCall('POST', `/clients/${id}/update-stats`, { amount });
}

async function apiDeleteClient(id) {
  return await apiCall('DELETE', `/clients/${id}`);
}

// ===== CONFIG APIs =====
async function apiGetConfig() {
  return await apiCall('GET', '/config');
}

async function apiSaveHoursConfig(hours) {
  return await apiCall('PUT', '/config', { hours_config: hours });
}

async function apiSaveNotifications(notifs) {
  return await apiCall('PUT', '/config', { notifications: notifs });
}

async function apiGetIdentity() {
  return await apiCall('GET', '/config/identity/get');
}

async function apiSaveIdentity(identity_data) {
  return await apiCall('PUT', '/config/identity/update', identity_data);
}

// ===== FINANCE APIs =====
async function apiGetFinanceSummary(period = 'month') {
  return await apiCall('GET', `/finance/summary?period=${period}`);
}

async function apiGetFinanceByBarber(period = 'month') {
  return await apiCall('GET', `/finance/by-barber?period=${period}`);
}

async function apiGetTopServices(period = 'month') {
  return await apiCall('GET', `/finance/top-services?period=${period}`);
}

async function apiGetTransactions(limit = 50, offset = 0) {
  return await apiCall('GET', `/finance/transactions?limit=${limit}&offset=${offset}`);
}

async function apiGetDailyRevenue(period = 'week') {
  return await apiCall('GET', `/finance/daily-revenue?period=${period}`);
}

async function apiGetOccupancyRate(date) {
  return await apiCall('GET', `/finance/occupancy-rate?date=${date}`);
}

// ===== PUBLIC SHOP APIs (SaaS) =====
async function apiGetShopPublic(slug) {
  const response = await fetch(`${API_BASE}/shop/${slug}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Erro ao carregar barbearia');
  return data;
}

async function apiBookPublic(slug, data) {
  const response = await fetch(`${API_BASE}/shop/${slug}/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Erro ao realizar agendamento');
  return result;
}

// ===== HELPERS =====
function setAuthToken(token) {
  authToken = token;
  localStorage.setItem('token', token);
}

function getAuthToken() {
  return authToken;
}

function clearAuth() {
  authToken = null;
  localStorage.removeItem('token');
}

function isAuthenticated() {
  return authToken !== null;
}
