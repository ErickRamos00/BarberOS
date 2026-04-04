# 🚀 Guia de Deployment para Produção

## Antes de Fazer Deploy

### 1. Segurança

#### a) Alterar JWT_SECRET
```bash
# Gerar uma chave segura
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copiar o resultado e adicionar ao .env
JWT_SECRET=seu_valor_aqui_bem_longo_e_aleatorio
```

#### b) Atualizar NODE_ENV
```bash
NODE_ENV=production
```

#### c) Configurar CORS
```bash
# Para seu domínio específico
CORS_ORIGIN=https://seu-dominio.com
```

### 2. Banco de Dados

#### a) Fazer backup (importante!)
```bash
cp barber.db barber.db.backup
```

#### b) Ejecutar seed de dados (opcional)
```bash
npm run seed
```

### 3. Dependências

```bash
# Instalar dependências
npm install

# Verificar vulnerabilidades
npm audit
```

---

## Opção 1: Deploy no Heroku

### Setup Inicial
```bash
# Fazer login
heroku login

# Criar app
heroku create seu-app-name

# Definir variáveis de ambiente
heroku config:set JWT_SECRET=seu_valor_aleatorio_aqui
heroku config:set NODE_ENV=production
heroku config:set CORS_ORIGIN=https://seu-app-name.herokuapp.com

# Ver logs
heroku logs --tail
```

### Deploy
```bash
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

### Banco de dados no Heroku
O SQLite não é recomendado em produção com Heroku (arquivos temporários). Para produção:
1. Use PostgreSQL: `heroku addons:create heroku-postgresql:hobby-dev`
2. Ou use um banco gerenciado externo

---

## Opção 2: Deploy no DigitalOcean

### 1. Criar Droplet
- Escolher Ubuntu 20.04 LTS
- Pelo menos 1GB RAM, 25GB SSD
- SSH key configurada

### 2. Setup Inicial
```bash
# Conectar via SSH
ssh root@seu_ip

# Atualizar sistema
apt update && apt upgrade -y

# Instalar Node.js
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2 (gerenciador de processo)
npm install -g pm2

# Instalar Nginx (reverse proxy)
sudo apt install -y nginx
```

### 3. Configurar Aplicação
```bash
# Clonar repositório (ou fazer upload dos arquivos)
git clone seu-repositorio /home/barberos
cd /home/barberos

# Instalar dependências
npm install

# Criar arquivo .env com configurações
nano .env

# Seed de dados
npm run seed
```

### 4. Configurar PM2
```bash
# Iniciar aplicação
pm2 start server.js --name "barberos"

# Salvar configuração
pm2 save

# Setup startup (inicia ao reboot)
pm2 startup
```

### 5. Configurar Nginx
```bash
# Criar arquivo de configuração
sudo nano /etc/nginx/sites-available/barberos
```

Adicione:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/barberos /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl restart nginx
```

### 6. SSL/HTTPS (Let's Encrypt)
```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Gerar certificado
sudo certbot --nginx -d seu-dominio.com

# Auto-renovação
sudo systemctl enable certbot.timer
```

### 7. Monitoramento
```bash
# Ver logs ao vivo
pm2 logs

# Dashboard PM2
pm2 monit
```

---

## Opção 3: Deploy com Docker

### 1. Criar Dockerfile
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. Criar .dockerignore
```
node_modules
npm-debug.log
barber.db
.env
.git
```

### 3. Build e Run
```bash
# Build
docker build -t barberos:1.0.0 .

# Run
docker run -p 3000:3000 \
  -e JWT_SECRET=seu_valor_aqui \
  -e NODE_ENV=production \
  -v ~/.barberos:/app/barberos \
  barberos:1.0.0
```

---

## Monitoramento e Manutenção

### 1. Verificar Status
```bash
# API Health
curl https://seu-dominio.com/api/health

# Status
curl https://seu-dominio.com/api/status
```

### 2. Logs
```bash
# Tail logs
pm2 logs barberos

# Salvar logs
pm2 flush
```

### 3. Backup do Banco
```bash
# Backup diário
0 2 * * * cp /home/barberos/barber.db /home/barberos/backups/barber_$(date +\%Y\%m\%d).db
```

### 4. Atualizações
```bash
# Parar aplicação
pm2 stop barberos

# Git pull
git pull

# Instalar novos pacotes
npm install --production

# Iniciar
pm2 start server.js --name "barberos"
```

---

## Checklist Final

- [ ] JWT_SECRET alterado em produção
- [ ] NODE_ENV=production configurado
- [ ] CORS_ORIGIN definido corretamente
- [ ] Banco de dados com seed data
- [ ] SSL/HTTPS ativo
- [ ] Logs configurados
- [ ] Backup automático configurado
- [ ] PM2/systemd configurado para auto-start
- [ ] Rate limiting ativo
- [ ] Erro handling funcionando
- [ ] Variáveis de ambiente seguras
- [ ] Teste de health check OK

---

## Troubleshooting

### Erro: EADDRINUSE (porta em uso)
```bash
# Encontrar processo
lsof -i :3000

# Matar processo
kill -9 PID
```

### Erro: EACCES (permissão negada)
```bash
# Usar sudo ou alterar permissões
sudo chown -R $USER:$USER /home/barberos
```

### Erro: ENOENT (arquivo não encontrado)
```bash
# Verificar caminhos absolutos em produção
npm run seed
```

### Erro: 502 Bad Gateway (Nginx)
```bash
# Verificar se aplicação está rodando
pm2 status

# Ver logs
pm2 logs
```

---

## Performance

### 1. Otimizações Node.js
```bash
# Usar Node em cluster mode
NODE_ENV=production pm2 start server.js -i max
```

### 2. Caching
```bash
# Redis (opcional)
npm install redis
```

### 3. Compressão Nginx
```nginx
gzip on;
gzip_types text/plain application/json;
```

---

## Segurança Adicional

### 1. Firewall
```bash
# UFW (Uncomplicated Firewall)
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
```

### 2. Atualizações de Segurança
```bash
# Verificar vulnerabilidades
npm audit

# Atualizar pacotes
npm update
```

### 3. HTTPS Obrigatório
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    return 301 https://$server_name$request_uri;
}
```

---

**Pronto! Seu sistema está em produção! 🎉**

Para dúvidas, consulte README.md ou INTEGRACAO.md
