# 🚀 Novas Funcionalidades - Reativação e WhatsApp

## 1️⃣ Sistema de Reativação de Clientes

### Funcionalidade
Identifica automaticamente clientes inativos que não visitam a barbearia há N dias e oferece ferramentas para reativação.

### Endpoints
```
GET  /api/reactivation                    # Listar clientes inativos
POST /api/reactivation/send-bulk          # Enviar mensagens em lote
GET  /api/reactivation/inactive-count     # Badge com total de inativos
```

### Badge na Sidebar
- Mostra número de clientes inativos
- Cor vermelha se > 5, laranja se > 2, verde se 0-2
- Atualiza em tempo real

### Visualização
- Lista completa com último serviço, barbeiro e data
- Urgência visual: Vermelho (2x interval), Laranja, Verde
- Checkbox para seleção múltipla
- Botão WhatsApp individual

---

## 2️⃣ Regras de Recorrência

### Configuração
```json
{
  "name": "Reativação Mensal",
  "inactive_days": 30,
  "recurrence_days": 7,
  "max_daily_sends": 50,
  "auto_resend_days": 7,
  "send_time": "10:00",
  "enabled": true
}
```

### Funcionamento
1. Sistema identifica clientes inativos a cada `inactive_days`
2. Envia primeira mensagem
3. Se não agendou em `auto_resend_days`, reenvia automaticamente
4. Máximo `max_daily_sends` por dia
5. Dispara em `send_time` configurado

---

## 3️⃣ Integração WhatsApp

### Provedores Suportados
1. **Z-API** - Plataforma brasileira
2. **Evolution API** - Open source
3. **360dialog** - WhatsApp Business API
4. **Twilio** - Plataforma global
5. **Manual** - WhatsApp Web (sem API)

### Endpoints
```
GET  /api/whatsapp/config                 # Obter configuração
POST /api/whatsapp/config                 # Salvar configuração
POST /api/whatsapp/test                   # Testar conexão
POST /api/whatsapp/send                   # Enviar mensagem
GET  /api/whatsapp/templates              # Listar templates
POST /api/whatsapp/templates              # Salvar template
```

### Configuração
```json
{
  "provider": "z-api",
  "token": "xyz123",
  "phone_origin": "+551999999999",
  "webhook_url": "https://seu-dominio.com/webhook"
}
```

### Modo Manual
Se não tiver API configurada, clique no botão WhatsApp para abrir:
```
https://wa.me/5519999999999?text={{mensagem pré-preenchida}}
```

---

## 4️⃣ Templates de Mensagens

### Tipos Disponíveis
- `reactivation` - Reativação de cliente
- `reminder_1h` - Lembrete 1h antes
- `appointment_confirmation` - Confirmação de agendamento
- `birthday` - Mensagem de aniversário

### Variáveis Dinâmicas
```
{{nome}}              → Nome do cliente
{{dias}}              → Dias inativo
{{barbearia}}         → Nome da barbearia
{{link}}              → Link de agendamento
{{ultimo_servico}}    → Último serviço realizado
{{barbeiro}}          → Barbeiro que atendeu
```

### Exemplo
```
Oi {{nome}}, tudo bem? 👋

Sentimos sua falta por {{dias}} dias! 

Volte para aproveitar {{ultimo_servico}} com {{barbeiro}} em {{barbearia}}.

Reserve seu horário: {{link}}

Abraços! ✂️
```

### Preview em Tempo Real
- Chat estilo WhatsApp mostra como ficará
- Atualiza enquanto digita
- Variáveis substituídas automaticamente

---

## 5️⃣ Histórico de Envios

### Endpoints
```
GET  /api/messages                        # Listar histórico
GET  /api/messages/stats                  # Estatísticas
POST /api/messages/:id/status             # Atualizar status
GET  /api/messages/export/csv             # Exportar CSV
```

### Status Possíveis
- `pending` - Aguardando envio
- `sent` - Enviado
- `viewed` - Visualizado
- `failed` - Falha no envio
- `scheduled` - Agendado

### Campos Rastreados
```json
{
  "id": 1,
  "client_id": 5,
  "client_name": "João Silva",
  "recipient_phone": "+5519999999999",
  "template_type": "reactivation",
  "message_content": "Olá João...",
  "provider": "z-api",
  "status": "sent",
  "sent_at": "2026-04-04T10:30:00Z",
  "viewed_at": "2026-04-04T10:35:00Z",
  "retry_count": 0,
  "error_message": null
}
```

### Filtros
- Por status (Enviado, Visualizado, Agendou, Falhou)
- Por nome do cliente
- Por data
- Por provedor

### Exportação
- Clique em "Exportar CSV"
- Arquivo com todos os envios do período
- Use em relatórios e análises

---

## 📊 Schema do Banco de Dados

### Tabela: reactivation_rules
```sql
CREATE TABLE reactivation_rules (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  inactive_days INTEGER,           -- Quantos dias sem visita
  recurrence_days INTEGER,         -- Repetir a cada X dias
  enabled INTEGER,                 -- Ativa/desativa regra
  max_daily_sends INTEGER,         -- Máximo de envios/dia
  auto_resend_days INTEGER,        -- Reenviar se não agendou em X dias
  send_time TEXT,                  -- Horário: HH:MM
  created_at DATETIME,
  updated_at DATETIME
);
```

### Tabela: whatsapp_config
```sql
CREATE TABLE whatsapp_config (
  id INTEGER PRIMARY KEY,
  user_id INTEGER UNIQUE,
  provider TEXT,                   -- z-api, evolution, 360dialog, twilio
  api_token TEXT,
  phone_origin TEXT,               -- +55199999999
  webhook_url TEXT,
  is_connected INTEGER,            -- 0 ou 1
  created_at DATETIME,
  updated_at DATETIME
);
```

### Tabela: message_templates
```sql
CREATE TABLE message_templates (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  template_type TEXT,              -- reactivation, reminder_1h, etc
  title TEXT,
  content TEXT,                    -- Mensagem com {{variáveis}}
  variables TEXT,                  -- JSON com lista de variáveis
  created_at DATETIME,
  updated_at DATETIME
);
```

### Tabela: message_history
```sql
CREATE TABLE message_history (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  client_id INTEGER,
  template_type TEXT,
  message_content TEXT,
  recipient_phone TEXT,
  provider TEXT,                   -- Provedor usado
  status TEXT,                     -- pending, sent, viewed, failed
  message_id TEXT,                 -- ID do provedor
  sent_at DATETIME,
  viewed_at DATETIME,
  scheduled_at DATETIME,           -- Se agendado
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at DATETIME
);
```

---

## 🔗 Integração Frontend

### Novas Páginas: tabs-sidebar
- `reactivacao` → Sistema de Reativação
- `whatsapp` → Configuração do WhatsApp
- `templates` → Editor de Templates
- `historico-mensagens` → Histórico de Envios

### API Calls Necessárias
```javascript
// Reativação
api.getInactiveClients(days)
api.sendBulkMessages(client_ids, template_type)
api.getInactiveCount(days)

// WhatsApp
api.getWhatsappConfig()
api.saveWhatsappConfig(provider, token, phone, webhook)
api.testWhatsappConnection()
api.sendWhatsappMessage(phone, message, client_id)

// Templates
api.getTemplates()
api.saveTemplate(template_type, title, content)

// Histórico
api.getMessageHistory(status, search, limit, offset)
api.getMessageStats()
api.updateMessageStatus(id, status)
api.exportMessagesAsCSV(status)
```

---

## 🚀 Próximas Etapas

- [ ] Webhooks do WhatsApp para atualizar status
- [ ] Cron job para disparar mensagens automáticas
- [ ] Dashboard com métricas de reativação
- [ ] Integração Google Analytics para rastreamento

---

**Documentação: Abril/2026 v1.1**
