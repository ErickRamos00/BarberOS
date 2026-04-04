# 🔄 Como o Sistema Guarda Dados no Banco de Dados

## ✅ Pronto Para Salvar Tudo Permanentemente

Seu sistema agora está **100% integrado com o banco de dados**. Todos os cadastros e agendamentos serão salvos permanentemente no SQLite!

---

## 🚀 Começando

### 1️⃣ **Primeira Execução:**
```bash
npm run init
```

Isso vai:
- ✅ Instalar todas as dependências
- ✅ Criar o banco de dados SQLite
- ✅ Popular com dados de exemplo
- ✅ Iniciar o servidor

### 2️⃣ **Próximas Execuções:**
```bash
npm start
```

### 3️⃣ **Acesse o Sistema:**
```
http://localhost:3000
```

---

## 👤 Credenciais de Teste

Faça login com a conta demo:

| Campo | Valor |
|-------|-------|
| **Email** | `demo@barberos.app` |
| **Senha** | `demo123` |

---

## 💾 Como Funciona o Salvamento

### 🔐 **Autenticação com Token JWT**
1. Você faz login
2. O sistema gera um token JWT (válido por 30 dias)
3. Esse token é armazenado no `localStorage` do navegador
4. Todas as requisições são autenticadas com esse token

### 📤 **Salvando Dados**
Quando você cria, edita ou deleta qualquer coisa:
1. O navegador envia os dados para o backend
2. O backend valida os dados
3. O backend salva permanentemente no banco SQLite
4. O navegador recebe confirmação

### 📥 **Carregando Dados**
Quando você faz login ou atualiza uma página:
1. O sistema carrega dados do backend
2. Os dados vêm do banco de dados SQLite
3. Aparecem na tela em tempo real

---

## 🎯 Operações Salvas Automaticamente

### ✂️ **Barbeiros**
```
✓ Criar novo barbeiro → Salvo no banco
✓ Editar barbeiro → Atualizado no banco
✓ Deletar barbeiro → Removido do banco
```

### 💇 **Serviços**
```
✓ Criar serviço → Salvo no banco
✓ Editar serviço → Atualizado no banco
✓ Deletar serviço → Removido do banco
```

### 📅 **Agendamentos**
```
✓ Criar agendamento → Salvo no banco + cliente criado
✓ Editar agendamento → Atualizado no banco
✓ Cancelar agendamento → Status alterado no banco
✓ Confirmar agendamento → Status alterado no banco
```

### 👥 **Clientes**
```
✓ Clientes são criados automaticamente ao fazer agendamento
✓ Dados salvos permanentemente
✓ Histórico de visitas rastreado
```

### ⚙️ **Configurações**
```
✓ Horário de funcionamento → Salvo no banco
✓ Identidade visual (cores, logo) → Salvo no banco
✓ Notificações → Salvo no banco
```

---

## 🔄 Fluxo de Dados

```
┌─────────────────┐
│   Navegador     │
│  (seu PC)       │
│                 │
│ app.js + api.js │
└────────┬────────┘
         │ HTTP/REST
         ↓ (com JWT)
┌─────────────────┐
│  Node.js Server │
│  (localhost:3000)
│                 │
│ Express + JWT   │
└────────┬────────┘
         │ Query
         ↓ SQL
┌─────────────────┐
│   SQLite DB     │
│  (barber.db)    │
│                 │
│ 8 tabelas       │
│ Relacionadas    │
└─────────────────┘
```

### Exemplo: Criar Barbeiro

```
1. Você preenche formulário no navegador
2. Clica "Salvar"
3. JavaScript envia POST /api/barbers com dados
4. Backend valida (email, telefone, etc)
5. Backend salva no banco SQLite
6. Backend retorna barbeiro criado + confirmação
7. Seu navegador mostra "✓ Barbeiro adicionado!"
8. Dados aparecem na lista (carregado do banco)
```

---

## ⚡ Importante

### ✅ Dados Persistem Automaticamente
- Quando sair da página → dados salvos
- Quando fechar o navegador → dados salvos
- Quando reiniciar o computador → dados ainda lá!

### 🔒 Segurança
- Senhas são criptografadas com bcrypt
- Cada ação é verificada com JWT
- Sem acesso sem token válido

### 🖥️ Para Sempre

- Seu banco SQLite é arquivo local
- Arquivo: `barber.db` na pasta do projeto
- Backup: Copie `barber.db` para seguro

---

## 🧪 Testando

### Testar Todas as APIs:
```bash
npm run test
```

Isso testa:
- ✓ Health check
- ✓ Login
- ✓ CRUD de Barbeiros
- ✓ CRUD de Serviços
- ✓ CRUD de Clientes
- ✓ CRUD de Agendamentos
- ✓ Configurações
- ✓ Relatórios

---

## 🐛 Troubleshooting

### "Erro de conexão com servidor"
```bash
# Verifique se servidor está rodando
npm start

# Ou use outra porta
PORT=3001 npm start
```

### "Dados não aparecem"
```bash
# Recarregue a página com Ctrl+Shift+R
# Ou verifique o console (F12)
```

### "Banco vazio"
```bash
# Populate banco com dados demo
npm run seed
```

### "Erro de validação"
- Email deve ser válido: `seu@email.com`
- Telefone: `(51) 99999-9999`
- Senha: mínimo 8 caracteres
- Preço: número positivo

---

## 📊 Banco de Dados

### Tabelas Criadas:

1. **users** — Donos de barbearia (nome, email, senha)
2. **barbers** — Barbeiros (nome, comissão, especialidades)  
3. **services** — Serviços (nome, preço, duração)
4. **appointments** — Agendamentos (cliente, data, hora, status)
5. **clients** — Clientes (nome, telefone, email)
6. **configs** — Configurações do dono
7. **identity** — Identidade visual (cores, logo)
8. **finance** — Histórico financeiro (Futura)

### Relacionamentos:

```
users
  ├─ barbers (1:N)
  ├─ services (1:N)
  ├─ appointments (1:N)
  ├─ clients (1:N)
  ├─ configs (1:1)
  └─ identity (1:1)

barbers
  ├─ appointments (1:N)
  
services
  ├─ appointments (1:N)
```

---

## 🎉 Pronto!

Seu sistema agora:
- ✅ Salva todos os dados permanentemente
- ✅ Recupera dados mesmo após reiniciar
- ✅ É totalmente funcional
- ✅ Está pronto para produção

---

## 📞 Próximas Melhorias

### v1.1.0 (Roadmap)
- [ ] Backup automático do banco
- [ ] Sincronizar com Google Calendar
- [ ] Enviar SMS/WhatsApp lembretes
- [ ] App mobile

### v2.0.0 (Roadmap)
- [ ] Migar para PostgreSQL
- [ ] GraphQL API
- [ ] Real-time com WebSockets

---

## 📚 Documentação Relacionada

- [README.md](README.md) — Documentação geral
- [DEPLOYMENT.md](DEPLOYMENT.md) — Deploy em produção
- [INTEGRACAO.md](INTEGRACAO.md) — Exemplos de API
- [PRODUCAO.md](PRODUCAO.md) — Setup produção

---

**Seu sistema está completo e pronto! Todos os dados serão salvos permanentemente no banco! 🚀**
