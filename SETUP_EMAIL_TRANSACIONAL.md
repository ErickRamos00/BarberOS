# 📧 GUIA: ENVIAR EMAIL PARA QUALQUER PESSOA

## ✨ O Que Foi Resolvido

Agora o sistema funciona para **QUALQUER EMAIL**, não apenas para um fixo!

Você tem **3 opções grátis** para escolher:

---

## 🎯 OPÇÃO 1: MAILGUN (⭐ RECOMENDADO)

**Melhor para: Iniciantes, desenvolvimento rápido**
- Grátis para sempre em desenvolvimento
- 300 emails/dia grátis
- Configuração em 5 minutos

### ✅ Setup (5 minutos)

1. **Criar conta em:** https://www.mailgun.com/
2. **Confirmar email** (vai chegar um link)
3. **Criar API Key:**
   - Vá em: **Settings** → **API Keys**
   - Copie a **Private API Key**
4. **Copiar Domain:**
   - Vá em: **Sending** → **Domains**
   - Copie o domínio (tipo: `sandboxa123bc.mailgun.org`)
5. **Colar no `.env`:**
   ```env
   EMAIL_PROVIDER=mailgun
   MAILGUN_API_KEY=key-abc123xyz
   MAILGUN_DOMAIN=sandboxa123bc.mailgun.org
   MAILGUN_FROM=noreply@seu-dominio.mailgun.org
   ```
6. **Reiniciar servidor:** `node server.js`

### 🧪 Teste
```bash
node test-email.js
```

---

## 🎯 OPÇÃO 2: SENDGRID

**Melhor para: Produção, confiabilidade**
- Grátis: 100 emails/dia
- Popular, usado por grandes empresas
- Ótimo suporte

### ✅ Setup (5 minutos)

1. **Criar conta em:** https://sendgrid.com/
2. **Confirmar email**
3. **Criar API Key:**
   - Vá em: **Settings** → **API Keys**
   - Clique em **Create API Key**
   - Selecione: **Full Access**
   - Copie a chave
4. **Colar no `.env`:**
   ```env
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=SG.abc123xyz...
   ```
5. **Reiniciar servidor**

---

## 🎯 OPÇÃO 3: BREVO (Sendinblue)

**Melhor para: Brasileiro, suporte em português**
- Grátis: 300 emails/dia
- Empresa francesa com data center em SP
- Suporte em português

### ✅ Setup (5 minutos)

1. **Criar conta em:** https://www.brevo.com/
2. **Confirmar email**
3. **Criar API Key:**
   - Vá em: **Settings** → **SMTP & API**
   - Clique em **Create a new API key**
   - Nome: `barberos`
   - Copie a chave
4. **Colar no `.env`:**
   ```env
   EMAIL_PROVIDER=brevo
   BREVO_API_KEY=sua-api-key-aqui
   ```
5. **Reiniciar servidor**

---

## 📋 Como Funciona Agora

### Antes (Inválido):
```
Usuario A tenta receber código
↓
Email fixo configurado: seu-email@gmail.com
↓
❌ Não funciona! Só você recebe
```

### Depois (Funciona):
```
Usuario A tenta receber código
↓
Chama API do Mailgun/SendGrid/Brevo
↓
✅ Email chega no usuario A

Usuario B tenta receber código
↓
Chama API do Mailgun/SendGrid/Brevo
↓
✅ Email chega no usuario B
```

---

## 🧪 Testar Agora

### 1. Escolha um provedor acima
### 2. Configure o `.env`
### 3. Reinicie o servidor

```bash
# Terminal
node server.js
```

### 4. Teste o envio

**PowerShell:**
```powershell
$email = "seu-email-real@gmail.com"
$body = @{"email"=$email; "purpose"="verificacao"} | ConvertTo-Json

curl -Method Post `
  -Uri "http://localhost:3000/api/auth/send-code" `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

**Linux/Mac:**
```bash
curl -X POST http://localhost:3000/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"email":"seu-email@gmail.com","purpose":"verificacao"}'
```

### 5. Verifique a caixa de email

Você deve receber:
- 📧 De: noreply@barberos.app
- 📝 Assunto: "Seu código de verificação: 123456"
- 🎨 Template HTML profissional com código destacado

---

## ✅ Checklist

- [ ] Escolheu um provedor (Mailgun, SendGrid ou Brevo)
- [ ] Criou conta no provedor
- [ ] Gerou API Key
- [ ] Preencheu `.env` com as credenciais
- [ ] Reiniciou o servidor
- [ ] Testou envio de código
- [ ] Recebeu email na caixa de entrada

---

## 🚀 Próximos Passos

Agora qualquer pessoa pode:

1. ✅ **Se registrar** → Recebe email de boas-vindas
2. ✅ **Solicitar código** → Recebe código de verificação
3. ✅ **Fazer login** → Com o código de verificação
4. ✅ **Reativa cliente** → Recebe alerta por email

---

## 🆘 Troubleshooting

### "Email não chega"
- Verifique **Spam/Lixo** no Gmail
- Talvez precise confirmar o sender no provedor
- Verifique logs do servidor: `node server.js`

### "Error: credenciais inválidas"
- Copie novamente a API Key do provedor
- Verifique se está no `.env` sem espaços extras
- Reinicie o servidor

### "Cannot find module 'axios'"
- Execute: `npm install axios`
- Reinicie o servidor

---

**Pronto?** 🎉  
Escolha um provedor acima e configure agora!
