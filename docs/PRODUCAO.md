# 📋 Setup Passo a Passo para Produção

## ✅ Seu sistema está 100% pronto para produção!

O projeto inclui:
- ✅ Backend completo com JWT
- ✅ Banco de dados SQLite com schema completo
- ✅ Validações em todas as APIs
- ✅ Tratamento de erros global
- ✅ Rate limiting
- ✅ CORS configurável  
- ✅ Logging detalhado
- ✅ Dados seed automatizados
- ✅ Configurações por ambiente
- ✅ Documentação de deployment

---

## 🚀 Iniciar em 5 minutos

### 1. Primeira Vez?
```bash
npm run init
```
Este comando:
- ✅ Instala dependências
- ✅ Cria banco de dados
- ✅ Popula dados de teste
- ✅ Inicia o servidor

### 2. Próximas Vezes
```bash
npm start
```

### 3. Acessar
Abra: **http://localhost:3000**

Credenciais:
```
Email: demo@barberos.app
Senha: demo123
```

---

## 📁 Estrutura Completa

```
sistema barber/
├── 📄 index.html           ← Frontend
├── 🎨 styles.css           ← Design
├── ⚙️ app.js              ← Lógica frontend
├── 🔌 api.js              ← Chamadas API
├── 🌐 server.js           ← Servidor principal
├── 💾 database.js         ← Banco de dados
├── 🔐 config.js           ← Configs
├── 🛡️ middleware.js       ← Segurança
├── 📋 validators.js       ← Validações
├── 📦 package.json        ← Dependências
├── 🔑 .env                ← Variáveis
├── 📁 routes/
│   ├── auth.js            ← Autenticação
│   ├── barbers.js         ← Barbeiros
│   ├── services.js        ← Serviços
│   ├── appointments.js    ← Agendamentos
│   ├── clients.js         ← Clientes
│   ├── config.js          ← Config user
│   └── finance.js         ← Relatórios
├── 📁 scripts/
│   └── seed.js            ← Popular banco
├── 📖 README.md           ← Docs geral
├── 🔗 INTEGRACAO.md       ← Frontend/API
├── 🚀 DEPLOYMENT.md       ← Deploy prod
├── ⚡ QUICKSTART.md       ← Início rápido
└── ✉️ LICENSE
```

---

## 🔧 Configuração para Produção

### 1. Alterar JWT_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copiar resultado e adicionar ao `.env`:
```bash
JWT_SECRET=seu_valor_muito_longo_aqui
NODE_ENV=production
```

### 2. Configurar CORS
```bash
# Para seu domínio
CORS_ORIGIN=https://seu-dominio.com
```

### 3. Database (Opcional)
Para produção com muitos usuários, migrar para PostgreSQL:
```bash
npm install pg pg-promise
```

---

## 📊 APIs Disponíveis

### Autenticação
```
POST   /api/auth/register          ← Registrar
POST   /api/auth/login             ← Fazer login
GET    /api/auth/me                ← Dados user
PUT    /api/auth/me                ← Atualizar
POST   /api/auth/change-password   ← Alterar senha
```

### Gerenciamento
```
GET    /api/barbers                ← Listar barbeiros
POST   /api/barbers                ← Criar
PUT    /api/barbers/:id            ← Editar
DELETE /api/barbers/:id            ← Deletar

GET    /api/services               ← Listar serviços
POST   /api/services               ← Criar
PUT    /api/services/:id           ← Editar
DELETE /api/services/:id           ← Deletar

GET    /api/appointments           ← Listar agendamentos
POST   /api/appointments           ← Criar
PUT    /api/appointments/:id       ← Editar
DELETE /api/appointments/:id       ← Deletar
PATCH  /api/appointments/:id/status ← Alterar status

GET    /api/clients                ← Listar clientes
POST   /api/clients                ← Criar
PUT    /api/clients/:id            ← Editar
DELETE /api/clients/:id            ← Deletar
```

### Config
```
GET    /api/config                 ← Gerenciar configurações
PUT    /api/config                 ← Salvar
GET    /api/config/identity/get    ← Identidade visual
PUT    /api/config/identity/update ← Atualizar visual
```

### Relatórios
```
GET    /api/finance/summary        ← Resumo financeiro
GET    /api/finance/by-barber      ← Por barbeiro
GET    /api/finance/top-services   ← Serviços top
GET    /api/finance/transactions   ← Histórico
```

### Sistema
```
GET    /api/health                 ← Health check
GET    /api/status                 ← Status do servidor
```

---

## 🧪 Testar a API

### Com cURL
```bash
# Health check
curl http://localhost:3000/api/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@barberos.app","password":"demo123"}'

# Com token
TOKEN="seu_token_aqui"
curl http://localhost:3000/api/barbers \
  -H "Authorization: Bearer $TOKEN"
```

### Com Postman
1. Importe em Postman
2. URL Base: `http://localhost:3000/api`
3. Primeiro faz login em `/auth/login`
4. Copie o `token` da resposta
5. Vá para `Authorization` → Type: `Bearer Token` → Cole token
6. Pode fazer outras requisições

---

## 📈 Produção - Step by Step

### Opção 1: DigitalOcean (Recomendado)
Veja [DEPLOYMENT.md](DEPLOYMENT.md#opção-2-deploy-no-digitalocean)

### Opção 2: Heroku
Veja [DEPLOYMENT.md](DEPLOYMENT.md#opção-1-deploy-no-heroku)

### Opção 3: Docker
Veja [DEPLOYMENT.md](DEPLOYMENT.md#opção-3-deploy-com-docker)

---

## 🔍 Monitoramento

### Logs
```bash
npm start
# Logs aparecem no console
```

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Status
```bash
curl http://localhost:3000/api/status
```

---

## 🐛 Troubleshooting

### "Porta 3000 em uso"
```bash
PORT=3001 npm start
```

### "Banco vazio"
```bash
npm run seed
```

### "Erro de validação"
Verifique os dados enviados vs arquivo `validators.js`

### "Token inválido"
O token expirou? Faça login novamente

### Mais problemas?
Veja [DEPLOYMENT.md](DEPLOYMENT.md#troubleshooting)

---

## 📚 Documentação

- **[README.md](README.md)** — Documentação completa
- **[INTEGRACAO.md](INTEGRACAO.md)** — Frontend com Backend
- **[DEPLOYMENT.md](DEPLOYMENT.md)** — Deploy produção
- **[QUICKSTART.md](QUICKSTART.md)** — Início rápido

---

## ✨ Ficou fácil!

Seu sistema está 100% funcional e pronto para produção.

**Próximos passos:**
1. ✅ Customizar cores e branding
2. ✅ Adicionar seus barbeiros
3. ✅ Criar serviços
4. ✅ Testar agendamentos
5. ✅ Deploy em servidor

---

**Desenvolvido com ❤️ para barbearias**

Versão 1.0.0 — Pronto para Produção 🚀
