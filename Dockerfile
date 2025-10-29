# Stage 1: Build
FROM node:18-alpine as builder

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código
COPY . .

# Build da aplicação
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Instalar serve para servir arquivos estáticos
RUN npm install -g serve pm2

# Copiar arquivos do build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Instalar dependências de produção apenas
RUN npm ci --only=production

# Expor porta
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Comando para iniciar
CMD ["serve", "-s", "dist", "-l", "3000"]
