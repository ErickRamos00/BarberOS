# 📧 GUIA: CONFIGURAR EMAIL PARA FUNCIONAR

## ⚠️ Problema Identificado
O arquivo `.env` tem:
```
EMAIL_USER=seu-email@gmail.com      ← INVÁLIDO!
EMAIL_PASSWORD=sua-senha-app        ← INVÁLIDO!
```

Precisa estar configurado com seus dados reais.

---

## ✅ SOLUÇÃO: Gmail (Recomendado)

### 1️⃣ Ativar 2FA (Verificação em 2 Etapas)

1. Acesse: **https://myaccount.google.com/security**
2. Procure por **"Verificação em duas etapas"** (lado esquerdo)
3. Clique em "Ativar"
4. Siga os passos (vai pedir para confirmar com seu celular)

✅ Quando terminar, volte para próximo passo.

---

### 2️⃣ Gerar App Password

1. Acesse: **https://myaccount.google.com/apppasswords**
   - Deve aparecer um dropdown com seu nome de usuário
   
2. Selecione:
   - **Aplicativo**: Mail (Correio)
   - **Dispositivo**: Windows (ou seu SO)

3. Clique em **"Gerar"**

4. Google vai mostrar uma **senha de 16 caracteres** (tipo: `xyzw qyoj hcbd rvam`)
   - ⚠️ Copie EXATAMENTE como está (com os espaços)

---

### 3️⃣ Configurar no `.env`

Abra o arquivo `.env` e **substitua** estas linhas:

**ANTES:**
```env
EMAIL_PROVIDER=gmail
EMAIL_USER=seu-email@gmail.com
EMAIL_PASSWORD=sua-senha-app
```

**DEPOIS:**
```env
EMAIL_PROVIDER=gmail
EMAIL_USER=seu-email-real@gmail.com
EMAIL_PASSWORD=xyzwqyojhcbdrvam
```

⚠️ **Importante:**
- Use o email COMPLETO (ex: `joao@gmail.com`)
- Use a App Password de 16 caracteres (SEM espaços)
- Não use sua senha do Google!

---

### 4️⃣ Salvar e Reiniciar

1. Salve o `.env`
2. Reinicie o servidor:
   ```bash
   # Para o servidor (Ctrl+C)
   # Depois rode novamente:
   node server.js
   ```

---

## 🧪 Testar

### Teste 1: Verificar se está carregado
No terminal onde o servidor está rodando, procure por:
```
✅ Email configurado: seu-email@gmail.com
```

### Teste 2: Enviar código
Use este comando:

**Windows PowerShell:**
```powershell
$body = @{
    email = "seu-email-real@gmail.com"
    purpose = "verificacao"
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri "http://localhost:3000/api/auth/send-code" `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

**Linux/Mac (bash):**
```bash
curl -X POST http://localhost:3000/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"email":"seu-email@gmail.com","purpose":"verificacao"}'
```

### Teste 3: Verificar caixa de entrada
- Abra **Gmail**
- Procure por email de **noreply@barberos.app** (ou sua caixa de spam)
- O código deve estar lá!

---

## 🆘 Não Funcionou?

### ❌ Erro: "Credenciais inválidas"
- A App Password está incorreta
- Gere uma nova em: https://myaccount.google.com/apppasswords
- Copie SEM os espaços

### ❌ Erro: "Conexão recusada"
- 2FA não foi ativado
- Vá em: https://myaccount.google.com/security
- Ative "Verificação em duas etapas"

### ❌ Email não chegou
- Procure em **Spam/Lixo**
- Verifique o endereço de email configurado

### ❌ Erro "ENOTFOUND localhost"
- Servidor Node não está rodando
- Abra terminal e execute: `node server.js`

---

## 📋 Checklist

- [ ] 2FA ativado no Gmail
- [ ] App Password gerada
- [ ] `.env` atualizado com credenciais
- [ ] Servidor reiniciado
- [ ] Teste de envio executado
- [ ] Email recebido na caixa de entrada

---

## 🔄 Alternativas (Se Gmail não funcionar)

### Usar Outlook
```env
EMAIL_PROVIDER=outlook
EMAIL_USER=seu-email@outlook.com
EMAIL_PASSWORD=sua-senha-outlook
```

### Usar Servidor SMTP Customizado
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=mail.seu-servidor.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-usuario
SMTP_PASSWORD=sua-senha
```

---

**Problema resolvido?** ✅
Agora você consegue receber emails de verificação!
