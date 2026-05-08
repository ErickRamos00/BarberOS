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
    fontDisplay: "'Bebas Neue'", welcome: 'Reserve seu horário'
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
  bookingCalendar: { year: new Date().getFullYear(), month: new Date().getMonth() },
  isPublic: false
};

// ===== SEED DATA =====
function seedData() {
  DB.barbers = [
    { id: 'b1', name: 'Lucas Ferreira', nick: 'Lucas F.', phone: '(51) 99111-2233', email: 'lucas@barber.com', color: '#C0392B', commission: 40, days: [1,2,3,4,5,6], start: '09:00', end: '19:00', specialties: ['Degradê', 'Navalhado', 'Barba'] },
    { id: 'b2', name: 'Rafael Matos', nick: 'Rafael M.', phone: '(51) 99444-5566', email: 'rafael@barber.com', color: '#2980B9', commission: 40, days: [1,2,3,4,5,6], start: '10:00', end: '20:00', specialties: ['Corte Social', 'Tesoura', 'Pigmentação'] },
    { id: 'b3', name: 'Diego Costa', nick: 'Diego C.', phone: '(51) 99777-8899', email: 'diego@barber.com', color: '#27AE60', commission: 35, days: [2,3,4,5,6], start: '09:00', end: '18:00', specialties: ['Kids', 'Barba', 'Sobrancelha'] },
  ];
  DB.services = [
    { id: 's1', name: 'Corte Simples', duration: 30, price: 45, desc: 'Corte tradicional na tesoura ou máquina', barbers: ['b1','b2','b3'] },
    { id: 's2', name: 'Degradê / Fade', duration: 40, price: 55, desc: 'Degradê com acabamento perfeito', barbers: ['b1','b2'] },
    { id: 's3', name: 'Barba', duration: 25, price: 35, desc: 'Modelagem de barba com navalha e toalha quente', barbers: ['b1','b3'] },
    { id: 's4', name: 'Corte + Barba', duration: 55, price: 75, desc: 'Combo completo corte e barba', barbers: ['b1'] },
    { id: 's5', name: 'Pigmentação', duration: 30, price: 40, desc: 'Pigmentação para disfarçar falhas', barbers: ['b2'] },
    { id: 's6', name: 'Corte Kids', duration: 30, price: 38, desc: 'Corte para crianças até 10 anos', barbers: ['b3'] },
  ];
  const today = new Date();
  const fmt = d => d.toISOString().split('T')[0];
  const yesterday = new Date(today); yesterday.setDate(today.getDate()-1);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);

  DB.appointments = [
    { id: 'a1', client: 'Marcos Silva', phone: '(51) 99001-1111', email: 'marcos@email.com', service: 's1', barber: 'b1', date: fmt(today), time: '09:00', status: 'done', obs: '' },
    { id: 'a2', client: 'João Felipe', phone: '(51) 99002-2222', email: 'joao@email.com', service: 's2', barber: 'b2', date: fmt(today), time: '10:00', status: 'confirmed', obs: 'Degradê bem baixo' },
    { id: 'a3', client: 'Pedro Oliveira', phone: '(51) 99003-3333', email: 'pedro@email.com', service: 's3', barber: 'b1', date: fmt(today), time: '11:30', status: 'confirmed', obs: '' },
    { id: 'a4', client: 'Ricardo Costa', phone: '(51) 99004-4444', email: 'ricardo@email.com', service: 's4', barber: 'b2', date: fmt(today), time: '14:00', status: 'pending', obs: '' },
    { id: 'a5', client: 'André Lima', phone: '(51) 99005-5555', email: 'andre@email.com', service: 's1', barber: 'b3', date: fmt(today), time: '15:00', status: 'confirmed', obs: '' },
    { id: 'a6', client: 'Bruno Souza', phone: '(51) 99006-6666', email: 'bruno@email.com', service: 's2', barber: 'b1', date: fmt(today), time: '16:30', status: 'pending', obs: '' },
    { id: 'a7', client: 'Carlos Mendes', phone: '(51) 99007-7777', email: 'carlos@email.com', service: 's5', barber: 'b2', date: fmt(yesterday), time: '10:00', status: 'done', obs: '' },
    { id: 'a8', client: 'Felipe Gomes', phone: '(51) 99008-8888', email: 'felipe@email.com', service: 's6', barber: 'b3', date: fmt(tomorrow), time: '09:00', status: 'confirmed', obs: 'Kid, 7 anos' },
  ];
  DB.clients = [
    { id: 'c1', name: 'Marcos Silva', phone: '(51) 99001-1111', email: 'marcos@email.com', since: '2024-03-10' },
    { id: 'c2', name: 'João Felipe', phone: '(51) 99002-2222', email: 'joao@email.com', since: '2024-01-22' },
    { id: 'c3', name: 'Pedro Oliveira', phone: '(51) 99003-3333', email: 'pedro@email.com', since: '2023-11-05' },
    { id: 'c4', name: 'Ricardo Costa', phone: '(51) 99004-4444', email: 'ricardo@email.com', since: '2024-05-18' },
    { id: 'c5', name: 'André Lima', phone: '(51) 99005-5555', email: 'andre@email.com', since: '2024-02-28' },
    { id: 'c6', name: 'Bruno Souza', phone: '(51) 99006-6666', email: 'bruno@email.com', since: '2024-06-01' },
  ];
}

// ===== AUTH =====
function showForm(id) {
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

async function handleLogin() {
  const email = document.getElementById('login-email').value;
  const pass = document.getElementById('login-pass').value;
  if (!email || !pass) return toast('Preencha todos os campos', 'error');
  
  try {
    const res = await apiLogin(email, pass);
    DB.user = res.user;
    DB.shop = res.shop; // Garantir que a loja venha do login
    localStorage.setItem('token', res.token);
    
    toast('✓ Bem-vindo de volta!', 'success');
    await loadUserData();
    enterOwner();
  } catch (err) {
    toast(err.message, 'error');
  }
}

async function handleBarberLogin() {
  const email = document.getElementById('barber-login-email').value;
  const code = document.getElementById('barber-login-code').value;
  
  if (!email || !code) return toast('Preencha e-mail e código', 'error');
  
  try {
    const res = await apiBarberLogin(email, code);
    DB.user = res.user;
    DB.shop = res.shop; // Garantir que a loja venha do login
    localStorage.setItem('token', res.token);
    
    toast('✓ Bem-vindo à sua agenda!', 'success');
    await loadUserData();
    enterBarber();
  } catch (err) {
    toast(err.message, 'error');
  }
}

async function loginDemo() {
  try {
    const result = await apiLogin('demo@barberos.app', 'demo123');
    DB.user = result.user || { email: 'demo@barberos.app', name: 'Demo Dono', role: 'owner' };
    DB.shop = result.shop || { name: 'Barbearia Demo', slug: 'barbearia-demo' };
    await loadUserData();
    toast('✓ Bem-vindo de volta!', 'success');
    enterOwner();
  } catch (err) {
    toast(err.message, 'error');
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

  // Para versão de demo, usar seed data
  DB.pendingEmail = email;
  DB.user = { email, name, role: 'owner' };
  DB.shop = { name: shop, slug: shop.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') };

  DB.pendingVerifyCode = Math.floor(100000 + Math.random() * 900000).toString();

  simulateSendEmail(email, 'Código de verificação BarberOS', `
    <h2>Bem-vindo ao BarberOS!</h2>
    <p>Seu código de verificação é:</p>
    <h1 style="font-size:2rem;letter-spacing:8px;color:#C0392B">${DB.pendingVerifyCode}</h1>
    <p>Este código expira em 10 minutos.</p>
  `);

  document.getElementById('verify-email-show').textContent = email;
  showForm('form-verify');
  toast(`✉ Código enviado para ${email}`, 'success');
  setTimeout(() => {
    document.getElementById('code-hint').textContent = `(Demo: código é ${DB.pendingVerifyCode})`;
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
  if (digits.length < 6) return toast('Digite os 6 dígitos', 'error');
  if (digits === DB.pendingVerifyCode) {
    seedData();
    toast('âœ“ E-mail verificado com sucesso!', 'success');
    setTimeout(enterOwner, 600);
  } else {
    toast('Código incorreto. Verifique seu e-mail.', 'error');
    document.getElementById('code-hint').textContent = `Código incorreto. (Demo: ${DB.pendingVerifyCode})`;
  }
}

function resendCode() {
  DB.pendingVerifyCode = Math.floor(100000 + Math.random() * 900000).toString();
  simulateSendEmail(DB.pendingEmail, 'Novo código de verificação', `Seu novo código: ${DB.pendingVerifyCode}`);
  toast('Novo código enviado!', 'success');
  document.getElementById('code-hint').textContent = `(Demo: novo código é ${DB.pendingVerifyCode})`;
}

function simulateSendEmail(to, subject, body) {
  console.log(`[EMAIL] Para: ${to} | Assunto: ${subject} | Corpo:`, body);
}

// Carrega todos os dados do usuÃ¡rio do banco de dados
async function loadUserData() {
  // 1. Restaurar perfil do usuário e loja (Essencial)
  const profile = await apiGetUser();
  DB.user = profile.user;
  DB.shop = profile.shop;

  if (!DB.user || !DB.shop) {
    throw new Error('Sessão inválida ou dados da barbearia não encontrados');
  }

  // 2. Carregar barbeiros
  try { DB.barbers = await apiGetBarbers(); } catch (e) { console.warn('Barbers load error:', e); DB.barbers = []; }
  
  // 3. Carregar serviços
  try { DB.services = await apiGetServices(); } catch (e) { console.warn('Services load error:', e); DB.services = []; }
  
  // 4. Carregar clientes
  try { DB.clients = await apiGetClients(); } catch (e) { console.warn('Clients load error:', e); DB.clients = []; }
  
  // 5. Carregar agendamentos
  try { DB.appointments = await apiGetAppointments(); } catch (e) { console.warn('Appointments load error:', e); DB.appointments = []; }
  
  // 6. Carregar configurações e Identidade
  try {
    const cfg = await apiGetConfig();
    const idtf = await apiGetIdentity();
    if (idtf) DB.identity = { ...DB.identity, ...idtf };
    
    // Normalizar horários (merge com default)
    const defaultHours = {
      0: { open: false, start: '09:00', end: '19:00' },
      1: { open: true,  start: '09:00', end: '19:00' },
      2: { open: true,  start: '09:00', end: '19:00' },
      3: { open: true,  start: '09:00', end: '19:00' },
      4: { open: true,  start: '09:00', end: '19:00' },
      5: { open: true,  start: '09:00', end: '19:00' },
      6: { open: true,  start: '09:00', end: '17:00' },
    };
    DB.hours = cfg.hours_config ? { ...defaultHours, ...cfg.hours_config } : defaultHours;

    // APLICAR VISUAL IMEDIATAMENTE (LOGO E CORES)
    applyIdentity();
  } catch (e) {
    console.warn('Config/Identity load error:', e);
  }
}

function enterBarber() {
  if (!DB.user || !DB.shop) {
    console.warn('Dados faltando no enterBarber');
    return;
  }
  document.body.classList.add('role-barber');
  // Esconder itens administrativos para o barbeiro
  const hideItems = ['barbeiros', 'servicos', 'financeiro', 'identidade', 'configuracoes'];
  document.querySelectorAll('.sb-item').forEach(el => {
    if (hideItems.includes(el.getAttribute('data-page'))) {
      el.style.display = 'none';
    } else {
      el.style.display = 'flex';
    }
  });
  
  showScreen('owner-screen');
  nav('agenda');
  
  // Atualizar avatar e info
  const name = DB.user.name || 'Barbeiro';
  const initialsText = name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const avatarEl = document.getElementById('owner-avatar');
  if (avatarEl) avatarEl.textContent = initialsText;
  
  const shopNameEl = document.getElementById('sb-shop-name');
  if (shopNameEl) shopNameEl.textContent = DB.shop.name || 'BarberOS';
}

function enterOwner() {
  if (!DB.user || !DB.shop) {
    console.warn('Dados de usuário/loja faltando no enterOwner');
    return;
  }
  showScreen('owner-screen');
  updateShopLink();
  applyIdentity();
  const name = DB.user.name || 'Dono';
  const initialsText = name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const avatarEl = document.getElementById('owner-avatar');
  if (avatarEl) avatarEl.textContent = initialsText;
  
  const shopNameEl = document.getElementById('sb-shop-name');
  if (shopNameEl) shopNameEl.textContent = DB.shop.name || 'BarberOS';
  
  if (DB.shop.slug) {
    const linkEl = document.getElementById('shop-link');
    if (linkEl) linkEl.textContent = `${window.location.hostname}/s/${DB.shop.slug}`;
  }
  
  if (document.getElementById('cfg-name')) document.getElementById('cfg-name').value = DB.shop.name || '';
  if (document.getElementById('cfg-slug')) document.getElementById('cfg-slug').value = DB.shop.slug || '';
  if (document.getElementById('cfg-email')) document.getElementById('cfg-email').value = DB.user.email || '';
  
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
  localStorage.removeItem('token');
  DB.user = null; 
  DB.shop = null;
  // Recarregar para garantir limpeza total do estado
  window.location.href = '/';
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
  const titles = { dashboard:'Dashboard', agenda:'Agenda', barbeiros:'Barbeiros', servicos:'Serviços', clientes:'Clientes', financeiro:'Financeiro', configuracoes:'Configurações', identidade:'Identidade Visual' };
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
  const days = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
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

  if (!barbers.length) { view.innerHTML = '<div class="empty-state"><div class="empty-state-icon">✂</div><p>Nenhum barbeiro cadastrado</p></div>'; return; }

  view.innerHTML = barbers.map(b => {
    const bApts = apts.filter(a=>a.barber===b.id).sort((a,c)=>a.time.localeCompare(c.time));
    const slots = bApts.length ? bApts.map(a => {
      const svc = DB.services.find(s=>s.id===a.service);
      return `<div class="time-block" style="border-left-color:${b.color}" onclick="editAppointment('${a.id}')">
        <div class="tb-time">${a.time} - ${svc?svc.duration:30}min</div>
        <div class="tb-client">${a.client}</div>
        <div class="tb-service">${svc?svc.name:'Serviço'}</div>
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
  if (!DB.barbers.length) { grid.innerHTML = `<div class="empty-state"><div class="empty-state-icon">✂</div><p>Nenhum barbeiro cadastrado ainda. Adicione o primeiro!</p></div>`; return; }
  const today = new Date().toISOString().split('T')[0];
  grid.innerHTML = DB.barbers.map(b => {
    const apts = DB.appointments.filter(a=>a.barber===b.id && a.status==='done');
    const revenue = apts.reduce((s,a)=>{const svc=DB.services.find(sv=>sv.id===a.service);return s+(svc?svc.price:0);},0);
    const todayApts = DB.appointments.filter(a=>a.barber===b.id&&a.date===today&&a.status!=='cancelled').length;
    return `<div class="barber-card">
      <div class="bc-top">
        <div class="bc-av" style="background:${b.color}">${initials(b.name)}</div>
        <div class="bc-info"><div class="bc-name">${b.name}</div><div class="bc-role">${b.commission}% comissão</div></div>
      </div>
      <div class="bc-stats">
        <div class="bc-stat"><span class="bc-stat-val">${todayApts}</span><span class="bc-stat-label">Hoje</span></div>
        <div class="bc-stat"><span class="bc-stat-val">${apts.length}</span><span class="bc-stat-label">Total</span></div>
        <div class="bc-stat"><span class="bc-stat-val">R$${revenue}</span><span class="bc-stat-label">Receita</span></div>
      </div>
      <div class="bc-tags">${(b.specialties||[]).map(s=>`<span class="bc-tag">${s}</span>`).join('')}</div>
      <div class="bc-actions">
        <button class="btn-sm" onclick="openBarberModal('${b.id}')">✎ Editar</button>
        <button class="btn-sm" onclick="copyBarberLink('${b.id}')">🔗 Link Próprio</button>
        <button class="btn-sm" style="border-color:var(--primary);color:var(--primary)" onclick="deleteBarber('${b.id}')">Remover</button>
      </div>
    </div>`;
  }).join('');
}

function copyBarberLink(id) {
  if (!DB.shop || !DB.shop.slug) return toast('Erro: Barbearia não identificada', 'error');
  const b = DB.barbers.find(x => String(x.id) === String(id));
  if (!b) return toast('Barbeiro não encontrado', 'error');
  const barberId = b.slug || b.id;
  const url = `${window.location.origin}/s/${DB.shop.slug}?barber=${barberId}`;
  navigator.clipboard.writeText(url).then(() => {
    toast('✓ Link do barbeiro ' + (b.nick || b.name) + ' copiado!', 'success');
  });
}

function openBarberModal(id=null) {
  DB.editingBarber = id;
  const b = id ? DB.barbers.find(b=>String(b.id)===String(id)) : null;
  document.getElementById('barber-modal-title').textContent = b ? 'Editar Barbeiro' : 'Novo Barbeiro';

  // Usar serviços reais do banco de dados em vez de lista fixa
  const specsArea = document.getElementById('specialty-checks');
  if (DB.services && DB.services.length > 0) {
    specsArea.innerHTML = DB.services.map(s => `
      <label>
        <input type="checkbox" value="${s.id}" ${b && b.specialties && b.specialties.map(String).includes(String(s.id)) ? 'checked' : ''}>
        ${s.name}
      </label>
    `).join('');
  } else {
    specsArea.innerHTML = '<p style="color:var(--text-dim);font-size:12px;grid-column:1/-1">Nenhum serviço cadastrado. Cadastre serviços para vincular ao barbeiro.</p>';
  }

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
  if (!name) return toast('Nome é obrigatório', 'error');
  const nick = document.getElementById('barber-nick').value.trim() || name.split(' ')[0];
  const days = [...document.querySelectorAll('#barber-days input:checked')].map(c=>parseInt(c.value));
  // Agora pega os IDs dos serviços
  const specialties = [...document.querySelectorAll('#specialty-checks input:checked')].map(c=>parseInt(c.value));
  const slug = (nick || name).toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  const data = {
    name, nick, slug,
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
      const idx = DB.barbers.findIndex(b=>String(b.id)===String(DB.editingBarber));
      DB.barbers[idx] = { ...DB.barbers[idx], ...data };
      toast('✓ Barbeiro atualizado!', 'success');
      closeModal('modal-barber');
      renderBarbers();
      refreshBarberSelects();
    }).catch(err => toast(`✗ Erro: ${err.message}`, 'error'));
  } else {
    // CRIAR no backend
    apiCreateBarber(data).then(newBarber => {
      DB.barbers.push(newBarber);
      const msg = data.email ? '✓ Barbeiro adicionado! Código enviado por e-mail.' : '✓ Barbeiro adicionado!';
      toast(msg, 'success');
      closeModal('modal-barber');
      renderBarbers();
      refreshBarberSelects();
    }).catch(err => toast(`✗ Erro: ${err.message}`, 'error'));
  }
}

function deleteBarber(id) {
  if (!confirm('Remover este barbeiro?')) return;
  apiDeleteBarber(id).then(() => {
    DB.barbers = DB.barbers.filter(b=>String(b.id)!==String(id));
    renderBarbers();
    toast('✓ Barbeiro removido', 'success');
  }).catch(err => toast(`✗ Erro: ${err.message}`, 'error'));
}

// ===== SERVICES =====
function renderServices() {
  const tbody = document.getElementById('services-tbody');
  if (!DB.services.length) { tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--text-faint)">Nenhum serviço cadastrado</td></tr>`; return; }
  tbody.innerHTML = DB.services.map(s => {
    const barberNames = (s.barbers||[]).map(bid=>{const b=DB.barbers.find(b=>String(b.id)===String(bid));return b?b.nick:'?';}).join(', ');
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
  const s = id ? DB.services.find(s=>String(s.id)===String(id)) : null;
  document.getElementById('service-modal-title').textContent = s ? 'Editar Serviço' : 'Novo Serviço';
  document.getElementById('svc-barbers-check').innerHTML = DB.barbers.map(b=>`<label><input type="checkbox" value="${b.id}" ${!s||(s.barbers&&s.barbers.map(String).includes(String(b.id)))?'checked':''}>${b.nick}</label>`).join('');
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
  if (!name) return toast('Nome do serviço é obrigatório', 'error');
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
      const idx = DB.services.findIndex(s=>String(s.id)===String(DB.editingService));
      DB.services[idx] = { ...DB.services[idx], ...data };
      toast('✓ Serviço atualizado!', 'success');
      closeModal('modal-service');
      renderServices();
    }).catch(err => toast(`✗ Erro: ${err.message}`, 'error'));
  } else {
    apiCreateService(data).then(newService => {
      DB.services.push(newService);
      toast('✓ Serviço adicionado!', 'success');
      closeModal('modal-service');
      renderServices();
    }).catch(err => toast(`✗ Erro: ${err.message}`, 'error'));
  }
}

function deleteService(id) {
  if (!confirm('Remover este serviço?')) return;
  apiDeleteService(id).then(() => {
    DB.services = DB.services.filter(s=>String(s.id)!==String(id));
    renderServices();
    toast('✓ Serviço removido', 'success');
  }).catch(err => toast(`✗ Erro: ${err.message}`, 'error'));
}

// ===== CLIENTS =====
function renderClients(filter='') {
  const tbody = document.getElementById('clients-tbody');
  const clients = filter ? DB.clients.filter(c=>c.name.toLowerCase().includes(filter)||c.phone.includes(filter)||c.email.toLowerCase().includes(filter)) : DB.clients;
  if (!clients.length) { tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-faint)">Nenhum cliente encontrado</td></tr>`; return; }
  tbody.innerHTML = clients.map(c => {
    const apts = DB.appointments.filter(a=>a.client===c.name && a.status!=='cancelled');
    const lastApt = apts.sort((a,b)=>b.date.localeCompare(a.date))[0];
    const total = apts.filter(a=>a.status==='done').reduce((s,a)=>{const svc=DB.services.find(sv=>String(sv.id)===String(a.service));return s+(svc?svc.price:0);},0);
    const since = lastApt ? new Date(lastApt.date).toLocaleDateString('pt-BR') : '—';
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
  const c = DB.clients.find(c=>String(c.id)===String(id));
  if (!c) return;
  DB.selectedClient = c;
  const apts = DB.appointments.filter(a=>a.client===c.name&&a.status!=='cancelled');
  const total = apts.filter(a=>a.status==='done').reduce((s,a)=>{const svc=DB.services.find(sv=>String(sv.id)===String(a.service));return s+(svc?svc.price:0);},0);
  document.getElementById('client-modal-body').innerHTML = `
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:.5rem">
      <div style="width:52px;height:52px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:700;color:white">${initials(c.name)}</div>
      <div><h3 style="font-size:1.1rem">${c.name}</h3><p style="color:var(--text-faint);font-size:.8rem">${c.email||'—'}</p></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.75rem;margin:1rem 0">
      <div class="kpi-card"><div class="kpi-body"><span class="kpi-label">Visitas</span><span class="kpi-val">${apts.length}</span></div></div>
      <div class="kpi-card"><div class="kpi-body"><span class="kpi-label">Gasto total</span><span class="kpi-val" style="font-size:1.2rem">R$${total}</span></div></div>
      <div class="kpi-card"><div class="kpi-body"><span class="kpi-label">Cliente desde</span><span class="kpi-val" style="font-size:1rem">${c.since?new Date(c.since).toLocaleDateString('pt-BR'):'—'}</span></div></div>
    </div>

    <!-- AUTO-RETENTION INFO -->
    <div style="background:var(--primary-light);border:1px solid var(--primary);border-radius:var(--radius-sm);padding:1rem;margin-bottom:1rem;display:flex;flex-direction:column;gap:.75rem">
      <div style="display:flex;align-items:center;gap:.75rem">
        <div style="font-size:1.5rem">🤖</div>
        <div style="flex:1">
          <h4 style="font-size:.85rem;color:var(--primary);margin-bottom:2px">Retenção Automática Ativa</h4>
          <p style="font-size:.72rem;color:var(--text-dim)">Este cliente receberá um lembrete automático via e-mail 14 dias após cada corte finalizado.</p>
        </div>
      </div>
      <button class="btn-outline" onclick="sendManualReminder(${c.id})" style="font-size:.75rem;padding:.4rem;color:var(--text-dim);border-color:var(--border)">
        ✉️ Enviar lembrete agora (Manual)
      </button>
    </div>

    <h4 style="font-size:.82rem;color:var(--text-faint);margin-bottom:.5rem;text-transform:uppercase;letter-spacing:1px">HISTÓRICO</h4>
    <div style="max-height:200px;overflow-y:auto">
      ${apts.sort((a,b)=>b.date.localeCompare(a.date)).map(a=>{
        const svc=DB.services.find(s=>String(s.id)===String(a.service));
        return `<div class="apt-item" style="background:rgba(255,255,255,0.02);padding:.5rem;border-radius:4px;margin-bottom:.25rem;font-size:.85rem">
          <div style="display:flex;justify-content:between">
            <strong>${new Date(a.date).toLocaleDateString('pt-BR')}</strong>
            <span style="color:var(--text-faint)">${svc?svc.name:'—'}</span>
          </div>
        </div>`
      }).join('')||'<p style="color:var(--text-faint);font-size:.85rem">Sem histórico</p>'}
    </div>
  `;
  openModal('modal-client');
}

async function saveClientRecurrence(id) {
  const days = parseInt(document.getElementById('client-recurrence').value);
  const c = DB.clients.find(c=>String(c.id)===String(id));
  if (!c) return;

  try {
    const updated = await apiCall('PUT', `/clients/${id}`, { 
      name: c.name, 
      email: c.email, 
      phone: c.phone, 
      recurrence_days: days 
    });
    c.recurrence_days = days;
    toast('Recorrência atualizada com sucesso!', 'success');
  } catch (err) {
    toast('Erro ao salvar recorrência', 'error');
  }
}

async function sendManualReminder(id) {
  const c = DB.clients.find(c=>String(c.id)===String(id));
  if (!c) return;
  if (!c.email) return toast('Cliente não possui e-mail cadastrado', 'error');

  try {
    await apiCall('POST', `/clients/${id}/send-reminder`);
    toast('✓ Lembrete enviado por e-mail!', 'success');
  } catch (err) {
    toast('Erro ao enviar lembrete: ' + err.message, 'error');
  }
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
    <div class="kpi-card"><div class="kpi-icon">💰</div><div class="kpi-body"><span class="kpi-label">Faturamento total</span><span class="kpi-val">R$ ${revenue}</span></div></div>
    <div class="kpi-card"><div class="kpi-icon">🎯</div><div class="kpi-body"><span class="kpi-label">Ticket médio</span><span class="kpi-val">R$ ${avgTicket}</span></div></div>
    <div class="kpi-card"><div class="kpi-icon">📊</div><div class="kpi-body"><span class="kpi-label">Atendimentos</span><span class="kpi-val">${apts.length}</span></div></div>
    <div class="kpi-card"><div class="kpi-icon">💸</div><div class="kpi-body"><span class="kpi-label">Comissões</span><span class="kpi-val">R$ ${commission}</span></div></div>
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
  svcSel.innerHTML = DB.services.map(s=>`<option value="${s.id}">${s.name} - ${s.duration}min - R$${s.price}</option>`).join('');
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
    toast('✓ Status atualizado', 'success');
  }).catch(err => toast(`✗ Erro: ${err.message}`, 'error'));
}

function saveAppointment() {
  const client = document.getElementById('apt-client').value.trim();
  const date = document.getElementById('apt-date').value;
  const time = document.getElementById('apt-time').value;
  const service = document.getElementById('apt-service').value;
  if (!client || !date || !time || !service) return toast('Preencha todos os campos obrigatÃ³rios', 'error');

  const barber = document.getElementById('apt-barber').value || (DB.barbers[0]&&DB.barbers[0].id) || '';

  if (barber) {
    const conflict = DB.appointments.find(a=>String(a.barber)===String(barber)&&a.date===date&&a.time===time&&a.status!=='cancelled'&&String(a.id)!==String(DB.editingAppointment));
    if (conflict) return toast(`⚠ Horário já ocupado para este barbeiro`, 'error');
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
      const idx = DB.appointments.findIndex(a=>String(a.id)===String(DB.editingAppointment));
      DB.appointments[idx] = { ...DB.appointments[idx], ...data };
      toast('✓ Agendamento atualizado!', 'success');
      closeModal('modal-appointment');
      renderAgenda();
      renderDashboard();
    }).catch(err => toast(`✗ Erro: ${err.message}`, 'error'));
  } else {
    apiCreateAppointment(data).then(newApt => {
      DB.appointments.push(newApt);
      toast('✓ Agendamento criado!', 'success');
      closeModal('modal-appointment');
      renderAgenda();
      renderDashboard();
    }).catch(err => toast(`✗ Erro: ${err.message}`, 'error'));
  }
}

// ===== SETTINGS =====
function buildHoursConfig() {
  const days = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  document.getElementById('hours-config').innerHTML = [0,1,2,3,4,5,6].map(d=>{
    const h = DB.hours[d];
    return `<div class="hour-row">
      <span class="hour-day">${days[d]}</span>
      <label class="hour-closed"><input type="checkbox" id="hopen-${d}" ${h.open?'checked':''} onchange="DB.hours[${d}].open=this.checked"> Aberto</label>
      <input type="time" id="hstart-${d}" value="${h.start}" onchange="DB.hours[${d}].start=this.value" style="width:100px" ${h.open?'':'disabled'}>
      <span style="color:var(--text-faint);font-size:.8rem">até</span>
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
function saveHours() { toast('Horários salvos!', 'success'); }
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

// ===== UTILITY FUNCTIONS =====
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
  }
}

function toast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(container);
  }

  const toastEl = document.createElement('div');
  toastEl.style.cssText = `
    padding: 12px 16px;
    border-radius: 8px;
    color: white;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: slideIn 0.3s ease;
    background-color: ${type === 'success' ? '#27AE60' : type === 'error' ? '#C0392B' : type === 'warning' ? '#E67E22' : '#2980B9'};
  `;
  toastEl.textContent = message;
  container.appendChild(toastEl);

  setTimeout(() => {
    toastEl.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toastEl.remove(), 300);
  }, 3000);
}

function initials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function aptItemHTML(apt) {
  const svc = DB.services.find(s => s.id === apt.service);
  const barber = DB.barbers.find(b => b.id === apt.barber);
  const statusClass = {
    'done': 'status-done',
    'confirmed': 'status-confirmed',
    'pending': 'status-pending',
    'cancelled': 'status-cancelled'
  }[apt.status] || 'status-pending';
  
  return `
    <div style="display: grid; grid-template-columns: 1fr 2fr 1fr 1fr; gap: 1rem; align-items: center;">
      <div style="font-weight: 600;">
        <div>${apt.time}</div>
        <div style="font-size: 0.8rem; color: var(--text-faint);">${apt.date}</div>
      </div>
      <div>
        <div style="font-weight: 500;">${apt.client}</div>
        <div style="font-size: 0.85rem; color: var(--text-dim);">
          ${svc ? svc.name : '—'} ${barber ? '• ' + barber.nick : ''}
        </div>
      </div>
      <div>
        <span class="apt-status ${statusClass}">${apt.status ? apt.status.charAt(0).toUpperCase() + apt.status.slice(1) : 'pendente'}</span>
      </div>
      <div style="text-align: right;">
        <strong style="color: var(--primary);">R$ ${svc ? svc.price : 0}</strong>
      </div>
    </div>
  `;
}

// Add CSS for animations
if (!document.getElementById('toast-styles')) {
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// Modals are controlled via CSS .modal-overlay.hidden { display: none }
// No inline display manipulation needed

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
  const eligible = svcId ? DB.barbers.filter(b=>{ const svc=DB.services.find(s=>String(s.id)===String(svcId)); return !svc||!svc.barbers||svc.barbers.map(String).includes(String(b.id)); }) : DB.barbers;
  document.getElementById('bk-barbers-list').innerHTML =
    `<div class="bk-any-card ${DB.booking.barber===null?'selected':''}" onclick="selectBarber(null,this)">
      <div class="bk-any-icon">🎲</div>
      <div class="bk-barber-name">Qualquer barbeiro</div>
      <div class="bk-barber-spec">Primeiro disponível</div>
    </div>` +
    eligible.map(b=>`
      <div class="bk-barber-card ${DB.booking.barber===b.id?'selected':''}" onclick="selectBarber('${b.id}',this)" data-id="${b.id}">
        <div class="bk-barber-name">${b.name}</div>
      </div>`).join('');
}

function selectBarber(barberId, el) {
  DB.booking.barber = barberId;
  document.querySelectorAll('.bk-barber-card, .bk-any-card').forEach(c=>c.classList.remove('selected'));
  if (el) el.classList.add('selected');
}

// ===== SaaS & IDENTITY =====
async function initSaaS() {
  const path = window.location.pathname;
  if (path.includes('/s/')) {
    const slug = path.split('/s/')[1]?.split('/')[0];
    if (slug) {
      try {
        const shop = await apiGetShopPublic(slug);
        DB.shop = { id: shop.id, name: shop.name, slug: shop.slug };
        DB.identity = { ...DB.identity, ...shop.identity };
        DB.barbers = shop.barbers;
        DB.services = shop.services;
        DB.hours = shop.hours;
        DB.isPublic = true;
        
        // Pre-seleção de data via URL (Recorrência)
        const params = new URLSearchParams(window.location.search);
        const preDate = params.get('date');
        if (preDate && /^\d{4}-\d{2}-\d{2}$/.test(preDate)) {
          DB.booking.date = preDate;
          const parts = preDate.split('-').map(Number);
          DB.bookingCalendar = { year: parts[0], month: parts[1] - 1 };
        }

        const preBarber = params.get('barber');
        if (preBarber) {
          DB.booking.barber = preBarber;
        }

        applyIdentity();
        enterClient();
        return true;
      } catch (e) {
        console.error('SaaS Init Error:', e);
        toast('Barbearia não encontrada', 'error');
      }
    }
  }
  return false;
}

function applyIdentity() {
  const root = document.documentElement;
  const id = DB.identity;
  
  // Map identity fields from DB (color_*) or local (primary, bg, etc) to CSS variables
  const primary = id.color_primary || id.primary;
  const bg = id.color_bg || id.bg;
  const text = id.color_text || id.text;
  const card = id.color_card || id.card;
  const font = id.font_display || id.fontDisplay;

  if (primary) root.style.setProperty('--primary', primary);
  if (bg) root.style.setProperty('--bg', bg);
  if (text) root.style.setProperty('--text', text);
  if (card) root.style.setProperty('--card', card);
  if (font) root.style.setProperty('--font-display', font);
  
  if (DB.shop) {
    const sbShop = document.getElementById('sb-shop-name');
    if (sbShop) sbShop.textContent = DB.shop.name;
    const bkShop = document.getElementById('bk-shop-name');
    if (bkShop) bkShop.textContent = DB.shop.name;

    // Logo Dinâmico
    const logoContainer = document.getElementById('sb-logo-container');
    if (logoContainer) {
      if (id.logo_url && id.logo_url.trim() !== '') {
        logoContainer.innerHTML = `
          <img src="${id.logo_url}" 
               style="width:100%; height:100%; object-fit:contain; border-radius:6px; display:block;" 
               onerror="this.parentElement.innerHTML='✂'; this.parentElement.style.background='var(--primary)';" />
        `;
        logoContainer.style.background = 'transparent';
        logoContainer.style.padding = '0';
        logoContainer.style.overflow = 'hidden';
      } else {
        logoContainer.innerHTML = '✂';
        logoContainer.style.background = 'var(--primary)';
        logoContainer.style.padding = '';
      }
    }
  }
  
  const welcome = id.welcome_message || id.welcome;
  if (welcome) {
    const bkSub = document.getElementById('bk-shop-sub');
    if (bkSub) bkSub.textContent = welcome;
  }
}

function updateShopLink() {
  const linkEl = document.getElementById('shop-link');
  if (linkEl && DB.shop && DB.shop.slug) {
    let url = `${window.location.origin}/s/${DB.shop.slug}`;
    
    // Se for barbeiro logado, personalizar o link dele
    if (DB.user && DB.user.role === 'barber') {
      const b = DB.barbers.find(x => String(x.user_id) === String(DB.user.id) || String(x.id) === String(DB.user.barberId));
      if (b) {
        url += `?barber=${b.slug || b.id}`;
      }
    }
    
    linkEl.textContent = url.replace('http://', '').replace('https://', '');
    linkEl.setAttribute('data-url', url);
  }
}

function copyLink() {
  const linkEl = document.getElementById('shop-link');
  const url = linkEl.getAttribute('data-url') || linkEl.textContent;
  navigator.clipboard.writeText(url).then(() => {
    toast('✓ Link copiado!', 'success');
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const isSaaS = await initSaaS();
  if (isSaaS) return;

  if (typeof isAuthenticated === 'function' && isAuthenticated()) {
    try {
      // Mostrar tela de loading se preferir, ou manter a atual
      await loadUserData();
      
      if (DB.user) {
        if (DB.user.role === 'barber') {
          enterBarber();
        } else {
          enterOwner();
        }
      } else {
        // Fallback: Se carregou mas não tem usuário, algo está errado
        localStorage.removeItem('token');
        showScreen('auth-screen');
        showForm('form-login');
      }
    } catch (err) {
      console.error('Session restoration failed:', err);
      // Se for erro de autenticação (401), remover token e ir para login
      if (err.status === 401 || (err.message && err.message.includes('401'))) {
        localStorage.removeItem('token');
        showScreen('auth-screen');
        showForm('form-login');
      } else {
        // Outro erro (rede, banco), avisar mas não necessariamente expulsar se houver cache
        toast('Erro ao conectar. Tente atualizar a página.', 'error');
        showScreen('auth-screen');
        showForm('form-login');
      }
    }
  } else {
    showScreen('auth-screen');
    showForm('form-login');
  }
});


