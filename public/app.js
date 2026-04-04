// ===== STATE =====
const DB = {
  user: null,
  shop: null,
  barbers: [],
  services: [],
  appointments: [],
  clients: [],
  identity: {
    primary: '#C0392B', bg: '#0D0D0D', text: '#F5F2ED', card: '#161616',
    fontDisplay: "'Bebas Neue'", welcome: 'Reserve seu horÃ¡rio'
  },
  hours: {
    0: { open: false, start: '09:00', end: '19:00' },
    1: { open: true,  start: '09:00', end: '19:00' },
    2: { open: true,  start: '09:00', end: '19:00' },
    3: { open: true,  start: '09:00', end: '19:00' },
    4: { open: true,  start: '09:00', end: '19:00' },
    5: { open: true,  start: '09:00', end: '19:00' },
    6: { open: true,  start: '09:00', end: '17:00' },
  },
  pendingEmail: '',
  pendingVerifyCode: '',
  editingBarber: null,
  editingService: null,
  editingAppointment: null,
  selectedClient: null,
  agenda: { date: new Date() },
  booking: { service: null, barber: null, date: null, time: null },
  bookingCalendar: { year: new Date().getFullYear(), month: new Date().getMonth() }
};

// ===== SEED DATA =====
function seedData() {
  DB.barbers = [
    { id: 'b1', name: 'Lucas Ferreira', nick: 'Lucas F.', phone: '(51) 99111-2233', email: 'lucas@barber.com', color: '#C0392B', commission: 40, days: [1,2,3,4,5,6], start: '09:00', end: '19:00', specialties: ['DegradÃª', 'Navalhado', 'Barba'] },
    { id: 'b2', name: 'Rafael Matos', nick: 'Rafael M.', phone: '(51) 99444-5566', email: 'rafael@barber.com', color: '#2980B9', commission: 40, days: [1,2,3,4,5,6], start: '10:00', end: '20:00', specialties: ['Corte Social', 'Tesoura', 'PigmentaÃ§Ã£o'] },
    { id: 'b3', name: 'Diego Costa', nick: 'Diego C.', phone: '(51) 99777-8899', email: 'diego@barber.com', color: '#27AE60', commission: 35, days: [2,3,4,5,6], start: '09:00', end: '18:00', specialties: ['Kids', 'Barba', 'Sobrancelha'] },
  ];
  DB.services = [
    { id: 's1', name: 'Corte Simples', duration: 30, price: 45, desc: 'Corte tradicional na tesoura ou mÃ¡quina', barbers: ['b1','b2','b3'] },
    { id: 's2', name: 'DegradÃª / Fade', duration: 40, price: 55, desc: 'DegradÃª com acabamento perfeito', barbers: ['b1','b2'] },
    { id: 's3', name: 'Barba', duration: 25, price: 35, desc: 'Modelagem de barba com navalha e toalha quente', barbers: ['b1','b3'] },
    { id: 's4', name: 'Corte + Barba', duration: 55, price: 75, desc: 'Combo completo corte e barba', barbers: ['b1'] },
    { id: 's5', name: 'PigmentaÃ§Ã£o', duration: 30, price: 40, desc: 'PigmentaÃ§Ã£o para disfarÃ§ar falhas', barbers: ['b2'] },
    { id: 's6', name: 'Corte Kids', duration: 30, price: 38, desc: 'Corte para crianÃ§as atÃ© 10 anos', barbers: ['b3'] },
  ];
  const today = new Date();
  const fmt = d => d.toISOString().split('T')[0];
  const yesterday = new Date(today); yesterday.setDate(today.getDate()-1);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);

  DB.appointments = [
    { id: 'a1', client: 'Marcos Silva', phone: '(51) 99001-1111', email: 'marcos@email.com', service: 's1', barber: 'b1', date: fmt(today), time: '09:00', status: 'done', obs: '' },
    { id: 'a2', client: 'JoÃ£o Felipe', phone: '(51) 99002-2222', email: 'joao@email.com', service: 's2', barber: 'b2', date: fmt(today), time: '10:00', status: 'confirmed', obs: 'DegradÃª bem baixo' },
    { id: 'a3', client: 'Pedro Oliveira', phone: '(51) 99003-3333', email: 'pedro@email.com', service: 's3', barber: 'b1', date: fmt(today), time: '11:30', status: 'confirmed', obs: '' },
    { id: 'a4', client: 'Ricardo Costa', phone: '(51) 99004-4444', email: 'ricardo@email.com', service: 's4', barber: 'b2', date: fmt(today), time: '14:00', status: 'pending', obs: '' },
    { id: 'a5', client: 'AndrÃ© Lima', phone: '(51) 99005-5555', email: 'andre@email.com', service: 's1', barber: 'b3', date: fmt(today), time: '15:00', status: 'confirmed', obs: '' },
    { id: 'a6', client: 'Bruno Souza', phone: '(51) 99006-6666', email: 'bruno@email.com', service: 's2', barber: 'b1', date: fmt(today), time: '16:30', status: 'pending', obs: '' },
    { id: 'a7', client: 'Carlos Mendes', phone: '(51) 99007-7777', email: 'carlos@email.com', service: 's5', barber: 'b2', date: fmt(yesterday), time: '10:00', status: 'done', obs: '' },
    { id: 'a8', client: 'Felipe Gomes', phone: '(51) 99008-8888', email: 'felipe@email.com', service: 's6', barber: 'b3', date: fmt(tomorrow), time: '09:00', status: 'confirmed', obs: 'Kid, 7 anos' },
  ];
  DB.clients = [
    { id: 'c1', name: 'Marcos Silva', phone: '(51) 99001-1111', email: 'marcos@email.com', since: '2024-03-10' },
    { id: 'c2', name: 'JoÃ£o Felipe', phone: '(51) 99002-2222', email: 'joao@email.com', since: '2024-01-22' },
    { id: 'c3', name: 'Pedro Oliveira', phone: '(51) 99003-3333', email: 'pedro@email.com', since: '2023-11-05' },
    { id: 'c4', name: 'Ricardo Costa', phone: '(51) 99004-4444', email: 'ricardo@email.com', since: '2024-05-18' },
    { id: 'c5', name: 'AndrÃ© Lima', phone: '(51) 99005-5555', email: 'andre@email.com', since: '2024-02-28' },
    { id: 'c6', name: 'Bruno Souza', phone: '(51) 99006-6666', email: 'bruno@email.com', since: '2024-06-01' },
  ];
}

// ===== AUTH =====
function showForm(id) {
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value;
  if (!email || !pass) return toast('Preencha e-mail e senha', 'error');
  
  try {
    const result = await apiLogin(email, pass);
    DB.user = result.user || { email, name: email.split('@')[0], role: 'owner' };
    DB.shop = result.shop || { name: 'Minha Barbearia', slug: 'minha-barbearia' };
    await loadUserData();
    toast('âœ“ Login realizado!', 'success');
    setTimeout(() => enterOwner(), 500);
  } catch (err) {
    toast(`âœ— Erro: ${err.message}`, 'error');
  }
}

async function loginDemo() {
  try {
    const result = await apiLogin('demo@barberos.app', 'demo123');
    DB.user = result.user || { email: 'demo@barberos.app', name: 'Demo Dono', role: 'owner' };
    DB.shop = result.shop || { name: 'Barbearia Demo', slug: 'barbearia-demo' };
    await loadUserData();
    toast('âœ“ Demo login!', 'success');
    setTimeout(() => enterOwner(), 500);
  } catch (err) {
    toast(`âœ— Erro: ${err.message}`, 'error');
  }
}

function loginDemoClient() {
  DB.user = { email: 'cliente@demo.com', name: 'Cliente Demo', role: 'client' };
  DB.shop = { name: 'Barbearia Demo', slug: 'barbearia-demo' };
  seedData();
  enterClient();
}

function handleRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const shop = document.getElementById('reg-shop').value.trim();
  const pass = document.getElementById('reg-pass').value;
  if (!name || !email || !shop || !pass) return toast('Preencha todos os campos', 'error');
  if (pass.length < 8) return toast('Senha deve ter ao menos 8 caracteres', 'error');

  // Para versÃ£o de demo, usar seed data
  DB.pendingEmail = email;
  DB.user = { email, name, role: 'owner' };
  DB.shop = { name: shop, slug: shop.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') };

  DB.pendingVerifyCode = Math.floor(100000 + Math.random() * 900000).toString();

  simulateSendEmail(email, 'CÃ³digo de verificaÃ§Ã£o BarberOS', `
    <h2>Bem-vindo ao BarberOS!</h2>
    <p>Seu cÃ³digo de verificaÃ§Ã£o Ã©:</p>
    <h1 style="font-size:2rem;letter-spacing:8px;color:#C0392B">${DB.pendingVerifyCode}</h1>
    <p>Este cÃ³digo expira em 10 minutos.</p>
  `);

  document.getElementById('verify-email-show').textContent = email;
  showForm('form-verify');
  toast(`âœ‰ CÃ³digo enviado para ${email}`, 'success');
  setTimeout(() => {
    document.getElementById('code-hint').textContent = `(Demo: cÃ³digo Ã© ${DB.pendingVerifyCode})`;
  }, 500);
}

function moveDigit(el, idx) {
  el.value = el.value.replace(/\D/g,'');
  const digits = document.querySelectorAll('.code-digit');
  if (el.value && idx < 5) digits[idx+1].focus();
  if (idx === 5 && el.value) {
    setTimeout(verifyCode, 300);
  }
}

function verifyCode() {
  const digits = [...document.querySelectorAll('.code-digit')].map(d => d.value).join('');
  if (digits.length < 6) return toast('Digite os 6 dÃ­gitos', 'error');
  if (digits === DB.pendingVerifyCode) {
    seedData();
    toast('âœ“ E-mail verificado com sucesso!', 'success');
    setTimeout(enterOwner, 600);
  } else {
    toast('CÃ³digo incorreto. Verifique seu e-mail.', 'error');
    document.getElementById('code-hint').textContent = `CÃ³digo incorreto. (Demo: ${DB.pendingVerifyCode})`;
  }
}

function resendCode() {
  DB.pendingVerifyCode = Math.floor(100000 + Math.random() * 900000).toString();
  simulateSendEmail(DB.pendingEmail, 'Novo cÃ³digo de verificaÃ§Ã£o', `Seu novo cÃ³digo: ${DB.pendingVerifyCode}`);
  toast('Novo cÃ³digo enviado!', 'success');
  document.getElementById('code-hint').textContent = `(Demo: novo cÃ³digo Ã© ${DB.pendingVerifyCode})`;
}

function simulateSendEmail(to, subject, body) {
  console.log(`[EMAIL] Para: ${to} | Assunto: ${subject} | Corpo:`, body);
}

// Carrega todos os dados do usuÃ¡rio do banco de dados
async function loadUserData() {
  try {
    // Carregar barbers
    try {
      DB.barbers = await apiGetBarbers();
    } catch (e) {
      console.warn('Erro ao carregar barbers:', e);
      DB.barbers = [];
    }
    
    // Carregar serviÃ§os
    try {
      DB.services = await apiGetServices();
    } catch (e) {
      console.warn('Erro ao carregar services:', e);
      DB.services = [];
    }
    
    // Carregar clientes
    try {
      DB.clients = await apiGetClients();
    } catch (e) {
      console.warn('Erro ao carregar clients:', e);
      DB.clients = [];
    }
    
    // Carregar agendamentos
    try {
      DB.appointments = await apiGetAppointments();
    } catch (e) {
      console.warn('Erro ao carregar appointments:', e);
      DB.appointments = [];
    }
    
    // Carregar configuraÃ§Ãµes
    try {
      const cfg = await apiGetConfig();
      if (cfg.hours_config) DB.hours = cfg.hours_config;
    } catch (e) {
      console.warn('Erro ao carregar config:', e);
    }
    
    // Carregar identidade visual
    try {
      const idtf = await apiGetIdentity();
      if (idtf) DB.identity = { ...DB.identity, ...idtf };
    } catch (e) {
      console.warn('Erro ao carregar identidade:', e);
    }
  } catch (err) {
    console.error('Erro ao carregar dados do usuÃ¡rio:', err);
    // Se falhar, usar dados de seed como fallback
    seedData();
  }
}

function enterOwner() {
  showScreen('owner-screen');
  const initials = (DB.user.name || 'JD').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  document.getElementById('owner-avatar').textContent = initials;
  document.getElementById('sb-shop-name').textContent = DB.shop.name;
  document.getElementById('shop-link').textContent = `barberos.app/${DB.shop.slug}`;
  document.getElementById('cfg-name').value = DB.shop.name;
  document.getElementById('cfg-slug').value = DB.shop.slug;
  document.getElementById('cfg-email').value = DB.user.email || '';
  buildHoursConfig();
  showOwnerPage('dashboard');
}

function enterClient() {
  showScreen('client-screen');
  applyThemeToBooking();
  document.getElementById('bk-shop-name').textContent = DB.shop.name;
  document.getElementById('bk-shop-sub').textContent = DB.identity.welcome;
  initBooking();
}

function logout() {
  DB.user = null; DB.shop = null;
  showScreen('auth-screen');
  showForm('form-login');
}

// ===== SCREENS =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => { s.classList.remove('active'); s.style.display='none'; });
  const el = document.getElementById(id);
  el.style.display = id==='auth-screen'?'flex':'flex';
  el.classList.add('active');
}

// ===== OWNER PAGES =====
function showOwnerPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));
  const pageEl = document.getElementById('page-'+page);
  if (pageEl) pageEl.classList.remove('hidden');
  const btn = document.querySelector(`[data-page="${page}"]`);
  if (btn) btn.classList.add('active');
  const titles = { dashboard:'Dashboard', agenda:'Agenda', barbeiros:'Barbeiros', servicos:'ServiÃ§os', clientes:'Clientes', financeiro:'Financeiro', configuracoes:'ConfiguraÃ§Ãµes', identidade:'Identidade Visual' };
  document.getElementById('page-title').textContent = titles[page] || page;

  if (page === 'dashboard') renderDashboard();
  if (page === 'agenda') renderAgenda();
  if (page === 'barbeiros') renderBarbers();
  if (page === 'servicos') renderServices();
  if (page === 'clientes') renderClients();
  if (page === 'financeiro') renderFinanceiro();
  if (page === 'configuracoes') buildHoursConfig();
}

function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  sb.classList.toggle('collapsed');
}

// ===== DASHBOARD =====
function renderDashboard() {
  const today = new Date().toISOString().split('T')[0];
  const todayApts = DB.appointments.filter(a => a.date === today && a.status !== 'cancelled');
  const todayRevenue = todayApts.filter(a=>a.status==='done').reduce((s,a)=>{const svc=DB.services.find(s=>s.id===a.service);return s+(svc?svc.price:0);},0);
  const newClients = DB.clients.filter(c=>c.since && c.since.startsWith(new Date().toISOString().slice(0,7))).length;
  const maxSlots = 20;
  const ocupacao = Math.round((todayApts.length / maxSlots) * 100);

  document.getElementById('kpi-today').textContent = todayApts.length;
  document.getElementById('kpi-revenue').textContent = `R$ ${todayRevenue}`;
  document.getElementById('kpi-new-clients').textContent = newClients || DB.clients.length;
  document.getElementById('kpi-ocupacao').textContent = `${Math.min(ocupacao,100)}%`;

  const container = document.getElementById('dash-appointments');
  const sorted = todayApts.sort((a,b)=>a.time.localeCompare(b.time)).slice(0,5);
  if (!sorted.length) { container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">ðŸ“…</div><p>Nenhum agendamento hoje</p></div>`; }
  else container.innerHTML = sorted.map(a => aptItemHTML(a)).join('');

  const bc = document.getElementById('dash-barbers');
  bc.innerHTML = DB.barbers.map(b => {
    const apts = DB.appointments.filter(a=>a.barber===b.id && a.date===today && a.status!=='cancelled').length;
    return `<div class="barber-mini">
      <div class="barber-av" style="background:${b.color}">${initials(b.name)}</div>
      <div class="barber-mini-info"><div class="barber-mini-name">${b.nick}</div><div class="barber-mini-status">${b.specialties?b.specialties.slice(0,2).join(', '):''}</div></div>
      <div class="barber-mini-apts">${apts} hoje</div>
    </div>`;
  }).join('');

  renderWeekChart();
}

function renderWeekChart() {
  const days = ['Dom','Seg','Ter','Qua','Qui','Sex','SÃ¡b'];
  const today = new Date();
  const chart = document.getElementById('week-chart');
  const weekData = [];
  for (let i=6; i>=0; i--) {
    const d = new Date(today); d.setDate(today.getDate()-i);
    const dateStr = d.toISOString().split('T')[0];
    const apts = DB.appointments.filter(a=>a.date===dateStr && a.status==='done');
    const revenue = apts.reduce((s,a)=>{const svc=DB.services.find(sv=>sv.id===a.service);return s+(svc?svc.price:0);},0);
    weekData.push({ day: days[d.getDay()], revenue, isToday: i===0 });
  }
  const max = Math.max(...weekData.map(d=>d.revenue), 100);
  chart.innerHTML = weekData.map(d => `
    <div class="chart-bar-item">
      <div class="bar-fill ${d.isToday?'today':''}" style="height:${Math.max((d.revenue/max)*90,4)}px" title="R$ ${d.revenue}"></div>
      <div class="bar-val">R$${d.revenue}</div>
      <div class="bar-label">${d.day}</div>
    </div>`).join('');
}

// ===== AGENDA =====
let agendaDateOffset = 0;

function renderAgenda() {
  const base = new Date();
  base.setDate(base.getDate() + agendaDateOffset);
  const dateStr = base.toISOString().split('T')[0];
  const opts = { weekday:'long', day:'numeric', month:'long' };
  document.getElementById('agenda-date').textContent = agendaDateOffset===0?'Hoje, '+base.toLocaleDateString('pt-BR',{day:'numeric',month:'long'}):base.toLocaleDateString('pt-BR',opts);

  const sel = document.getElementById('agenda-filter-barber');
  sel.innerHTML = '<option value="">Todos os barbeiros</option>' + DB.barbers.map(b=>`<option value="${b.id}">${b.nick}</option>`).join('');

  const filterBarber = sel.value;
  const barbers = filterBarber ? DB.barbers.filter(b=>b.id===filterBarber) : DB.barbers;

  const view = document.getElementById('agenda-view');
  const apts = DB.appointments.filter(a=>a.date===dateStr && a.status!=='cancelled');

  if (!barbers.length) { view.innerHTML = '<div class="empty-state"><div class="empty-state-icon">âœ‚</div><p>Nenhum barbeiro cadastrado</p></div>'; return; }

  view.innerHTML = barbers.map(b => {
    const bApts = apts.filter(a=>a.barber===b.id).sort((a,c)=>a.time.localeCompare(c.time));
    const slots = bApts.length ? bApts.map(a => {
      const svc = DB.services.find(s=>s.id===a.service);
      return `<div class="time-block" style="border-left-color:${b.color}" onclick="editAppointment('${a.id}')">
        <div class="tb-time">${a.time} Â· ${svc?svc.duration:30}min</div>
        <div class="tb-client">${a.client}</div>
        <div class="tb-service">${svc?svc.name:'ServiÃ§o'}</div>
        <div class="tb-actions">
          ${a.status!=='done'?`<button class="tb-btn confirm" onclick="event.stopPropagation();changeStatus('${a.id}','done')">âœ“ Feito</button>`:''}
          ${a.status==='pending'?`<button class="tb-btn" onclick="event.stopPropagation();changeStatus('${a.id}','confirmed')">Confirmar</button>`:''}
          <button class="tb-btn cancel" onclick="event.stopPropagation();changeStatus('${a.id}','cancelled')">âœ•</button>
        </div>
      </div>`;
    }).join('') : `<div class="abc-empty">Sem agendamentos</div>`;

    return `<div class="agenda-barber-col">
      <div class="abc-header">
        <div class="barber-av" style="background:${b.color};width:28px;height:28px;font-size:.65rem">${initials(b.name)}</div>
        <div class="abc-name">${b.nick}</div>
        <div class="abc-count">${bApts.length} apt</div>
      </div>
      <div class="abc-slots">${slots}</div>
    </div>`;
  }).join('');
}

function changeDate(d) { agendaDateOffset+=d; renderAgenda(); }
function goToday() { agendaDateOffset=0; renderAgenda(); }

function changeStatus(aptId, status) {
  const a = DB.appointments.find(a=>a.id===aptId);
  if (a) { a.status=status; renderAgenda(); renderDashboard(); toast(`Status atualizado: ${statusLabel(status)}`,'success'); }
}
function statusLabel(s) { return {confirmed:'Confirmado',done:'ConcluÃ­do',cancelled:'Cancelado',pending:'Pendente'}[s]||s; }

// ===== BARBERS =====
function renderBarbers() {
  const grid = document.getElementById('barbers-grid');
  if (!DB.barbers.length) { grid.innerHTML = `<div class="empty-state"><div class="empty-state-icon">âœ‚</div><p>Nenhum barbeiro cadastrado ainda. Adicione o primeiro!</p></div>`; return; }
  const today = new Date().toISOString().split('T')[0];
  grid.innerHTML = DB.barbers.map(b => {
    const apts = DB.appointments.filter(a=>a.barber===b.id && a.status==='done');
    const revenue = apts.reduce((s,a)=>{const svc=DB.services.find(sv=>sv.id===a.service);return s+(svc?svc.price:0);},0);
    const todayApts = DB.appointments.filter(a=>a.barber===b.id&&a.date===today&&a.status!=='cancelled').length;
    return `<div class="barber-card">
      <div class="bc-top">
        <div class="bc-av" style="background:${b.color}">${initials(b.name)}</div>
        <div class="bc-info"><div class="bc-name">${b.name}</div><div class="bc-role">${b.commission}% comissÃ£o</div></div>
      </div>
      <div class="bc-stats">
        <div class="bc-stat"><span class="bc-stat-val">${todayApts}</span><span class="bc-stat-label">Hoje</span></div>
        <div class="bc-stat"><span class="bc-stat-val">${apts.length}</span><span class="bc-stat-label">Total</span></div>
        <div class="bc-stat"><span class="bc-stat-val">R$${revenue}</span><span class="bc-stat-label">Receita</span></div>
      </div>
      <div class="bc-tags">${(b.specialties||[]).map(s=>`<span class="bc-tag">${s}</span>`).join('')}</div>
      <div class="bc-actions">
        <button class="btn-sm" onclick="openBarberModal('${b.id}')">âœŽ Editar</button>
        <button class="btn-sm" onclick="showOwnerPage('agenda')">Ver agenda</button>
        <button class="btn-sm" style="border-color:var(--primary);color:var(--primary)" onclick="deleteBarber('${b.id}')">Remover</button>
      </div>
    </div>`;
  }).join('');
}

function openBarberModal(id=null) {
  DB.editingBarber = id;
  const b = id ? DB.barbers.find(b=>b.id===id) : null;
  document.getElementById('barber-modal-title').textContent = b ? 'Editar Barbeiro' : 'Novo Barbeiro';

  const specs = ['DegradÃª','Navalhado','Barba','Corte Social','Tesoura','PigmentaÃ§Ã£o','Kids','Sobrancelha','Hot Shave'];
  document.getElementById('specialty-checks').innerHTML = specs.map(s => `<label><input type="checkbox" value="${s}" ${b&&b.specialties&&b.specialties.includes(s)?'checked':''}>${s}</label>`).join('');

  if (b) {
    document.getElementById('barber-name').value = b.name;
    document.getElementById('barber-nick').value = b.nick||'';
    document.getElementById('barber-phone').value = b.phone||'';
    document.getElementById('barber-email').value = b.email||'';
    document.getElementById('barber-commission').value = b.commission||40;
    document.getElementById('barber-color').value = b.color||'#C0392B';
    document.getElementById('barber-start').value = b.start||'09:00';
    document.getElementById('barber-end').value = b.end||'19:00';
    document.querySelectorAll('#barber-days input').forEach(cb => {
      cb.checked = b.days && b.days.includes(parseInt(cb.value));
    });
  } else {
    document.getElementById('barber-name').value = '';
    document.getElementById('barber-nick').value = '';
    document.getElementById('barber-phone').value = '';
    document.getElementById('barber-email').value = '';
    document.getElementById('barber-commission').value = 40;
    document.getElementById('barber-color').value = '#C0392B';
    document.getElementById('barber-start').value = '09:00';
    document.getElementById('barber-end').value = '19:00';
  }
  openModal('modal-barber');
}

function saveBarber() {
  const name = document.getElementById('barber-name').value.trim();
  if (!name) return toast('Nome Ã© obrigatÃ³rio', 'error');
  const nick = document.getElementById('barber-nick').value.trim() || name.split(' ')[0];
  const days = [...document.querySelectorAll('#barber-days input:checked')].map(c=>parseInt(c.value));
  const specialties = [...document.querySelectorAll('#specialty-checks input:checked')].map(c=>c.value);
  const data = {
    name, nick,
    phone: document.getElementById('barber-phone').value,
    email: document.getElementById('barber-email').value,
    commission: parseInt(document.getElementById('barber-commission').value)||40,
    color: document.getElementById('barber-color').value,
    start: document.getElementById('barber-start').value,
    end: document.getElementById('barber-end').value,
    days, specialties
  };
  
  if (DB.editingBarber) {
    // ATUALIZAR no backend
    apiUpdateBarber(DB.editingBarber, data).then(() => {
      const idx = DB.barbers.findIndex(b=>b.id===DB.editingBarber);
      DB.barbers[idx] = { ...DB.barbers[idx], ...data };
      toast('âœ“ Barbeiro atualizado!', 'success');
      closeModal('modal-barber');
      renderBarbers();
      refreshBarberSelects();
    }).catch(err => toast(`âœ— Erro: ${err.message}`, 'error'));
  } else {
    // CRIAR no backend
    apiCreateBarber(data).then(newBarber => {
      DB.barbers.push(newBarber);
      toast('âœ“ Barbeiro adicionado!', 'success');
      closeModal('modal-barber');
      renderBarbers();
      refreshBarberSelects();
    }).catch(err => toast(`âœ— Erro: ${err.message}`, 'error'));
  }
}

function deleteBarber(id) {
  if (!confirm('Remover este barbeiro?')) return;
  apiDeleteBarber(id).then(() => {
    DB.barbers = DB.barbers.filter(b=>b.id!==id);
    renderBarbers();
    toast('âœ“ Barbeiro removido', 'success');
  }).catch(err => toast(`âœ— Erro: ${err.message}`, 'error'));
}

// ===== SERVICES =====
function renderServices() {
  const tbody = document.getElementById('services-tbody');
  if (!DB.services.length) { tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--text-faint)">Nenhum serviÃ§o cadastrado</td></tr>`; return; }
  tbody.innerHTML = DB.services.map(s => {
    const barberNames = (s.barbers||[]).map(bid=>{const b=DB.barbers.find(b=>b.id===bid);return b?b.nick:'?';}).join(', ');
    return `<tr>
      <td><strong>${s.name}</strong><br><small style="color:var(--text-faint)">${s.desc||''}</small></td>
      <td>${s.duration}min</td>
      <td>R$ ${s.price}</td>
      <td><span style="font-size:.78rem;color:var(--text-dim)">${barberNames||'Todos'}</span></td>
      <td>
        <button class="btn-sm" onclick="openServiceModal('${s.id}')">Editar</button>
        <button class="btn-sm" style="border-color:var(--primary);color:var(--primary);margin-left:4px" onclick="deleteService('${s.id}')">Remover</button>
      </td>
    </tr>`;
  }).join('');
}

function openServiceModal(id=null) {
  DB.editingService = id;
  const s = id ? DB.services.find(s=>s.id===id) : null;
  document.getElementById('service-modal-title').textContent = s ? 'Editar ServiÃ§o' : 'Novo ServiÃ§o';
  document.getElementById('svc-barbers-check').innerHTML = DB.barbers.map(b=>`<label><input type="checkbox" value="${b.id}" ${!s||(s.barbers&&s.barbers.includes(b.id))?'checked':''}>${b.nick}</label>`).join('');
  if (s) {
    document.getElementById('svc-name').value = s.name;
    document.getElementById('svc-duration').value = s.duration;
    document.getElementById('svc-price').value = s.price;
    document.getElementById('svc-desc').value = s.desc||'';
  } else {
    document.getElementById('svc-name').value = '';
    document.getElementById('svc-duration').value = 30;
    document.getElementById('svc-price').value = 45;
    document.getElementById('svc-desc').value = '';
  }
  openModal('modal-service');
}

function saveService() {
  const name = document.getElementById('svc-name').value.trim();
  if (!name) return toast('Nome do serviÃ§o Ã© obrigatÃ³rio', 'error');
  const barbers = [...document.querySelectorAll('#svc-barbers-check input:checked')].map(c=>c.value);
  const data = {
    name,
    duration: parseInt(document.getElementById('svc-duration').value)||30,
    price: parseFloat(document.getElementById('svc-price').value)||45,
    desc: document.getElementById('svc-desc').value.trim(),
    barbers
  };
  
  if (DB.editingService) {
    apiUpdateService(DB.editingService, data).then(() => {
      const idx = DB.services.findIndex(s=>s.id===DB.editingService);
      DB.services[idx] = { ...DB.services[idx], ...data };
      toast('âœ“ ServiÃ§o atualizado!', 'success');
      closeModal('modal-service');
      renderServices();
    }).catch(err => toast(`âœ— Erro: ${err.message}`, 'error'));
  } else {
    apiCreateService(data).then(newService => {
      DB.services.push(newService);
      toast('âœ“ ServiÃ§o adicionado!', 'success');
      closeModal('modal-service');
      renderServices();
    }).catch(err => toast(`âœ— Erro: ${err.message}`, 'error'));
  }
}

function deleteService(id) {
  if (!confirm('Remover este serviÃ§o?')) return;
  apiDeleteService(id).then(() => {
    DB.services = DB.services.filter(s=>s.id!==id);
    renderServices();
    toast('âœ“ ServiÃ§o removido', 'success');
  }).catch(err => toast(`âœ— Erro: ${err.message}`, 'error'));
}

// ===== CLIENTS =====
function renderClients(filter='') {
  const tbody = document.getElementById('clients-tbody');
  const clients = filter ? DB.clients.filter(c=>c.name.toLowerCase().includes(filter)||c.phone.includes(filter)||c.email.toLowerCase().includes(filter)) : DB.clients;
  if (!clients.length) { tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-faint)">Nenhum cliente encontrado</td></tr>`; return; }
  tbody.innerHTML = clients.map(c => {
    const apts = DB.appointments.filter(a=>a.client===c.name && a.status!=='cancelled');
    const lastApt = apts.sort((a,b)=>b.date.localeCompare(a.date))[0];
    const total = apts.filter(a=>a.status==='done').reduce((s,a)=>{const svc=DB.services.find(sv=>sv.id===a.service);return s+(svc?svc.price:0);},0);
    const since = lastApt ? new Date(lastApt.date).toLocaleDateString('pt-BR') : 'â€”';
    return `<tr>
      <td><div style="display:flex;align-items:center;gap:.6rem"><div style="width:28px;height:28px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;font-size:.62rem;font-weight:700;color:white;flex-shrink:0">${initials(c.name)}</div><strong>${c.name}</strong></div></td>
      <td>${c.phone}</td>
      <td>${since}</td>
      <td>${apts.length}</td>
      <td>R$ ${total}</td>
      <td><button class="btn-sm" onclick="viewClient('${c.id}')">Ver</button></td>
    </tr>`;
  }).join('');
}

function filterClients() { renderClients(document.getElementById('client-search').value.toLowerCase()); }

function viewClient(id) {
  const c = DB.clients.find(c=>c.id===id);
  if (!c) return;
  DB.selectedClient = c;
  const apts = DB.appointments.filter(a=>a.client===c.name&&a.status!=='cancelled');
  const total = apts.filter(a=>a.status==='done').reduce((s,a)=>{const svc=DB.services.find(sv=>sv.id===a.service);return s+(svc?svc.price:0);},0);
  document.getElementById('client-modal-body').innerHTML = `
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:.5rem">
      <div style="width:52px;height:52px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:700;color:white">${initials(c.name)}</div>
      <div><h3 style="font-size:1.1rem">${c.name}</h3><p style="color:var(--text-faint);font-size:.8rem">${c.email||'â€”'}</p></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.75rem;margin:1rem 0">
      <div class="kpi-card"><div class="kpi-body"><span class="kpi-label">Visitas</span><span class="kpi-val">${apts.length}</span></div></div>
      <div class="kpi-card"><div class="kpi-body"><span class="kpi-label">Gasto total</span><span class="kpi-val" style="font-size:1.2rem">R$${total}</span></div></div>
      <div class="kpi-card"><div class="kpi-body"><span class="kpi-label">Cliente desde</span><span class="kpi-val" style="font-size:1rem">${c.since?new Date(c.since).toLocaleDateString('pt-BR'):'â€”'}</span></div></div>
    </div>
    <h4 style="font-size:.82rem;color:var(--text-faint);margin-bottom:.5rem">HISTÃ“RICO</h4>
    ${apts.sort((a,b)=>b.date.localeCompare(a.date)).map(a=>{const svc=DB.services.find(s=>s.id===a.service);return `<div class="apt-item">${aptItemHTML(a)}</div>`}).join('')||'<p style="color:var(--text-faint);font-size:.85rem">Sem histÃ³rico</p>'}
  `;
  openModal('modal-client');
}

function openClientModal() {
  toast('Para adicionar clientes, eles se cadastram ao agendar. Ou adicione um agendamento com novo nome.', 'info');
}

function bookForClient() {
  closeModal('modal-client');
  openNewAppointment();
  if (DB.selectedClient) {
    setTimeout(()=>{
      document.getElementById('apt-client').value = DB.selectedClient.name;
      document.getElementById('apt-phone').value = DB.selectedClient.phone||'';
      document.getElementById('apt-email').value = DB.selectedClient.email||'';
    },100);
  }
}

// ===== FINANCIAL =====
function renderFinanceiro(period='week') {
  const apts = DB.appointments.filter(a=>a.status==='done');
  const revenue = apts.reduce((s,a)=>{const svc=DB.services.find(sv=>sv.id===a.service);return s+(svc?svc.price:0);},0);
  const avgTicket = apts.length ? Math.round(revenue/apts.length) : 0;
  const commission = Math.round(revenue * 0.4);

  document.getElementById('fin-kpis').innerHTML = `
    <div class="kpi-card"><div class="kpi-icon">ðŸ’°</div><div class="kpi-body"><span class="kpi-label">Faturamento total</span><span class="kpi-val">R$ ${revenue}</span><span class="kpi-change positive">â†‘ 12%</span></div></div>
    <div class="kpi-card"><div class="kpi-icon">ðŸŽ¯</div><div class="kpi-body"><span class="kpi-label">Ticket mÃ©dio</span><span class="kpi-val">R$ ${avgTicket}</span></div></div>
    <div class="kpi-card"><div class="kpi-icon">ðŸ“Š</div><div class="kpi-body"><span class="kpi-label">Atendimentos</span><span class="kpi-val">${apts.length}</span></div></div>
    <div class="kpi-card"><div class="kpi-icon">ðŸ’¸</div><div class="kpi-body"><span class="kpi-label">ComissÃµes</span><span class="kpi-val">R$ ${commission}</span></div></div>
  `;

  const barberRevenue = DB.barbers.map(b => {
    const bApts = apts.filter(a=>a.barber===b.id);
    const rev = bApts.reduce((s,a)=>{const svc=DB.services.find(sv=>sv.id===a.service);return s+(svc?svc.price:0);},0);
    return { name: b.nick, color: b.color, rev };
  }).sort((a,b)=>b.rev-a.rev);
  const maxRev = Math.max(...barberRevenue.map(b=>b.rev),1);
  document.getElementById('fin-barber-chart').innerHTML = barberRevenue.map(b=>`
    <div class="fin-bar-item">
      <div class="fin-bar-name">${b.name}</div>
      <div class="fin-bar-track"><div class="fin-bar-fill" style="width:${(b.rev/maxRev)*100}%;background:${b.color}"></div></div>
      <div class="fin-bar-val">R$ ${b.rev}</div>
    </div>`).join('');

  const svcRevenue = DB.services.map(s => {
    const sApts = apts.filter(a=>a.service===s.id);
    return { name: s.name, count: sApts.length, rev: sApts.length * s.price };
  }).sort((a,b)=>b.count-a.count);
  const maxCount = Math.max(...svcRevenue.map(s=>s.count),1);
  document.getElementById('fin-services-chart').innerHTML = svcRevenue.map(s=>`
    <div class="fin-bar-item">
      <div class="fin-bar-name">${s.name}</div>
      <div class="fin-bar-track"><div class="fin-bar-fill" style="width:${(s.count/maxCount)*100}%"></div></div>
      <div class="fin-bar-val">${s.count}x</div>
    </div>`).join('');

  document.getElementById('fin-transactions').innerHTML = apts.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,20).map(a=>{
    const svc=DB.services.find(s=>s.id===a.service);
    const b=DB.barbers.find(b=>b.id===a.barber);
    return `<tr>
      <td>${new Date(a.date).toLocaleDateString('pt-BR')}</td>
      <td>${a.client}</td>
      <td>${svc?svc.name:'â€”'}</td>
      <td>${b?b.nick:'â€”'}</td>
      <td><strong style="color:var(--success)">R$ ${svc?svc.price:0}</strong></td>
      <td><span class="apt-status status-done">ConcluÃ­do</span></td>
    </tr>`;
  }).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--text-faint);padding:2rem">Sem transaÃ§Ãµes</td></tr>';
}

function setPeriod(p, btn) {
  document.querySelectorAll('.period-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderFinanceiro(p);
}

// ===== APPOINTMENT MODAL =====
function openNewAppointment() {
  DB.editingAppointment = null;
  document.getElementById('apt-modal-title').textContent = 'Novo Agendamento';
  document.getElementById('apt-client').value = '';
  document.getElementById('apt-phone').value = '';
  document.getElementById('apt-email').value = '';
  document.getElementById('apt-obs').value = '';
  document.getElementById('apt-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('apt-time').value = '10:00';

  refreshBarberSelects();
  populateClientDatalist();
  updateAptPreview();
  openModal('modal-appointment');
}

function editAppointment(id) {
  const a = DB.appointments.find(a=>a.id===id);
  if (!a) return;
  DB.editingAppointment = id;
  document.getElementById('apt-modal-title').textContent = 'Editar Agendamento';
  document.getElementById('apt-client').value = a.client;
  document.getElementById('apt-phone').value = a.phone||'';
  document.getElementById('apt-email').value = a.email||'';
  document.getElementById('apt-obs').value = a.obs||'';
  document.getElementById('apt-date').value = a.date;
  document.getElementById('apt-time').value = a.time;

  refreshBarberSelects();
  setTimeout(()=>{
    document.getElementById('apt-service').value = a.service;
    document.getElementById('apt-barber').value = a.barber;
    updateAptPreview();
  },50);
  openModal('modal-appointment');
}

function refreshBarberSelects() {
  const svcSel = document.getElementById('apt-service');
  const barberSel = document.getElementById('apt-barber');
  svcSel.innerHTML = DB.services.map(s=>`<option value="${s.id}">${s.name} Â· ${s.duration}min Â· R$${s.price}</option>`).join('');
  barberSel.innerHTML = `<option value="">Qualquer disponÃ­vel</option>` + DB.barbers.map(b=>`<option value="${b.id}">${b.nick}</option>`).join('');
}

function populateClientDatalist() {
  document.getElementById('client-datalist').innerHTML = DB.clients.map(c=>`<option value="${c.name}">`).join('');
}

function updateAptDuration() { updateAptPreview(); }
function updateAptPreview() {
  const svcId = document.getElementById('apt-service').value;
  const svc = DB.services.find(s=>s.id===svcId);
  const barberVal = document.getElementById('apt-barber').value;
  const barber = DB.barbers.find(b=>b.id===barberVal);
  const time = document.getElementById('apt-time').value;
  if (svc) {
    document.getElementById('apt-preview').textContent = `${svc.name} Â· ${svc.duration}min Â· R$ ${svc.price}${barber?' Â· '+barber.nick:''}${time?' Ã s '+time:''}`;
  }
}

function deleteAppointment(id) {
  if (!confirm('Cancelar este agendamento?')) return;
  apiDeleteAppointment(id).then(() => {
    DB.appointments = DB.appointments.filter(a=>a.id!==id);
    renderAgenda();
    renderDashboard();
    toast('âœ“ Agendamento cancelado', 'success');
  }).catch(err => toast(`âœ— Erro: ${err.message}`, 'error'));
}

function changeAppointmentStatus(id, newStatus) {
  apiChangeAppointmentStatus(id, newStatus).then(() => {
    const apt = DB.appointments.find(a=>a.id===id);
    if (apt) apt.status = newStatus;
    renderAgenda();
    renderDashboard();
    toast('âœ“ Status atualizado', 'success');
  }).catch(err => toast(`âœ— Erro: ${err.message}`, 'error'));
}

function saveAppointment() {
  const client = document.getElementById('apt-client').value.trim();
  const date = document.getElementById('apt-date').value;
  const time = document.getElementById('apt-time').value;
  const service = document.getElementById('apt-service').value;
  if (!client || !date || !time || !service) return toast('Preencha todos os campos obrigatÃ³rios', 'error');

  const barber = document.getElementById('apt-barber').value || (DB.barbers[0]&&DB.barbers[0].id) || '';

  if (barber) {
    const conflict = DB.appointments.find(a=>a.barber===barber&&a.date===date&&a.time===time&&a.status!=='cancelled'&&a.id!==DB.editingAppointment);
    if (conflict) return toast(`âš  HorÃ¡rio jÃ¡ ocupado para este barbeiro`, 'error');
  }

  const data = {
    client, date, time, service, barber,
    phone: document.getElementById('apt-phone').value,
    email: document.getElementById('apt-email').value,
    obs: document.getElementById('apt-obs').value,
    status: 'confirmed'
  };

  if (DB.editingAppointment) {
    apiUpdateAppointment(DB.editingAppointment, data).then(() => {
      const idx = DB.appointments.findIndex(a=>a.id===DB.editingAppointment);
      DB.appointments[idx] = { ...DB.appointments[idx], ...data };
      toast('âœ“ Agendamento atualizado!', 'success');
      closeModal('modal-appointment');
      renderAgenda();
      renderDashboard();
    }).catch(err => toast(`âœ— Erro: ${err.message}`, 'error'));
  } else {
    apiCreateAppointment(data).then(newApt => {
      DB.appointments.push(newApt);
      toast('âœ“ Agendamento criado!', 'success');
      closeModal('modal-appointment');
      renderAgenda();
      renderDashboard();
    }).catch(err => toast(`âœ— Erro: ${err.message}`, 'error'));
  }
}

// ===== SETTINGS =====
function buildHoursConfig() {
  const days = ['Dom','Seg','Ter','Qua','Qui','Sex','SÃ¡b'];
  document.getElementById('hours-config').innerHTML = [0,1,2,3,4,5,6].map(d=>{
    const h = DB.hours[d];
    return `<div class="hour-row">
      <span class="hour-day">${days[d]}</span>
      <label class="hour-closed"><input type="checkbox" id="hopen-${d}" ${h.open?'checked':''} onchange="DB.hours[${d}].open=this.checked"> Aberto</label>
      <input type="time" id="hstart-${d}" value="${h.start}" onchange="DB.hours[${d}].start=this.value" style="width:100px" ${h.open?'':'disabled'}>
      <span style="color:var(--text-faint);font-size:.8rem">atÃ©</span>
      <input type="time" id="hend-${d}" value="${h.end}" onchange="DB.hours[${d}].end=this.value" style="width:100px" ${h.open?'':'disabled'}>
    </div>`;
  }).join('');
  [0,1,2,3,4,5,6].forEach(d=>{
    const cb = document.getElementById(`hopen-${d}`);
    if (cb) cb.addEventListener('change', ()=>{
      document.getElementById(`hstart-${d}`).disabled = !cb.checked;
      document.getElementById(`hend-${d}`).disabled = !cb.checked;
    });
  });
}

function saveConfig() {
  DB.shop.name = document.getElementById('cfg-name').value.trim() || DB.shop.name;
  DB.shop.slug = document.getElementById('cfg-slug').value.trim().toLowerCase().replace(/\s+/g,'-') || DB.shop.slug;
  document.getElementById('sb-shop-name').textContent = DB.shop.name;
  document.getElementById('shop-link').textContent = `barberos.app/${DB.shop.slug}`;
  document.getElementById('bp-shop-name').textContent = DB.shop.name;
  toast('Dados salvos com sucesso!', 'success');
}
function saveHours() { toast('HorÃ¡rios salvos!', 'success'); }
function saveNotifs() { toast('PreferÃªncias de notificaÃ§Ã£o salvas!', 'success'); }
function changePassword() {
  const np = document.getElementById('cfg-newpass').value;
  const cp = document.getElementById('cfg-confirmpass').value;
  if (!np) return toast('Digite a nova senha', 'error');
  if (np !== cp) return toast('As senhas nÃ£o coincidem', 'error');
  if (np.length < 8) return toast('Senha deve ter ao menos 8 caracteres', 'error');
  toast('Senha alterada com sucesso!', 'success');
  document.getElementById('cfg-newpass').value='';
  document.getElementById('cfg-confirmpass').value='';
}

function copyLink() {
  navigator.clipboard.writeText(`https://barberos.app/${DB.shop.slug}`).catch(()=>{});
  toast('Link copiado!', 'success');
}

// ===== IDENTITY =====
function applyBrandColors() {
  const primary = document.getElementById('color-primary').value;
  const bg = document.getElementById('color-bg').value;
  const text = document.getElementById('color-text').value;
  const card = document.getElementById('color-card').value;
  document.getElementById('color-primary-val').textContent = primary;
  document.getElementById('color-bg-val').textContent = bg;
  document.getElementById('color-text-val').textContent = text;
  document.getElementById('color-card-val').textContent = card;
  DB.identity = { ...DB.identity, primary, bg, text, card };
  const preview = document.getElementById('booking-preview');
  preview.style.background = bg;
  preview.style.color = text;
  preview.querySelectorAll('.bp-svc.active, .bp-barber.active').forEach(el=>{ el.style.borderColor=primary; el.style.color=primary; });
  preview.querySelectorAll('.bp-logo-area').forEach(el=>el.style.background=primary);
  document.getElementById('bp-shop-name').style.color = text;
}

const themes = {
  'dark-red':   { primary:'#C0392B', bg:'#0D0D0D', text:'#F5F2ED', card:'#161616' },
  'navy-gold':  { primary:'#C9A84C', bg:'#0A1628', text:'#F5F2ED', card:'#11213A' },
  'forest':     { primary:'#2E7D32', bg:'#0F1F0F', text:'#E8F5E9', card:'#162316' },
  'cream':      { primary:'#2C2C2C', bg:'#F7F3EE', text:'#1A1A1A', card:'#EDEDE6' },
  'slate':      { primary:'#64B5F6', bg:'#1E2A3A', text:'#E3F2FD', card:'#243444' },
};

function applyPreset(name) {
  const t = themes[name]; if (!t) return;
  document.getElementById('color-primary').value = t.primary;
  document.getElementById('color-bg').value = t.bg;
  document.getElementById('color-text').value = t.text;
  document.getElementById('color-card').value = t.card;
  applyBrandColors();
}

function applyFont() {
  DB.identity.fontDisplay = document.getElementById('font-display').value;
  document.getElementById('bp-shop-name').style.fontFamily = DB.identity.fontDisplay;
}

function previewLogo(e) {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    document.getElementById('logo-preview-wrap').innerHTML = `<img src="${ev.target.result}" style="max-height:80px;max-width:200px;border-radius:8px">`;
    document.getElementById('bp-logo-area').innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:contain;border-radius:8px">`;
  };
  reader.readAsDataURL(file);
}

function saveIdentity() {
  DB.identity.welcome = document.getElementById('cfg-welcome').value || DB.identity.welcome;
  document.getElementById('bk-shop-sub').textContent = DB.identity.welcome;
  applyThemeToBooking();
  toast('Identidade visual salva e publicada!', 'success');
}

function applyThemeToBooking() {
  const r = document.documentElement;
  r.style.setProperty('--primary', DB.identity.primary);
  r.style.setProperty('--primary-d', darken(DB.identity.primary));
  r.style.setProperty('--primary-light', DB.identity.primary+'22');
  const bs = document.getElementById('client-screen');
  if (bs) bs.style.background = DB.identity.bg;
}

function darken(hex) {
  let r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  r=Math.max(0,r-30); g=Math.max(0,g-30); b=Math.max(0,b-30);
  return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
}

// ===== CLIENT BOOKING =====
let currentStep = 1;

function initBooking() {
  currentStep = 1;
  DB.booking = { service: null, barber: null, date: null, time: null };
  renderBkServices();
  renderBkBarbers();
  renderBkCalendar();
  goStep(1);
}

function renderBkServices() {
  document.getElementById('bk-services-list').innerHTML = DB.services.map(s=>`
    <div class="bk-svc-card" onclick="selectService('${s.id}',this)" data-id="${s.id}">
      <div class="bk-svc-info">
        <div class="bk-svc-name">${s.name}</div>
        <div class="bk-svc-meta">â± ${s.duration} min${s.desc?' Â· '+s.desc:''}</div>
      </div>
      <div class="bk-svc-price">R$${s.price}</div>
      <div class="bk-svc-check">âœ“</div>
    </div>`).join('') || '<p style="color:var(--text-faint)">Nenhum serviÃ§o disponÃ­vel</p>';
}

function selectService(id, el) {
  DB.booking.service = id;
  document.querySelectorAll('.bk-svc-card').forEach(c=>c.classList.remove('selected'));
  el.classList.add('selected');
  DB.booking.barber = null;
  renderBkBarbers();
}

function renderBkBarbers() {
  const svcId = DB.booking.service;
  const eligible = svcId ? DB.barbers.filter(b=>{ const svc=DB.services.find(s=>s.id===svcId); return !svc||!svc.barbers||svc.barbers.includes(b.id); }) : DB.barbers;
  document.getElementById('bk-barbers-list').innerHTML =
    `<div class="bk-any-card ${DB.booking.barber===null?'selected':''}" onclick="selectBarber(null,this)">
      <div class="bk-any-icon">ðŸŽ²</div>
      <div class="bk-barber-name">Qualquer barbeiro</div>
      <div class="bk-barber-spec">Primeiro disponÃ­vel</div>
    </div>` +
    eligible.map(b=>`
      <div class="bk-barber-card ${DB.booking.barber===b.id?'selected':''}" onclick="selectBarber('${b.id}',this)" data-id="${b.id}">
