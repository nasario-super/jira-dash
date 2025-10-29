# 🐳 Docker para Produção - Jira Dashboard

## 🎯 Vantagens do Docker

✅ **Isolamento**: App rodar em container isolado
✅ **Consistência**: Funciona igual em dev e produção
✅ **Facilidade**: Deploy com 1 comando
✅ **Escalabilidade**: Fácil escalar com múltiplos containers
✅ **Segurança**: Não instala pacotes desnecessários
✅ **Performance**: Multi-stage build = imagem pequena (~200MB)

---

## 📋 Pré-Requisitos na AWS

```bash
# 1. SSH na instância
ssh -i seu-key.pem ec2-user@3.83.28.223

# 2. Instalar Docker
sudo apt-get update
sudo apt-get install -y docker.io

# 3. Instalar Docker Compose
sudo apt-get install -y docker-compose

# 4. Verificar instalação
docker --version
docker-compose --version

# 5. Adicionar usuário ao grupo docker (sem sudo)
sudo usermod -aG docker $USER
# Logout e login para aplicar
```

---

## 🚀 Deploy com Docker - 3 Passos

### Passo 1: Preparar Código

```bash
# Na sua máquina local (ou na instância)
cd /home/ssm-user/projetos/jira-dash

# Garantir que package-lock.json existe
npm install --package-lock-only

# Commit (se usar git)
git add Dockerfile docker-compose.yml .dockerignore
git commit -m "feat: adicionar Docker para produção"
git push origin master
```

### Passo 2: Build da Imagem

```bash
# Na instância AWS
cd /home/ssm-user/projetos/jira-dash

# Build da imagem Docker
docker build -t jira-dashboard:latest .

# Vai levar ~3-5 minutos
```

### Passo 3: Rodar Container

```bash
# Opção 1: Rodar com Docker Compose (RECOMENDADO)
docker-compose up -d

# Opção 2: Rodar diretamente com docker
docker run -d \
  --name jira-dashboard \
  -p 3000:3000 \
  --restart always \
  jira-dashboard:latest

# Verificar status
docker ps
```

---

## 📊 Verificar se está Funcionando

```bash
# Ver containers rodando
docker ps

# Ver logs
docker logs jira-dashboard -f

# Ver detalhes do container
docker inspect jira-dashboard

# Parar container
docker stop jira-dashboard

# Iniciar novamente
docker start jira-dashboard

# Remover container (se precisar)
docker rm jira-dashboard
```

---

## 🔄 Atualizar Código em Produção com Docker

```bash
# 1. Pull do código novo
cd /home/ssm-user/projetos/jira-dash
git pull origin master

# 2. Rebuild da imagem
docker build -t jira-dashboard:latest .

# 3. Parar container antigo
docker-compose down

# 4. Rodar novo container
docker-compose up -d

# 5. Ver logs
docker logs jira-dashboard -f
```

---

## 🧪 Testar Localmente Antes de Mandar para AWS

```bash
# No seu computador
cd /home/seu-usuario/projetos/jira-dash

# Build local
docker build -t jira-dashboard:local .

# Rodar
docker run -d -p 3000:3000 --name jira-test jira-dashboard:local

# Testar
curl http://localhost:3000

# Ver logs
docker logs jira-test -f

# Limpar
docker stop jira-test
docker rm jira-test
```

---

## 🔐 Variáveis de Ambiente no Docker

Se precisar de variáveis de ambiente:

### docker-compose.yml atualizado:

```yaml
services:
  jira-dashboard:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - VITE_API_URL=https://sua-api.com
      - LOG_LEVEL=info
    restart: always
```

### Ou arquivo .env:

```bash
# .env
NODE_ENV=production
VITE_API_URL=https://sua-api.com
```

```bash
# Usar no docker-compose
docker-compose --env-file .env up -d
```

---

## 📊 Monitoramento do Container

```bash
# Ver recursos (CPU, memória)
docker stats jira-dashboard

# Ver histórico de logs
docker logs jira-dashboard

# Últimas 100 linhas
docker logs jira-dashboard -n 100

# Follow (em tempo real)
docker logs jira-dashboard -f

# Com timestamp
docker logs jira-dashboard -t
```

---

## 🔧 Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker logs jira-dashboard

# Testar build
docker build -t jira-dashboard:test .

# Rodar interativo para debug
docker run -it jira-dashboard:test sh
```

### Porta já em uso

```bash
# Ver qual processo usa porta 3000
sudo lsof -i :3000

# Matar processo
kill -9 <PID>

# Ou mudar porta no docker-compose
ports:
  - "8080:3000"  # Acesso via 8080
```

### Sem espaço em disco

```bash
# Limpar imagens não usadas
docker image prune -a

# Limpar containers parados
docker container prune

# Limpar volumes não usados
docker volume prune

# Limpar tudo
docker system prune -a
```

---

## 🚀 Nginx como Proxy Reverso (Opcional)

Se quiser melhor performance com Nginx:

### nginx.conf:

```nginx
upstream jira-dashboard {
    server jira-dashboard:3000;
}

server {
    listen 80;
    server_name 3.83.28.223;

    location / {
        proxy_pass http://jira-dashboard;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### docker-compose.yml com Nginx:

```yaml
version: '3.8'

services:
  jira-dashboard:
    build: .
    restart: always
    environment:
      - NODE_ENV=production

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - jira-dashboard
    restart: always
```

### Rodar:

```bash
docker-compose up -d
# Acessar: http://3.83.28.223 (sem :3000)
```

---

## 📋 Checklist Docker

- [ ] Docker instalado: `docker --version`
- [ ] Docker Compose instalado: `docker-compose --version`
- [ ] Dockerfile criado
- [ ] .dockerignore criado
- [ ] docker-compose.yml criado
- [ ] Build funcionou: `docker build -t jira-dashboard:latest .`
- [ ] Container rodando: `docker ps`
- [ ] Acessível: `curl http://localhost:3000`
- [ ] Logs limpos: `docker logs jira-dashboard`
- [ ] Restart automático: `restart: always`

---

## 🎯 Comandos Principais

```bash
# Build
docker build -t jira-dashboard:latest .

# Rodar com docker-compose
docker-compose up -d

# Ver status
docker-compose ps
docker ps

# Logs
docker-compose logs -f
docker logs jira-dashboard -f

# Parar
docker-compose down

# Reiniciar
docker-compose restart

# Remover tudo
docker-compose down -v
```

---

## 📊 Tamanho da Imagem

Multi-stage build garante imagem pequena:

```
Base Alpine:       ~50MB
Node 18 Alpine:    ~150MB
Build deps:        ~300MB (apenas no build)
Final image:       ~200-250MB
```

Muito melhor que sem multi-stage (~800MB+)

---

## 🔒 Segurança

✅ **Non-root user** (segurança)
✅ **Alpine base** (menor superfície de ataque)
✅ **Sem dev dependencies** em produção
✅ **Healthcheck** para detectar problemas
✅ **Restart policy** automático

---

## 📈 Escalabilidade Futura

Se precisar rodar múltiplos containers:

```bash
# Rodar 3 instâncias
docker run -d -p 3001:3000 jira-dashboard:latest
docker run -d -p 3002:3000 jira-dashboard:latest
docker run -d -p 3003:3000 jira-dashboard:latest

# Com Nginx load balancing entre elas
```

---

## 🎉 Resultado Final

Seu Jira Dashboard em **Docker**:
- ✅ Production-ready
- ✅ Fácil de atualizar
- ✅ Escalável
- ✅ Seguro
- ✅ Monitorável

---

**Data**: 28 de Outubro de 2025
**Status**: ✅ Pronto para Docker
**Performance**: ⚡ Otimizado
