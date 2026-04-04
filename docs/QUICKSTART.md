# ⚡ Quick Start — BarberOS

## 🚀 Comece em 3 minutos

### 1. Instalar

```bash
cd "c:\Users\Usuário\Desktop\sistema barber"
npm install
```

**Aguarde alguns segundos...**

### 2. Iniciar servidor

```bash
npm start
```

Você verá:
```
🚀 BarberOS Backend rodando em http://localhost:3000
```

### 3. Abrir no navegador

Abra: **http://localhost:3000**

---

## 📱 Primeiro Acesso

### Opção 1: Login Demo (rápido)
Clique em "Entrar" → "Demo rápido?" → "Entrar como dono"

Pronto! Você tem dados de exemplo:
- 3 barbeiros
- 6 serviços
- 8 agendamentos
- 6 clientes

### Opção 2: Criar Conta Real
1. Clique em "Criar conta grátis"
2. Preencha os dados
3. Clique em "Criar conta e receber código"

---

## 📁 Arquivos Importantes

```
📦 sistema barber/
├── 📄 index.html      ← Interface
├── 🎨 styles.css      ← Design
├── ⚙️ app.js          ← Lógica
├── 🔌 api.js          ← Conexão com API
├── 🌐 server.js       ← Backend
├── 💾 database.js     ← Banco de dados
├── 📁 routes/         ← APIs REST
├── 📦 package.json    ← Dependências
└── 📖 README.md       ← Documentação completa
```

---

## 🛠️ Troubleshooting

### ❌ "npm: command not found"
Instale Node.js: https://nodejs.org/

### ❌ "Porta 3000 já em uso"
```bash
# Use outra porta:
PORT=3001 npm start
# Depois acesse: http://localhost:3001
```

### ❌ "Erro ao conectar"
- Verifique se o servidor está rodando (`npm start`)
- Verifique se está em **http://** (não https)
- Feche e reabra a aba do navegador

### ❌ "Banco de dados vazio"
É normal! Use a opção "Demo" ou crie sua conta e adicione dados.

---

## 📊 O que você pode fazer

✅ **Autenticação** — Login, registro, múltiplas contas
✅ **Barbeiros** — Adicionar, editar, deletar, especialidades
✅ **Serviços** — Criar serviços com preço, duração
✅ **Agendamentos** — Agendar, alterar status, visualizar agenda
✅ **Clientes** — Cadastro, histórico, total gasto
✅ **Configurações** — Horários, notificações, senha
✅ **Identidade Visual** — Cores, fontes, logo, mensagens
✅ **Relatórios** — Receita, barbeiro mais lucrativo, serviços top
✅ **Booking Público** — Clientes agendarem online

---

## 📚 Documentação Completa

Ver **[README.md](README.md)** para:
- Documentação de APIs
- Como integrar com frontend
- Deploy em produção
- Troubleshooting avançado

Ver **[INTEGRACAO.md](INTEGRACAO.md)** para:
- Como chamar cada API
- Exemplos de código
- Tratamento de erros

---

## 🎯 Próximos Passos

1. **Explore o dashboard** — Clique em cada seção
2. **Adicione seus barbeiros** — Menu "Barbeiros"
3. **Crie serviços** — Menu "Serviços"
4. **Agende testes** — Menu "Agenda" ou "Novo agendamento"
5. **Personalize** — Menu "Identidade Visual"

---

## 🆘 Precisa de ajuda?

1. **Leia o README.md** (documentação completa)
2. **Leia o INTEGRACAO.md** (exemplos de código)
3. **Verifique o console** do navegador (F12) para erros
4. **Verifique o terminal** do Node.js para erros do servidor

---

## 🔐 Por Segurança

- Altere `JWT_SECRET` em `.env` antes de deploy em produção
- Use HTTPS em produção
- Valide todos os dados no servidor
- Nunca commita `.env` com dados reais no Git

---

**Aproveite! 🚀**

Seu sistema de agendamento está pronto para usar.
