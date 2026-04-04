# 🚀 BarberOS — Sistema Completo de Agendamento

Sistema profissional de agendamento para barbearias com **backend com banco de dados**, **frontend responsivo** e **APIs REST**.

## 📁 Estrutura do Projeto

```
sistema barber/
├── index.html              # Interface do usuário
├── styles.css              # Estilos CSS
├── app.js                  # Lógica do frontend
├── server.js               # Servidor Express
├── database.js             # Configuração do SQLite
├── package.json            # Dependências Node.js
├── .env                    # Variáveis de ambiente
├── barber.db              # Banco de dados (gerado automaticamente)
└── routes/                 # APIs REST
    ├── auth.js             # Autenticação & Usuários
    ├── barbers.js          # Gerenciamento de barbeiros
    ├── services.js         # Gerenciamento de serviços
    ├── appointments.js     # Agendamentos
    ├── clients.js          # Clientes
    ├── config.js           # Configurações & Identidade Visual
    └── finance.js          # Relatórios & Financeiro
```

## ⚙️ Instalação

### Pré-requisitos
- **Node.js** 14+ ([Download](https://nodejs.org/))
- **npm** (vem com Node.js)

### Passo 1: Instalar dependências

```bash
cd "c:\Users\Usuário\Desktop\sistema barber"
npm install
```

### Passo 2: Iniciar o servidor

```bash
npm start
```

Você verá:
```
🚀 BarberOS Backend rodando em http://localhost:3000
📱 Acesse http://localhost:3000 no navegador
```

### Passo 3: Abrir no navegador

Abra **http://localhost:3000** e comece a usar!

---

## 🔐 Autenticação

### Registrar nova conta

**POST** `/api/auth/register`

```json
{
  "name": "João Silva",
  "email": "joao@barbearia.com",
  "phone": "(51) 99999-9999",
  "shop_name": "Barbearia do João",
  "password": "senha123"
}
```

**Resposta (201):**
```json
{
  "message": "Usuário registrado com sucesso",
  "user": {
    "id": 1,
    "email": "joao@barbearia.com",
    "name": "João Silva",
    "shop": "Barbearia do João"
  },
  "token": "eyJhbGc..."
}
```

### Login

**POST** `/api/auth/login`

```json
{
  "email": "joao@barbearia.com",
  "password": "senha123"
}
```

---

## 📊 Endpoints da API

Todos os endpoints (exceto auth) requerem header:
```
Authorization: Bearer {TOKEN}
```

### 💇 Barbeiros

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/barbers` | Listar todos |
| GET | `/api/barbers/:id` | Obter um |
| POST | `/api/barbers` | Criar novo |
| PUT | `/api/barbers/:id` | Atualizar |
| DELETE | `/api/barbers/:id` | Deletar |

**POST `/api/barbers` (Criar barbeiro)**

```json
{
  "name": "Lucas Ferreira",
  "nickname": "Lucas F.",
  "email": "lucas@email.com",
  "phone": "(51) 99999-9999",
  "commission": 40,
  "color": "#C0392B",
  "start_time": "09:00",
  "end_time": "19:00",
  "specialties": [1, 2],
  "working_days": [1, 2, 3, 4, 5, 6]
}
```

---

### 📋 Serviços

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/services` | Listar todos |
| POST | `/api/services` | Criar novo |
| PUT | `/api/services/:id` | Atualizar |
| DELETE | `/api/services/:id` | Deletar |

**POST `/api/services` (Criar serviço)**

```json
{
  "name": "Corte + Barba",
  "duration": 50,
  "price": 70,
  "description": "Corte cabelo + aparação de barba"
}
```

---

### 📅 Agendamentos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/appointments` | Listar (com filtros) |
| GET | `/api/appointments/:id` | Obter um |
| POST | `/api/appointments` | Criar |
| PUT | `/api/appointments/:id` | Atualizar |
| PATCH | `/api/appointments/:id/status` | Alterar status |
| DELETE | `/api/appointments/:id` | Deletar |
| GET | `/api/appointments/:barber_id/available-times` | Horários livres |

**POST `/api/appointments` (Criar agendamento)**

```json
{
  "client_id": 1,
  "barber_id": 1,
  "service_id": 1,
  "appointment_date": "2026-04-15 14:30",
  "observations": "Quer degradê baixo"
}
```

**GET `/api/appointments/:barber_id/available-times?date=2026-04-15&service_id=1`**

Retorna array de horários disponíveis:
```json
["09:00", "09:30", "10:00", "14:00", "14:30"]
```

---

### 👥 Clientes

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/clients` | Listar todos |
| GET | `/api/clients/:id` | Obter (com histórico) |
| POST | `/api/clients` | Criar novo |
| PUT | `/api/clients/:id` | Atualizar |
| GET | `/api/clients/search/phone?phone=9999` | Buscar por telefone |
| POST | `/api/clients/:id/update-stats` | Atualizar gasto total |
| DELETE | `/api/clients/:id` | Deletar |

**POST `/api/clients` (Criar cliente)**

```json
{
  "name": "Carlos Silva",
  "email": "carlos@email.com",
  "phone": "(51) 98888-8888"
}
```

---

### ⚙️ Configurações

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/config` | Obter config |
| PUT | `/api/config/hours` | Salvar horas |
| PUT | `/api/config/notifications` | Salvar notificações |
| GET | `/api/config/identity` | Obter identidade visual |
| PUT | `/api/config/identity` | Atualizar identidade |

**PUT `/api/config/notifications` (Salvar preferências)**

```json
{
  "whatsapp": true,
  "email": true,
  "owner": true,
  "24h": false
}
```

**PUT `/api/config/identity` (Atualizar visual)**

```json
{
  "color_primary": "#C0392B",
  "color_bg": "#0D0D0D",
  "color_text": "#F5F2ED",
  "color_card": "#1A1A1A",
  "font_display": "Clash Display",
  "welcome_message": "Reserve seu corte",
  "logo_url": "https://..."
}
```

---

### 💰 Financeiro

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/finance/summary?period=month` | Resumo (week, month, year) |
| GET | `/api/finance/by-barber?period=month` | Receita por barbeiro |
| GET | `/api/finance/top-services?period=month` | Serviços mais vendidos |
| GET | `/api/finance/transactions?limit=50&offset=0` | Histórico |
| GET | `/api/finance/daily-revenue?period=week` | Receita por dia |
| GET | `/api/finance/occupancy-rate?date=2026-04-15` | Taxa de ocupação |

---

## 📱 Como Funciona

### 1️⃣ Registrar / Login
```javascript
// Frontend chama:
const response = await fetch('/api/auth/register', {
  method: 'POST',
  body: JSON.stringify({ name, email, shop_name, password })
});
const { token } = await response.json();
localStorage.setItem('token', token);
```

### 2️⃣ Adicionar Barbeiros
```javascript
await fetch('/api/barbers', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ name, nickname, phone, ... })
});
```

### 3️⃣ Criar Agendamento
```javascript
await fetch('/api/appointments', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ client_id, barber_id, service_id, date, ... })
});
```

### 4️⃣ Relatórios
```javascript
const data = await fetch('/api/finance/summary?period=month', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 🗄️ Banco de Dados (SQLite)

O banco é gerado automaticamente na primeira execução. Tabelas:

- **users** — Donos de barbearias
- **barbers** — Barbeiros
- **services** — Serviços oferecidos
- **appointments** — Agendamentos
- **clients** — Clientes
- **configs** — Configurações
- **identity** — Identidade visual

---

## 🔧 Troubleshooting

### ❌ "Módulo não encontrado"
```bash
npm install
```

### ❌ "Porta 3000 já está em uso"
```bash
# Mude a porta no .env
PORT=3001
```

### ❌ Banco de dados não persiste
Verifique se a pasta tem permissões de escrita. O arquivo `barber.db` é criado automaticamente.

### ❌ CORS error
Já está configurado em `server.js`. Se tiver problemas, verifique as origins.

---

## 🚀 Deploy

### Heroku

```bash
git init
git add .
git commit -m "Initial commit"
heroku login
heroku create seu-app-name
git push heroku main
```

### DigitalOcean / AWS

1. SSH para o servidor
2. `git clone seu-repositorio`
3. `npm install`
4. Use **PM2** para manter rodando:

```bash
npm install -g pm2
pm2 start server.js --name "barberos"
pm2 startup
pm2 save
```

---

## 📝 Próximas Melhorias

- [ ] Envio de SMS/WhatsApp automático
- [ ] Integração com Stripe/PagSeguro
- [ ] Backup automático do banco
- [ ] Dashboard admin
- [ ] Relatórios em PDF
- [ ] App mobile (React Native)

---

## 💡 Dúvidas?

Sistema desenvolvido com **Node.js + Express + SQLite + Vanilla JS**

**Versão:** 1.0.0
**Licença:** MIT

---

Feito com ❤️ para barbearias que querem organizar melhor seus negócios!
