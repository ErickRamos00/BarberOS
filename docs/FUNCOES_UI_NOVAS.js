/* ====== NOVAS FUNÇÕES DE UI ======
   
   Adicione estas funções ao public/app.js para integrar as 5 novas funcionalidades
   Use como referência - adapte conforme necessário
   
   ====================================== */

// ===== REATIVAÇÃO DE CLIENTES =====

function renderReactivation() {
  const container = document.getElementById('main-content');
  const now = new Date();
  
  container.innerHTML = `
    <div class="header-section">
      <h2>🔄 Reativar Clientes</h2>
      <button onclick="openReactivationRules()" class="btn-primary">+ Nova Regra</button>
    </div>
    
    <div class="filters-row">
      <input type="number" id="reac-days" placeholder="Dias inativo" value="30" min="1">
      <select id="reac-status">
        <option value="all">Todos</option>
        <option value="inactive">Inativos</option>
        <option value="active">Ativos</option>
      </select>
      <button onclick="loadInactiveClients()">🔍 Buscar</button>
    </div>

    <div id="inactive-list" class="table-container">
      <p style="color: var(--text-faint); text-align: center; padding: 2rem;">Carregando...</p>
    </div>
  `;
  
  loadInactiveClients();
}

async function loadInactiveClients() {
  const days = document.getElementById('reac-days').value;
  const status = document.getElementById('reac-status').value;
  const container = document.getElementById('inactive-list');
  
  try {
    const response = await apiCall('GET', '/api/reactivation?days=' + days + '&status=' + status);
    
    if (!response.clients || response.clients.length === 0) {
      container.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-faint);">Nenhum cliente encontrado</p>';
      return;
    }
    
    let html = `
      <table class="data-table">
        <thead>
          <tr>
            <th><input type="checkbox" id="sel-all" onchange="toggleSelectAll(this)"></th>
            <th>Nome</th>
            <th>Telefone</th>
            <th>Último Serviço</th>
            <th>Barbeiro</th>
            <th>Última Visita</th>
            <th>Urgência</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    response.clients.forEach(client => {
      const daysInactive = client.last_visit ? Math.floor((Date.now() - new Date(client.last_visit)) / (24 * 60 * 60 * 1000)) : 999;
      const urgency = daysInactive > days * 2 ? 'Crítica' : daysInactive > days ? 'Alta' : 'Média';
      const color = daysInactive > days * 2 ? '#e74c3c' : daysInactive > days ? '#f39c12' : '#2ecc71';
      
      html += `
        <tr style="border-left: 5px solid ${color}">
          <td><input type="checkbox" class="inactive-checkbox" value="${client.id}"></td>
          <td>${client.name}</td>
          <td>${client.phone}</td>
          <td>${client.last_service || '-'}</td>
          <td>${client.last_barber || '-'}</td>
          <td>${client.last_visit ? new Date(client.last_visit).toLocaleDateString('pt-BR') : 'Nunca'}</td>
          <td><span style="background: ${color}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem">${urgency}</span></td>
          <td>
            <button onclick="sendWhatsappToClient('${client.id}', '${client.phone}', '${client.name}')" class="btn-small" title="WhatsApp">💬</button>
          </td>
        </tr>
      `;
    });
    
    html += '</tbody></table>';
    
    // Ações em lote
    html += `
      <div style="margin-top: 1rem; display: flex; gap: 1rem;">
        <button onclick="sendBulkMessages('reactivation')" class="btn-success">📤 Enviar Para Selecionados</button>
        <button onclick="scheduleFollowUp()" class="btn-info">📅 Agendar Follow-up</button>
      </div>
    `;
    
    container.innerHTML = html;
  } catch (error) {
    container.innerHTML = '<p style="color: red;">Erro ao carregar: ' + error.message + '</p>';
  }
}

// ===== CONFIGURAÇÃO WHATSAPP =====

function renderWhatsappConfig() {
  const container = document.getElementById('main-content');
  
  container.innerHTML = `
    <div class="header-section">
      <h2>💬 Integração WhatsApp</h2>
    </div>
    
    <div class="card-container">
      <div class="config-section">
        <h3>Escolha o Provedor</h3>
        <div class="providers-grid">
          <button onclick="selectProvider('z-api')" class="provider-btn" data-provider="z-api">
            <strong>Z-API</strong><br><small>Brasileira</small>
          </button>
          <button onclick="selectProvider('evolution')" class="provider-btn" data-provider="evolution">
            <strong>Evolution API</strong><br><small>Open Source</small>
          </button>
          <button onclick="selectProvider('360dialog')" class="provider-btn" data-provider="360dialog">
            <strong>360dialog</strong><br><small>WhatsApp Business</small>
          </button>
          <button onclick="selectProvider('twilio')" class="provider-btn" data-provider="twilio">
            <strong>Twilio</strong><br><small>Global</small>
          </button>
          <button onclick="selectProvider('manual')" class="provider-btn" data-provider="manual">
            <strong>Manual</strong><br><small>WhatsApp Web</small>
          </button>
        </div>
      </div>
      
      <div class="config-section" id="provider-config-form" style="display: none;">
        <h3>Configuração</h3>
        <div class="form-group">
          <label>Token/API Key</label>
          <input type="password" id="config-token" placeholder="Token da API">
        </div>
        <div class="form-group">
          <label>Número de Origem (com DDD)</label>
          <input type="tel" id="config-phone" placeholder="+5519999999999">
        </div>
        <div class="form-group">
          <label>Webhook URL (opcional)</label>
          <input type="url" id="config-webhook" placeholder="https://seu-dominio.com/webhook">
        </div>
        <button onclick="saveWhatsappConfig()" class="btn-success">💾 Salvar Configuração</button>
        <button onclick="testWhatsappConnection()" class="btn-info">🧪 Testar Conexão</button>
        <div id="test-result" style="margin-top: 1rem; display: none;"></div>
      </div>
    </div>
  `;
  
  loadWhatsappConfig();
}

function selectProvider(provider) {
  document.querySelectorAll('.provider-btn').forEach(btn => btn.style.opacity = '0.5');
  document.querySelector(`[data-provider="${provider}"]`).style.opacity = '1';
  document.querySelector('.provider-btn').dataset.selected = provider;
  
  const form = document.getElementById('provider-config-form');
  form.style.display = provider === 'manual' ? 'none' : 'block';
}

// ===== EDITOR DE TEMPLATES =====

function renderTemplatesEditor() {
  const container = document.getElementById('main-content');
  
  container.innerHTML = `
    <div class="header-section">
      <h2>✏️ Editor de Mensagens</h2>
    </div>
    
    <div class="templates-grid">
      <div class="template-card">
        <h3>🔄 Reativação</h3>
        <textarea id="tpl-reactivation" rows="6" placeholder="Mensagem de reativação" style="width: 100%; font-family: monospace;"></textarea>
        <button onclick="saveTemplate('reactivation')">Salvar</button>
      </div>
      
      <div class="template-card">
        <h3>⏰ Lembrete 1h Antes</h3>
        <textarea id="tpl-reminder_1h" rows="6" placeholder="Lembrete de agendamento" style="width: 100%; font-family: monospace;"></textarea>
        <button onclick="saveTemplate('reminder_1h')">Salvar</button>
      </div>
      
      <div class="template-card">
        <h3>✅ Confirmação</h3>
        <textarea id="tpl-confirmation" rows="6" placeholder="Confirmação de agendamento" style="width: 100%; font-family: monospace;"></textarea>
        <button onclick="saveTemplate('confirmation')">Salvar</button>
      </div>
      
      <div class="template-card">
        <h3>🎂 Aniversário</h3>
        <textarea id="tpl-birthday" rows="6" placeholder="Mensagem de aniversário" style="width: 100%; font-family: monospace;"></textarea>
        <button onclick="saveTemplate('birthday')">Salvar</button>
      </div>
    </div>
    
    <div class="preview-section">
      <h3>Preview em Tempo Real</h3>
      <div id="chat-preview" style="background: #e8e8e8; border-radius: 8px; padding: 1rem; height: 300px; overflow-y: auto;">
        <div style="background: white; margin: 0.5rem 0; padding: 0.75rem; border-radius: 8px; max-width: 80%;">
          Visualização das mensagens aparecerá aqui...
        </div>
      </div>
    </div>
    
    <div class="variables-info">
      <h4>Variáveis Disponíveis:</h4>
      <code>{{nome}} {{dias}} {{barbearia}} {{link}} {{ultimo_servico}} {{barbeiro}}</code>
      <p style="font-size: 0.9rem; color: var(--text-faint); margin-top: 0.5rem;">Clique em uma variável para inserir</p>
      <div>
        <button onclick="insertVariable('{{nome}}')" class="var-btn">{{nome}}</button>
        <button onclick="insertVariable('{{dias}}')" class="var-btn">{{dias}}</button>
        <button onclick="insertVariable('{{barbearia}}')" class="var-btn">{{barbearia}}</button>
        <button onclick="insertVariable('{{link}}')" class="var-btn">{{link}}</button>
        <button onclick="insertVariable('{{ultimo_servico}}')" class="var-btn">{{ultimo_servico}}</button>
        <button onclick="insertVariable('{{barbeiro}}')" class="var-btn">{{barbeiro}}</button>
      </div>
    </div>
  `;
  
  loadTemplates();
}

// ===== HISTÓRICO DE ENVIOS =====

function renderMessageHistory() {
  const container = document.getElementById('main-content');
  
  container.innerHTML = `
    <div class="header-section">
      <h2>📊 Histórico de Envios</h2>
      <button onclick="exportHistoryAsCSV()" class="btn-info">📥 Exportar CSV</button>
    </div>
    
    <div class="filters-row">
      <input type="text" id="hist-search" placeholder="Buscar cliente...">
      <select id="hist-status">
        <option value="">Todos os status</option>
        <option value="sent">Enviado</option>
        <option value="viewed">Visualizado</option>
        <option value="failed">Falha</option>
        <option value="pending">Pendente</option>
      </select>
      <button onclick="loadMessageHistory()">🔍 Filtrar</button>
    </div>
    
    <div id="history-stats" class="stats-row">
      <!-- Stats carregarão aqui -->
    </div>
    
    <div id="history-table" class="table-container">
      <p style="text-align: center; padding: 2rem;">Carregando histórico...</p>
    </div>
  `;
  
  loadMessageHistory();
  loadMessageStats();
}

async function loadMessageHistory() {
  const search = document.getElementById('hist-search').value;
  const status = document.getElementById('hist-status').value;
  const container = document.getElementById('history-table');
  
  try {
    const url = '/api/messages?search=' + search + '&status=' + status + '&limit=100';
    const response = await apiCall('GET', url);
    
    let html = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Cliente</th>
            <th>Telefone</th>
            <th>Tipo</th>
            <th>Status</th>
            <th>Provedor</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    response.messages.forEach(msg => {
      const statusColor = {
        'sent': '#3498db',
        'viewed': '#2ecc71',
        'failed': '#e74c3c',
        'pending': '#f39c12'
      }[msg.status];
      
      html += `
        <tr>
          <td>${new Date(msg.created_at).toLocaleString('pt-BR')}</td>
          <td>${msg.client_name || '-'}</td>
          <td>${msg.recipient_phone}</td>
          <td>${msg.template_type}</td>
          <td><span style="background: ${statusColor}; color: white; padding: 4px 8px; border-radius: 4px;">${msg.status}</span></td>
          <td>${msg.provider}</td>
          <td><button onclick="viewMessageDetails('${msg.id}')" class="btn-small">👁️ Ver</button></td>
        </tr>
      `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
  } catch (error) {
    container.innerHTML = '<p style="color: red;">Erro: ' + error.message + '</p>';
  }
}

async function loadMessageStats() {
  try {
    const response = await apiCall('GET', '/api/messages/stats');
    const stats = response.totals;
    
    const statsContainer = document.getElementById('history-stats');
    statsContainer.innerHTML = `
      <div class="stat-box">
        <strong>${stats.total}</strong><br><small>Total</small>
      </div>
      <div class="stat-box">
        <strong>${stats.sent}</strong><br><small>Enviados</small>
      </div>
      <div class="stat-box">
        <strong>${stats.viewed}</strong><br><small>Visualizados</small>
      </div>
      <div class="stat-box">
        <strong>${stats.pending}</strong><br><small>Pendentes</small>
      </div>
      <div class="stat-box">
        <strong>${stats.failed}</strong><br><small>Falhas</small>
      </div>
    `;
  } catch (error) {
    console.error('Erro ao carregar stats:', error);
  }
}

// ===== MENSAGENS COMPARTILHADAS =====

async function sendWhatsappToClient(clientId, phone, name) {
  const message = `Oi ${name}, tudo bem? Sentimos sua falta! Volte em nossa barbearia. Clique em: {{link}}`;
  
  try {
    const response = await apiCall('POST', '/api/whatsapp/send', {
      phone,
      message,
      client_id: clientId
    });
    
    if (response.method === 'manual') {
      window.open(response.whatsapp_link, '_blank');
    } else {
      toast('Mensagem enviada com sucesso!', 'success');
    }
  } catch (error) {
    toast('Erro ao enviar: ' + error.message, 'error');
  }
}

async function sendBulkMessages(templateType) {
  const selected = [];
  document.querySelectorAll('.inactive-checkbox:checked').forEach(cb => {
    selected.push(cb.value);
  });
  
  if (selected.length === 0) {
    alert('Selecione pelo menos um cliente');
    return;
  }
  
  try {
    const response = await apiCall('POST', '/api/reactivation/send-bulk', {
      client_ids: selected,
      template_type: templateType
    });
    
    toast(`${response.sent} mensagens enviadas!`, 'success');
    loadInactiveClients();
  } catch (error) {
    toast('Erro: ' + error.message, 'error');
  }
}

async function saveTemplate(type) {
  const content = document.getElementById(`tpl-${type}`).value;
  if (!content.trim()) {
    alert('Digite a mensagem');
    return;
  }
  
  try {
    await apiCall('POST', '/api/whatsapp/templates', {
      template_type: type,
      title: type,
      content
    });
    
    toast('Template salvo!', 'success');
  } catch (error) {
    toast('Erro: ' + error.message, 'error');
  }
}

function insertVariable(variable) {
  const activeTemplate = document.querySelector('.template-card textarea:focus') || document.querySelector('.template-card textarea');
  if (activeTemplate) {
    activeTemplate.value += ' ' + variable;
  }
}

async function exportHistoryAsCSV() {
  window.open('/api/messages/export/csv', '_blank');
}

/* ===== FIM DAS NOVAS FUNÇÕES ===== */
