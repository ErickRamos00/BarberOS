# 📧 SISTEMA DE AUTENTICAÇÃO POR EMAIL

## ✨ Novas Funcionalidades

Adicionamos **autenticação por código de verificação via email** ao sistema BarberOS. Agora você pode:

- ✅ Login com código em vez de senha
- ✅ Verificação de email no registro
- ✅ Envio automático de boas-vindas
- ✅ Alertas de reativação por email
- ✅ Suporte a 4 provedores de email

---

## 🚀 Como Usar

### 1️⃣ Login com Código

**Frontend:**
```javascript
// Passo 1: Usuário insere email
const email = "usuario@email.com";
const response1 = await fetch('/api/auth/send-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, purpose: 'login' })
});

// Passo 2: Usuário insere código recebido
const code = "123456";
const response2 = await fetch('/api/auth/verify-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, code })
});

const data = await response2.json();
localStorage.setItem('token', data.token);
// Redirecionar para dashboard
```

---

### 2️⃣ Registro com Verificação

**Frontend:**
```javascript
const userData = {
  name: "João Silva",
  email: "joao@email.com",
  phone: "11999999999",
  shop_name: "Barbearia do João",
  password: "senha123456"
};

const response = await fetch('/api/auth/register-with-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(userData)
});

const data = await response.json();
// Guardar token
localStorage.setItem('token', data.token);
// Mostrar tela de verificação
```

---

## ⚙️ Configuração

### Arquivo `.env`

```env
# Email Provider
EMAIL_PROVIDER=gmail  # ou: outlook, smtp, test
EMAIL_USER=seu-email@gmail.com
EMAIL_PASSWORD=sua-app-password
EMAIL_FROM=noreply@barberos.app
```

### Gmail (Passo a Passo)

1. **Ativar 2FA:**
   - Acesse: https://myaccount.google.com/security
   - Habilite "Verificação em duas etapas"

2. **Gerar App Password:**
   - Acesse: https://myaccount.google.com/apppasswords
   - Selecione "Mail" e "Windows"
   - Copie a senha gerada

3. **Configurar .env:**
   ```env
   EMAIL_PROVIDER=gmail
   EMAIL_USER=seu-email@gmail.com
   EMAIL_PASSWORD=xxxxxxxxxxx (16 caracteres)
   ```

### Outlook

```env
EMAIL_PROVIDER=outlook
EMAIL_USER=seu-email@outlook.com
EMAIL_PASSWORD=sua-senha
```

### Servidor SMTP Customizado

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=mail.seu-servidor.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-usuario
SMTP_PASSWORD=sua-senha
```

---

## 📄 Arquivos Criar Novos

### `src/services/email.js` (Criado ✅)
- Gerencia envio de emails
- Suporta 4 provedores
- Templates HTML profissionais
- Armazenamento de códigos

### `src/routes/auth.js` (Modificado ✅)
- 3 novos endpoints
- Integração com email
- Verificação de código

### `.env` (Modificado ✅)
- Variáveis de email
- Configurações de provider

---

## 🔌 Endpoints API

### `POST /api/auth/send-code`
Enviar código de verificação

**Request:**
```json
{
  "email": "usuario@email.com",
  "purpose": "login"  // ou "verificacao"
}
```

**Response:**
```json
{
  "message": "Código enviado com sucesso",
  "email": "usuario@email.com",
  "expiresIn": 900
}
```

**Erros:**
- `400` - Email não fornecido
- `400` - Email não cadastrado (para login)
- `500` - Erro ao enviar email

---

### `POST /api/auth/verify-code`
Verificar código e fazer login

**Request:**
```json
{
  "email": "usuario@email.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "message": "Login bem-sucedido",
  "user": {
    "id": 1,
    "email": "usuario@email.com",
    "name": "Nome",
    "shop": "Minha Barbearia",
    "slug": "minha-barbearia"
  },
  "token": "eyJhbGc..."
}
```

**Erros:**
- `400` - Código inválido/expirado
- `400` - Muitas tentativas
- `400` - Usuário não encontrado

---

### `POST /api/auth/register-with-code`
Registrar novo usuário com verificação

**Request:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "11999999999",
  "shop_name": "Barbearia do João",
  "password": "senha123456"
}
```

**Response:**
```json
{
  "message": "Usuário registrado com sucesso",
  "user": { ... },
  "token": "eyJhbGc...",
  "requiresVerification": true,
  "verificationSent": true
}
```

---

## 📧 Templates de Email

### 1. **Código de Verificação**
- Template HTML profissional
- Código destacado em grande
- Aviso de segurança
- Link para dashboard

### 2. **Email de Boas-vindas**
- Enviado ao registrar
- Lista de funcionalidades
- Link de acesso
- Branding BarberOS

### 3. **Alerta de Reativação**
- Enviado automaticamente
- Destaca cliente inativo
- Motiva ação de reativação

---

## 🔒 Segurança

### Proteções Implementadas

✅ **Códigos com Expiração**
- Válidos por 15 minutos
- Autodestruem ao verificar

✅ **Limite de Tentativas**
- Máximo 5 tentativas
- Bloqueia após limite

✅ **Armazenamento Seguro**
- Códigos NÃO salved no banco
- Armazenamento em memória
- Não aparecem em logs

✅ **Validação de Email**
- Email deve existir para login
- Verifica duplicatas no registro

✅ **Headers de Segurança**
- CORS configurado
- JWT com expiração

---

## 🧪 Testes

### Teste Local (Sem Email Real)

Os códigos são gerados e armazenados em memória:

```bash
# Gerar código
curl -X POST http://localhost:3000/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"email":"test@email.com","purpose":"login"}'

# Verificar código (use o código gerado acima)
curl -X POST http://localhost:3000/api/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{"email":"test@email.com","code":"123456"}'
```

### Teste com VS Code

Abra `API_EMAIL_TESTS.http` e use a extensão "REST Client" (ms-vscode.rest-client)

---

## 🐛 Solução de Problemas

### "Erro ao enviar email"

**Causa 1:** Credenciais inválidas
```bash
# Verificar .env
cat .env | grep EMAIL
```

**Causa 2:** Gmail sem app password
- Vá em: https://myaccount.google.com/apppasswords
- Gere uma nova app password
- Não use a senha do Gmail

**Causa 3:** Porta SMTP bloqueada
- Provider SMTP pode bloquear porta 587
- Tente porta 465 (SMTP Seguro)

### "Código expirou"
- Regenere o código: `/send-code` novamente
- Código válido por 15 minutos

### "Muitas tentativas"
- Aguarde e solicite novo código
- Limite de 5 tentativas por segurança

---

## 🚀 Próximas Funcionalidades

- [ ] Integrar UI de login com código
- [ ] Trocas de senha por email
- [ ] Recuperação de conta
- [ ] 2FA com email
- [ ] Notificações de segurança

---

**Última atualização:** Abril 2026  
**Status:** ✅ Pronto para produção  
**Versão:** 2.1 (com email)
