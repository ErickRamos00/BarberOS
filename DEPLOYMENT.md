# 🚀 Guia de Deployment Profissional

## Pré-Publicação - Checklist

Antes de publicar seu BarberOS em produção, verifique:

- [ ] Todos os testes passando (`npm run test`)
- [ ] Variáveis de ambiente configuradas (`.env.production`)
- [ ] JWT_SECRET alterado para uma chave segura
- [ ] Banco de dados com backup
- [ ] SSL/HTTPS configurado no servidor
- [ ] CORS_ORIGIN restrito a domínios permitidos
- [ ] Node.js versão 14+ instalada no servidor
- [ ] PM2 ou similar para process management
- [ ] Nginx/Apache como reverse proxy
- [ ] Firewall configurado corretamente
- [ ] Logs configurados
- [ ] Backup automático do banco de dados

---

## Opção 1: DigitalOcean App Platform (Recomendado para Iniciantes)

### Passo 1: Preparar o Repositório

```bash
# Inicializar Git (se não houver)
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/seu-usuario/barberos.git
git push -u origin main
```

### Passo 2: Criar App no DigitalOcean

1. Acesse [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
2. Clique em "Create Apps"
3. Conecte seu GitHub
4. Selecione o repositório `barberos`
5. Configure:
   - **Name**: `barberos-app`
   - **Environment**: `Node.js`
   - **GitHub Branch**: `main`
   - **Build Command**: `npm install`
   - **Run Command**: `npm start`

### Passo 3: Variáveis de Ambiente

1. Na seção "Environment", adicione:
   ```
   NODE_ENV=production
   JWT_SECRET=gere-uma-chave-secreta
   DATABASE_PATH=/mnt/data/barber.db
   CORS_ORIGIN=https://seu-app.ondigitalocean.app
   ```

2. Configure volume persistente para o banco:
   - Mount path: `/mnt/data`
   - Size: 5GB (ajuste conforme necessário)

### Passo 4: Deploy

1. Clique em "Deploy"
2. Aguarde 5-10 minutos
3. Seu app estará em: `https://seu-app.ondigitalocean.app`

---

## Opção 2: Heroku (Fácil e Gratuito até Determinado Uso)

### Passo 1: Instalar Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows (via npm)
npm install -g heroku

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

### Passo 2: Deploy

```bash
# Login
heroku login

# Criar app
heroku create seu-app-barberos

# Configurar variáveis
heroku config:set NODE_ENV=production -a seu-app-barberos
heroku config:set JWT_SECRET=$(openssl rand -base64 32) -a seu-app-barberos
heroku config:set CORS_ORIGIN=https://seu-app-barberos.herokuapp.com -a seu-app-barberos

# Deploy
git push heroku main

# Abrir app
heroku open -a seu-app-barberos

# Ver logs
heroku logs --tail -a seu-app-barberos
```

**Nota**: Heroku armazena dados em memória. Para persistência, adicione um add-on como PostgreSQL.

---

## Opção 3: VPS Linux (DigitalOcean, Linode, AWS EC2, etc)

### Passo 1: Provisionar Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 (gerenciador de processos)
sudo npm install -g pm2

# Instalar Nginx (reverse proxy)
sudo apt install -y nginx

# Instalar Certbot (SSL gratuito)
sudo apt install -y certbot python3-certbot-nginx
```

### Passo 2: Configurar Aplicação

```bash
# Clonar repositório
cd /var/www
sudo git clone https://github.com/seu-usuario/barberos.git
cd barberos

# Instalar dependências
npm install

# Copiar configuração de produção
cp .env.production .env
sudo nano .env  # Editar variáveis importantes

# Criar diretório para banco de dados
sudo mkdir -p /var/barberos/data
sudo chown $USER:$USER /var/barberos/data

# Ajustar DATABASE_PATH no .env
# DATABASE_PATH=/var/barberos/data/barber.db
```

### Passo 3: Configurar PM2

```bash
# Iniciar com PM2
pm2 start server.js --name "barberos" --env production

# Configurar para iniciar no boot
pm2 startup
pm2 save

# Ver status
pm2 status
pm2 logs barberos
```

### Passo 4: Configurar Nginx

```bash
# Criar arquivo de configuração
sudo nano /etc/nginx/sites-available/barberos
```

Adicione:

```nginx
upstream barberos {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    location / {
        proxy_pass http://barberos;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar configuração
sudo ln -s /etc/nginx/sites-available/barberos /etc/nginx/sites-enabled/

# Testar
sudo nginx -t

# Restart
sudo systemctl restart nginx
```

### Passo 5: SSL com Let's Encrypt

```bash
# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Renovação automática (já está configurada)
sudo certbot renew --dry-run
```

### Passo 6: Backup Automático

```bash
# Criar script de backup
sudo nano /usr/local/bin/barberos-backup.sh
```

Adicione:

```bash
#!/bin/bash
BACKUP_DIR="/backups/barberos"
DB_FILE="/var/barberos/data/barber.db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp $DB_FILE $BACKUP_DIR/barber.db.$TIMESTAMP
gzip $BACKUP_DIR/barber.db.$TIMESTAMP

# Manter apenas últimos 30 dias
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup concluído em $TIMESTAMP"
```

```bash
# Tornar executável
sudo chmod +x /usr/local/bin/barberos-backup.sh

# Adicionar ao cron (backup diário às 2 da manhã)
sudo crontab -e
# Adicione: 0 2 * * * /usr/local/bin/barberos-backup.sh
```

---

## Opção 4: Docker (Para Ambiente Containerizado)

### Passo 1: Criar Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci --only=production

# Copiar código
COPY . .

# Criar diretório de dados
RUN mkdir -p /app/data

# Expor porta
EXPOSE 3000

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/barber.db

# Comando para iniciar
CMD ["npm", "start"]
```

### Passo 2: Criar docker-compose.yml

```yaml
version: '3.8'

services:
  barberos:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      JWT_SECRET: ${JWT_SECRET}
      DATABASE_PATH: /app/data/barber.db
      CORS_ORIGIN: ${CORS_ORIGIN}
    volumes:
      - barberos-data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - barberos
    restart: unless-stopped

volumes:
  barberos-data:
```

### Passo 3: Deploy com Docker

```bash
# Build
docker-compose build

# Run
docker-compose up -d

# Logs
docker-compose logs -f barberos

# Stop
docker-compose down
```

---

## Monitoramento e Manutenção

### Verificar Saúde da Aplicação

```bash
# Status do PM2
pm2 status
pm2 logs barberos

# Tamanho do banco
du -h /var/barberos/data/barber.db

# Uso de memória
pm2 monit

# Reiniciar se necessário
pm2 restart barberos
```

### Atualizar Código

```bash
# Pull das mudanças
cd /var/www/barberos
git pull origin main

# Reinstalar dependências
npm install

# Restart
pm2 restart barberos
```

### Troubleshooting

```bash
# Erro: "Porta 3000 em uso"
sudo lsof -i :3000
sudo kill -9 <PID>

# Erro: "Permissão negada" no banco
sudo chmod 666 /var/barberos/data/barber.db
sudo chown $USER:$USER /var/barberos/data

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/error.log

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

## Performance e Otimização

### Ativar Gizp Compression

No `server.js`, adicione:

```javascript
const compression = require('compression');
app.use(compression());
```

### Aumentar Limite de Conexões

```bash
# Aumentar file descriptors
ulimit -n 65536
```

### Cache de Produções

Configure headers de cache no Nginx:

```nginx
location ~* ^.+\.(css|js|image|png|gif|jpeg|jpg|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## Segurança em Produção

### Configurar Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Manter Atualizado

```bash
# Atualizar Node.js
sudo apt update && sudo apt upgrade -y

# Audit de dependências
npm audit
npm audit fix
```

### Headers de Segurança

No `server.js`, adicione:

```javascript
const helmet = require('helmet');
app.use(helmet());
```

---

## Suporte

Para dúvidas ou problemas durante o deployment:
- Abra uma issue no GitHub
- Envie email para suporte@barberos.app
- Consulte a documentação do Node.js oficial

**Bom deployment! 🚀**
