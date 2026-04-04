# ===== Estágio de Build =====
FROM node:18-alpine AS builder

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci --only=production

# ===== Estágio de Produção =====
FROM node:18-alpine

WORKDIR /app

# Instalar dumb-init (para correto signal handling)
RUN apk add --no-cache dumb-init

# Copiar node_modules do builder
COPY --from=builder /app/node_modules ./node_modules

# Copiar código
COPY . .

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Criar diretório de dados com permissões corretas
RUN mkdir -p /app/data && \
    chown -R nodejs:nodejs /app

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expor porta
EXPOSE 3000

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/barber.db

# Usar dumb-init para iniciar a aplicação
ENTRYPOINT ["/sbin/dumb-init", "--"]

# Comando para iniciar
CMD ["node", "server.js"]
