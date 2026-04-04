# BarberOS — Sistema de Agendamento para Barbearias

**BarberOS** é uma solução profissional de agendamento e gestão para barbearias. Oferece agenda inteligente, gestão de barbeiros, controle de atendimentos, financeiro completo e página de agendamento customizável.

## ✨ Recursos

- 📅 **Agenda Inteligente** - Visualize todos os barbeiros e horários disponíveis
- ✂️ **Gestão de Barbeiros** - Controle especialidades, comissão, dias de trabalho
- 🛠️ **Serviços** - Crie e gerencie serviços com preço e duração
- 👥 **Clientes** - Histórico completo de atendimentos e gastos
- 💰 **Financeiro** - Dashboard com faturamento, comissões e análises
- 🎨 **Personalização** - Cores, fontes, logo e mensagens da marca
- 🔐 **Segurança** - Autenticação JWT, senhas criptografadas, validações
- 📱 **Responsivo** - Funciona em desktop, tablet e mobile
- ⚡ **Rápido** - SQLite integrado, sem dependências externas pesadas
- 🌍 **Pronto para Publicação** - Estrutura profissional e escalável

## 🚀 Começar Rapidamente

### Pré-requisitos

- Node.js 14+ e npm/yarn
- Navegador moderno (Chrome, Firefox, Safari, Edge)

### Instalação

```bash
# Clonar ou extrair o projeto
cd sistema-barber

# Instalar dependências
npm install

# Iniciar servidor
npm start
```

O sistema estará disponível em `http://localhost:3000`

**Login de Demonstração:**
- E-mail: `demo@barberos.app`
- Senha: `demo123`

## 📁 Estrutura do Projeto

```
sistema-barber/
├── public/                    # Arquivos estáticos (frontend)
│   ├── index.html            # Interface do sistema
│   ├── styles.css            # Estilos CSS
│   ├── app.js                # Lógica do frontend
│   └── api.js                # Cliente API
├── src/                       # Código backend
│   ├── config/               # Configurações
│   │   └── index.js
│   ├── database/             # Inicialização do banco
│   │   └── index.js
│   ├── middleware/           # Middlewares (auth, erro, etc)
│   │   └── index.js
│   ├── validators/           # Funções de validação
│   │   └── index.js
│   └── routes/               # Endpoints da API
│       ├── auth.js           # Autenticação
│       ├── barbers.js        # Barbeiros
│       ├── services.js       # Serviços
│       ├── appointments.js   # Agendamentos
│       ├── clients.js        # Clientes
│       ├── config.js         # Configurações
│       └── finance.js        # Financeiro
├── scripts/                   # Scripts úteis
│   ├── seed.js               # Dados de demonstração
│   └── test-api.js           # Testes de API
├── docs/                      # Documentação
├── server.js                  # Servidor Express
├── database.js               # Conexão SQLite
├── .env.example              # Variáveis de ambiente
├── .env.production           # Variáveis de produção
├── package.json              # Dependências
└── barber.db                 # Banco de dados SQLite
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Servidor
PORT=3000
NODE_ENV=development
HOST=localhost

# Segurança
JWT_SECRET=sua-chave-secreta-muito-segura-aqui
CORS_ORIGIN=http://localhost:3000

# Banco de Dados
DATABASE_PATH=./barber.db
```

Para produção, use `.env.production` com valores seguros.

## 📖 Usando o Sistema

### Para Donos de Barbearia (Admin)

1. **Criar Conta** - Registre-se com suas informações
2. **Configurar Barbeiros** - Adicione seus barbeiros com especialidades
3. **Criar Serviços** - Defina os serviços oferecidos
4. **Gerenciar Agenda** - Controle os agendamentos do dia
5. **Acompanhar Financeiro** - Visualize faturamento e comissões
6. **Personalizar Marca** - Configure cores, logo e mensagens

### Para Clientes

1. Acessem o link de agendamento: `https://barberos.app/{seu-slug}`
2. Escolhem o serviço desejado
3. Selecionam barbeiro ou deixam automático
4. Escolhem data e hora disponível
5. Confirmam com seus dados

## 🛠️ API

### Autenticação

```bash
# Login
POST /api/auth/login
Body: { email, password }

# Registrar
POST /api/auth/register
Body: { name, email, phone, shop_name, password }

# Obter usuário
GET /api/auth/me
Headers: Authorization: Bearer {token}
```

### Barbeiros

```bash
GET    /api/barbers              # Listar todas
GET    /api/barbers/:id          # Obter um
POST   /api/barbers              # Criar novo
PUT    /api/barbers/:id          # Atualizar
DELETE /api/barbers/:id          # Remover
```

### Serviços

```bash
GET    /api/services             # Listar todos
GET    /api/services/:id         # Obter um
POST   /api/services             # Criar novo
PUT    /api/services/:id         # Atualizar
DELETE /api/services/:id         # Remover
```

### Agendamentos

```bash
GET    /api/appointments         # Listar todos
GET    /api/appointments/:id     # Obter um
POST   /api/appointments         # Criar novo
PUT    /api/appointments/:id     # Atualizar
DELETE /api/appointments/:id     # Cancelar
PATCH  /api/appointments/:id/status  # Mudar status
```

### Clientes

```bash
GET    /api/clients              # Listar todos
GET    /api/clients/:id          # Obter um
POST   /api/clients              # Criar novo
PUT    /api/clients/:id          # Atualizar
DELETE /api/clients/:id          # Remover
```

### Financeiro

```bash
GET /api/finance/summary?period=month       # Resumo mensal
GET /api/finance/by-barber?period=month     # Por barbeiro
GET /api/finance/top-services?period=month  # Serviços mais vendidos
GET /api/finance/transactions?limit=50      # Histórico de transações
```

## 🔒 Segurança

- ✅ Senhas hasheadas com bcrypt (10 rounds)
- ✅ Autenticação JWT (30 dias)
- ✅ Validação de entrada em todos os campos
- ✅ Proteção contra XSS
- ✅ Rate limiting em produção
- ✅ CORS configurável
- ✅ Foreign keys habilitadas no banco
- ✅ Variáveis de ambiente para dados sensíveis

## 📊 Banco de Dados

O sistema usa **SQLite3** com as seguintes tabelas:

- `users` - Proprietários de barbearias
- `barbers` - Barbeiros e seus dados
- `barber_specialties` - Especialidades de cada barbeiro
- `barber_working_days` - Dias de trabalho por barbeiro
- `services` - Serviços oferecidos
- `appointments` - Agendamentos realizados
- `clients` - Clientes da barbearia
- `configs` - Configurações por usuário
- `identity` - Dados de personalização (cores, logo, etc)

## 🚢 Publicação (Deployment)

### Em um VPS/Servidor Linux

```bash
# 1. Clonar repositório
git clone seu-repo
cd sistema-barber

# 2. Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Instalar dependências
npm install

# 4. Configurar produção
cp .env.production .env
nano .env  # Editar variables importantes

# 5. Iniciar com PM2
npm install -g pm2
pm2 start server.js --name "barberos"
pm2 startup
pm2 save

# 6. Configurar Nginx (reverso proxy)
sudo apt install nginx
# Configure em /etc/nginx/sites-available/barberos
sudo systemctl start nginx
```

### Com Docker

```bash
# Build
docker build -t barberos .

# Run
docker run -d -p 3000:3000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=sua-chave-secreta \
  -v barberos-db:/app/data \
  barberos
```

### Em Heroku

```bash
# Deploy com Git
heroku create seu-app
git push heroku main

# Ou com CLI
heroku login
heroku create seu-app
npm run build
git push heroku main
```

### Em Plataforma Cloud (AWS, DigitalOcean, etc)

1. Configure as variáveis de ambiente
2. Execute `npm install && npm start`
3. Configure domínio e SSL
4. Configure banco de dados persistente se necessário

## 🧪 Testes

```bash
# Testar endpoints da API
npm run test

# Começar com dados de demo
npm run seed
```

## 📝 Logs

Os logs estão disponíveis em:

```bash
# Desenvolvimento
npm start

# Produção com PM2
pm2 logs barberos

# Docker
docker logs nome-container
```

## 🐛 Troubleshooting

**Porta 3000 já está em uso:**
```bash
PORT=3001 npm start
```

**Erro de permissão no banco de dados:**
```bash
chmod 666 barber.db
```

**JWT Secret não configurado:**
- Edite o arquivo `.env` com uma chave segura
- Em produção, SEMPRE use uma chave aleatória forte

**CORS bloqueando requisições:**
- Verifique `CORS_ORIGIN` no `.env`
- Em produção, configure apenas origens permitidas

## 📞 Suporte

Para relatórios de bugs ou sugestões:
- Abra uma issue no repositório
- Envie um email para suporte@barberos.app

## 📄 Licença

Este projeto é licenciado sob a MIT License - veja LICENSE para detalhes.

## 🎯 Roadmap

- [ ] Integração WhatsApp para lembretes
- [ ] Aplicativo mobile (iOS/Android)
- [ ] Integração com pagamento (Stripe, Pix)
- [ ] Relatórios avançados
- [ ] Portal do cliente com histórico
- [ ] Integração com Google Calendar
- [ ] Sistema de cupons e promoções
- [ ] Múltiplas unidades/franquias

---

**BarberOS** — Seu sistema de agendamento profissional. Feito para quem trabalha de verdade. ✂️
