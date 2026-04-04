# 🔌 Guia de Integração Frontend com Backend

Este guia mostra como integrar o frontend (app.js) com o backend (API REST).

## 📋 Índice

1. [Setup Inicial](#setup-inicial)
2. [Autenticação](#autenticação)
3. [Gerenciamento de Barbeiros](#gerenciamento-de-barbeiros)
4. [Gerenciamento de Serviços](#gerenciamento-de-serviços)
5. [Agendamentos](#agendamentos)
6. [Clientes](#clientes)
7. [Configurações](#configurações)
8. [Financeiro](#financeiro)
9. [Tratamento de Erros](#tratamento-de-erros)

---

## Setup Inicial

### 1. Carregar o arquivo de API

O arquivo `api.js` já está incluído em `index.html`:

```html
<script src="api.js"></script>
<script src="app.js"></script>
```

### 2. Verificar autenticação no carregamento

```javascript
// No início do app.js
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      setAuthToken(token);
      const user = await apiGetUser();
      DB.user = user;
      enterOwner();
    } catch (err) {
      clearAuth();
      showScreen('auth-screen');
    }
  }
});
```

---

## Autenticação

### Registrar Novo Usuário

```javascript
async function handleRegister() {
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const phone = document.getElementById('reg-phone').value;
  const shop_name = document.getElementById('reg-shop').value;
  const password = document.getElementById('reg-pass').value;

  try {
    const result = await apiRegister(name, email, phone, shop_name, password);
    DB.user = result.user;
    DB.shop = { name: result.user.shop, slug: result.user.slug };
    
    toast('Conta criada com sucesso!');
    enterOwner();
  } catch (err) {
    toast(err.message, 'error');
  }
}
```

### Login

```javascript
async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value;

  if (!email || !pass) {
    return toast('Preencha e-mail e senha', 'error');
  }

  try {
    const result = await apiLogin(email, pass);
    DB.user = result.user;
    DB.shop = { name: result.user.shop, slug: result.user.slug };
    
    // Carregar dados do usuário
    await loadInitialData();
    enterOwner();
  } catch (err) {
    toast(err.message, 'error');
  }
}

async function loadInitialData() {
  try {
    DB.barbers = await apiGetBarbers();
    DB.services = await apiGetServices();
    DB.clients = await apiGetClients();
    DB.appointments = await apiGetAppointments();
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
  }
}
```

### Logout

```javascript
function logout() {
  clearAuth();
  DB.user = null;
  DB.shop = null;
  showScreen('auth-screen');
  showForm('form-login');
  toast('Desconectado com sucesso');
}
```

---

## Gerenciamento de Barbeiros

### Listar Barbeiros

```javascript
async function renderBarbers() {
  try {
    DB.barbers = await apiGetBarbers();
    
    const grid = document.getElementById('barbers-grid');
    grid.innerHTML = DB.barbers.map(b => `
      <div class="barber-card">
        <div class="bc-avatar">${initials(b.name)}</div>
        <h4>${b.name}</h4>
        <p>${b.nickname}</p>
        <div class="bc-info">
          <span>📞 ${b.phone}</span>
          <span>💰 ${b.commission}%</span>
        </div>
        <div class="bc-actions">
          <button class="btn-sm" onclick="openBarberModal(${b.id})">Editar</button>
          <button class="btn-sm btn-danger" onclick="deleteBarber(${b.id})">Deletar</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    toast('Erro ao carregar barbeiros: ' + err.message, 'error');
  }
}
```

### Criar Barbeiro

```javascript
async function saveBarber() {
  const name = document.getElementById('barber-name').value;
  const nickname = document.getElementById('barber-nick').value;
  const email = document.getElementById('barber-email').value;
  const phone = document.getElementById('barber-phone').value;
  const commission = parseFloat(document.getElementById('barber-commission').value);
  const color = document.getElementById('barber-color').value;
  const start_time = document.getElementById('barber-start').value;
  const end_time = document.getElementById('barber-end').value;

  // Especialidades (serviços)
  const specialties = DB.services
    .filter((_, i) => document.querySelector(`#svc-check-${i}`)?.checked)
    .map(s => s.id);

  // Dias de trabalho
  const working_days = Array.from(document.querySelectorAll('#barber-days input:checked'))
    .map(el => parseInt(el.value));

  try {
    if (DB.editingBarber) {
      // Atualizar
      await apiUpdateBarber(DB.editingBarber.id, {
        name, nickname, email, phone, commission, color, start_time, end_time,
        specialties, working_days
      });
      toast('Barbeiro atualizado!');
    } else {
      // Criar novo
      await apiCreateBarber({
        name, nickname, email, phone, commission, color, start_time, end_time,
        specialties, working_days
      });
      toast('Barbeiro adicionado!');
    }

    closeModal('modal-barber');
    renderBarbers();
  } catch (err) {
    toast('Erro: ' + err.message, 'error');
  }
}

async function deleteBarber(id) {
  if (!confirm('Tem certeza?')) return;
  
  try {
    await apiDeleteBarber(id);
    toast('Barbeiro removido');
    renderBarbers();
  } catch (err) {
    toast('Erro: ' + err.message, 'error');
  }
}
```

---

## Gerenciamento de Serviços

### Listar e Renderizar Serviços

```javascript
async function renderServices() {
  try {
    DB.services = await apiGetServices();
    
    const tbody = document.getElementById('services-tbody');
    tbody.innerHTML = DB.services.map(s => `
      <tr>
        <td>${s.name}</td>
        <td>${s.duration}min</td>
        <td>R$ ${s.price.toFixed(2)}</td>
        <td>${s.barbers?.length || 0}</td>
        <td>
          <button class="btn-xs" onclick="editService(${s.id})">Editar</button>
          <button class="btn-xs btn-danger" onclick="deleteService(${s.id})">Deletar</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    toast('Erro ao carregar serviços: ' + err.message, 'error');
  }
}

async function saveService() {
  const name = document.getElementById('svc-name').value;
  const duration = parseInt(document.getElementById('svc-duration').value);
  const price = parseFloat(document.getElementById('svc-price').value);
  const description = document.getElementById('svc-desc').value;

  try {
    if (DB.editingService) {
      await apiUpdateService(DB.editingService.id, { name, duration, price, description });
    } else {
      await apiCreateService({ name, duration, price, description });
    }

    toast('Serviço salvo!');
    closeModal('modal-service');
    renderServices();
  } catch (err) {
    toast('Erro: ' + err.message, 'error');
  }
}

async function deleteService(id) {
  if (!confirm('Deletar este serviço?')) return;

  try {
    await apiDeleteService(id);
    toast('Serviço removido');
    renderServices();
  } catch (err) {
    toast('Erro: ' + err.message, 'error');
  }
}
```

---

## Agendamentos

### Listar Agendamentos da Agenda

```javascript
async function renderAgenda() {
  try {
    const date = document.getElementById('agenda-date')?.dataset.date || 
                 new Date().toISOString().split('T')[0];

    const appointments = await apiGetAppointments({ date });
    DB.appointments = appointments;

    const view = document.getElementById('agenda-view');
    view.innerHTML = appointments.map(a => `
      <div class="apt-item" style="border-left: 4px solid ${DB.barbers.find(b => b.id === a.barber_id)?.color}">
        <div class="apt-time">${a.appointment_date.split(' ')[1]}</div>
        <div class="apt-info">
          <strong>${a.client_name}</strong>
          <span>${a.service_name} • ${a.barber_name}</span>
          <span class="apt-status" data-status="${a.status}">${getStatusLabel(a.status)}</span>
        </div>
        <div class="apt-actions">
          <button class="btn-xs" onclick="editAppointment(${a.id})">Editar</button>
          <select onchange="changeStatus(${a.id}, this.value)">
            <option value="pending" ${a.status === 'pending' ? 'selected' : ''}>Pendente</option>
            <option value="confirmed" ${a.status === 'confirmed' ? 'selected' : ''}>Confirmado</option>
            <option value="done" ${a.status === 'done' ? 'selected' : ''}>Concluído</option>
            <option value="cancelled" ${a.status === 'cancelled' ? 'selected' : ''}>Cancelado</option>
          </select>
        </div>
      </div>
    `).join('');
  } catch (err) {
    toast('Erro ao carregar agenda: ' + err.message, 'error');
  }
}

async function changeStatus(id, status) {
  try {
    await apiChangeAppointmentStatus(id, status);
    toast('Status atualizado');
    renderAgenda();
  } catch (err) {
    toast('Erro: ' + err.message, 'error');
  }
}
```

### Criar Agendamento

```javascript
async function saveAppointment() {
  const client_id = DB.selectedClient?.id;
  const barber_id = parseInt(document.getElementById('apt-barber').value);
  const service_id = parseInt(document.getElementById('apt-service').value);
  const appointment_date = `${document.getElementById('apt-date').value} ${document.getElementById('apt-time').value}`;
  const observations = document.getElementById('apt-obs').value;

  if (!client_id || !barber_id || !service_id || !appointment_date) {
    return toast('Preencha todos os campos', 'error');
  }

  try {
    await apiCreateAppointment({
      client_id, barber_id, service_id, appointment_date, observations
    });

    toast('Agendamento criado!');
    closeModal('modal-appointment');
    renderAgenda();
  } catch (err) {
    toast('Erro: ' + err.message, 'error');
  }
}

async function editAppointment(id) {
  try {
    const apt = await apiGetAppointment(id);
    DB.editingAppointment = apt;
    DB.selectedClient = { id: apt.client_id };

    document.getElementById('apt-client').value = apt.client_name;
    document.getElementById('apt-phone').value = apt.client_phone;
    document.getElementById('apt-email').value = apt.client_email;
    document.getElementById('apt-service').value = apt.service_id;
    document.getElementById('apt-barber').value = apt.barber_id;
    document.getElementById('apt-date').value = apt.appointment_date.split(' ')[0];
    document.getElementById('apt-time').value = apt.appointment_date.split(' ')[1];
    document.getElementById('apt-obs').value = apt.observations;

    document.getElementById('apt-modal-title').textContent = 'Editar Agendamento';
    openModal('modal-appointment');
  } catch (err) {
    toast('Erro: ' + err.message, 'error');
  }
}
```

### Horários Disponíveis

```javascript
async function renderTimeSlots(barber_id, date, service_id) {
  try {
    const times = await apiGetAvailableTimes(barber_id, date, service_id);
    
    const container = document.getElementById('bk-slots');
    container.innerHTML = times.map(time => `
      <div class="time-slot" onclick="selectTime('${time}')">
        ${time}
      </div>
    `).join('');
  } catch (err) {
    toast('Erro ao carregar horários: ' + err.message, 'error');
  }
}
```

---

## Clientes

### Listar Clientes

```javascript
async function renderClients() {
  try {
    DB.clients = await apiGetClients();

    const tbody = document.getElementById('clients-tbody');
    tbody.innerHTML = DB.clients.map(c => `
      <tr onclick="viewClient(${c.id})">
        <td>${c.name}</td>
        <td>${c.phone}</td>
        <td>${c.last_visit ? new Date(c.last_visit).toLocaleDateString('pt-BR') : '-'}</td>
        <td>${c.visit_count}</td>
        <td>R$ ${(c.total_spent || 0).toFixed(2)}</td>
        <td>
          <button class="btn-xs" onclick="event.stopPropagation(); bookForClient()">Agendar</button>
          <button class="btn-xs btn-danger" onclick="event.stopPropagation(); deleteClient(${c.id})">Deletar</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    toast('Erro: ' + err.message, 'error');
  }
}

async function viewClient(id) {
  try {
    const client = await apiGetClient(id);
    DB.selectedClient = client;

    const body = document.getElementById('client-modal-body');
    body.innerHTML = `
      <div class="client-detail">
        <div class="cd-header">
          <div class="cd-avatar">${initials(client.name)}</div>
          <div>
            <h3>${client.name}</h3>
            <p>${client.phone}</p>
          </div>
        </div>
        <div class="cd-stats">
          <div class="stat"><strong>${client.visit_count || 0}</strong><span>Visitas</span></div>
          <div class="stat"><strong>R$ ${(client.total_spent || 0).toFixed(2)}</strong><span>Total gasto</span></div>
          <div class="stat"><strong>${client.last_visit ? new Date(client.last_visit).toLocaleDateString('pt-BR') : '-'}</strong><span>Último corte</span></div>
        </div>
        <div class="cd-appointments">
          <h4>Últimos agendamentos</h4>
          ${(client.appointments || []).map(a => `
            <div class="apt-history">
              <span>${new Date(a.appointment_date).toLocaleDateString('pt-BR')}</span>
              <strong>${a.service_name}</strong>
              <span>com ${a.barber_name} • R$ ${a.price}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    openModal('modal-client');
  } catch (err) {
    toast('Erro: ' + err.message, 'error');
  }
}

async function deleteClient(id) {
  if (!confirm('Deletar cliente?')) return;

  try {
    await apiDeleteClient(id);
    toast('Cliente removido');
    renderClients();
  } catch (err) {
    toast('Erro: ' + err.message, 'error');
  }
}
```

---

## Configurações

### Salvar Horários

```javascript
async function saveConfig() {
  try {
    const hoursConfig = {};
    for (let i = 0; i < 7; i++) {
      hoursConfig[i] = {
        open: document.querySelector(`#day-${i}-open`)?.checked || false,
        start: document.getElementById(`day-${i}-start`)?.value || '09:00',
        end: document.getElementById(`day-${i}-end`)?.value || '18:00'
      };
    }

    await apiSaveHoursConfig(hoursConfig);
    toast('Horários atualizados!');
  } catch (err) {
    toast('Erro: ' + err.message, 'error');
  }
}

async function saveNotifs() {
  try {
    const notifications = {
      whatsapp: document.getElementById('notif-whatsapp').checked,
      email: document.getElementById('notif-email').checked,
      owner: document.getElementById('notif-owner').checked,
      24h: document.getElementById('notif-24h').checked
    };

    await apiSaveNotifications(notifications);
    toast('Notificações atualizadas!');
  } catch (err) {
    toast('Erro: ' + err.message, 'error');
  }
}
```

### Salvar Identidade Visual

```javascript
async function saveIdentity() {
  try {
    const identity = {
      color_primary: document.getElementById('color-primary').value,
      color_bg: document.getElementById('color-bg').value,
      color_text: document.getElementById('color-text').value,
      color_card: document.getElementById('color-card').value,
      font_display: document.getElementById('font-display').value,
      welcome_message: document.getElementById('cfg-welcome').value,
      logo_url: null // Se enviar imagem
    };

    await apiSaveIdentity(identity);
    applyBrandColors();
    toast('Identidade visual atualizada!');
  } catch (err) {
    toast('Erro: ' + err.message, 'error');
  }
}
```

---

## Financeiro

### Dashboard Financeiro

```javascript
async function renderFinanceiro() {
  try {
    const period = document.querySelector('.period-btn.active')?.dataset.period || 'month';

    const summary = await apiGetFinanceSummary(period);
    const byBarber = await apiGetFinanceByBarber(period);
    const topServices = await apiGetTopServices(period);

    // Renderizar cards
    document.getElementById('fin-kpis').innerHTML = `
      <div class="kpi-card">
        <span class="kpi-label">Receita</span>
        <span class="kpi-value">R$ ${summary.revenue.toFixed(2)}</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Agendamentos</span>
        <span class="kpi-value">${summary.appointments}</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Clientes</span>
        <span class="kpi-value">${summary.clients}</span>
      </div>
    `;

    // Gráfico por barbeiro
    document.getElementById('fin-barber-chart').innerHTML = byBarber
      .map(b => `
        <div class="chart-row">
          <span>${b.nickname}</span>
          <div class="chart-bar" style="width: ${(b.revenue / Math.max(...byBarber.map(x => x.revenue))) * 100}%">
            R$ ${b.revenue.toFixed(2)}
          </div>
        </div>
      `).join('');

    // Top serviços
    document.getElementById('fin-services-chart').innerHTML = topServices
      .map(s => `
        <div class="service-item">
          <span>${s.name}</span>
          <span>${s.count}x • R$ ${s.revenue.toFixed(2)}</span>
        </div>
      `).join('');
  } catch (err) {
    toast('Erro ao carregar financeiro: ' + err.message, 'error');
  }
}
```

---

## Tratamento de Erros

### Interceptar erros da API

```javascript
// Adicione no começo do app.js:
window.addEventListener('error', (event) => {
  if (event.error?.message?.includes('fetch')) {
    toast('Erro de conexão com servidor', 'error');
  }
});

// Interceptar respostas de erro
const originalApiCall = window.apiCall;
window.apiCall = async function(...args) {
  try {
    return await originalApiCall(...args);
  } catch (err) {
    if (err.message === 'Token inválido') {
      clearAuth();
      showScreen('auth-screen');
    }
    throw err;
  }
};
```

---

## ✅ Checklist de Integração

- [ ] Arquivo `api.js` carregado antes de `app.js`
- [ ] Funções de login/register usam `apiLogin()` e `apiRegister()`
- [ ] `handleLogin()` salva o token no localStorage
- [ ] `renderBarbers()` chama `apiGetBarbers()`
- [ ] `renderServices()` chama `apiGetServices()`
- [ ] `renderAgenda()` chama `apiGetAppointments()`
- [ ] `renderClients()` chama `apiGetClients()`
- [ ] `renderFinanceiro()` chama `apiGetFinanceSummary()`
- [ ] Todos os POST/PUT/DELETE usam métodos da API
- [ ] Token é mantido em `localStorage`
- [ ] Logout limpa o token e retorna ao login
- [ ] Erros de conexão mostram toast

---

**Pronto! Seu frontend está integrado com o backend RESTful. 🚀**
