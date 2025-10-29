# 🐳 Instalação do Docker na AWS

## ⚡ Instalação Rápida (3 Passos)

### Passo 1: SSH na Instância

```bash
ssh -i seu-key.pem ec2-user@3.83.28.223
```

### Passo 2: Instalar Docker

```bash
# Atualizar sistema
sudo apt-get update

# Instalar Docker
sudo apt-get install -y docker.io docker-compose

# Adicionar usuário ao grupo docker (sem sudo depois)
sudo usermod -aG docker $USER

# IMPORTANTE: Logout e login para aplicar
exit
ssh -i seu-key.pem ec2-user@3.83.28.223
```

### Passo 3: Verificar Instalação

```bash
# Verificar Docker
docker --version
# Deve retornar: Docker version X.X.X

# Verificar Docker Compose
docker-compose --version
# Deve retornar: docker-compose version X.X.X
```

---

## 🚀 Deploy (Após Docker Instalado)

```bash
# 1. Entrar no diretório do projeto
cd /home/ssm-user/projetos/jira-dash

# 2. Atualizar código (se estiver usando git)
git pull origin master

# 3. Executar script de deploy
chmod +x deploy-docker.sh
./deploy-docker.sh

# OU manual:
docker-compose up -d

# 4. Verificar status
docker-compose ps

# 5. Ver logs
docker-compose logs -f
```

---

## 🔍 Verificação

```bash
# Status
docker ps

# Logs
docker logs jira-dashboard -f

# Teste
curl http://localhost:3000
```

---

## 📋 Instalação Completa (Detalhada)

Se a rápida não funcionar:

```bash
# 1. SSH
ssh -i seu-key.pem ec2-user@3.83.28.223

# 2. Atualizar
sudo apt-get update
sudo apt-get upgrade -y

# 3. Dependências
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 4. Docker
sudo apt-get install -y docker.io

# 5. Docker Compose
sudo apt-get install -y docker-compose

# 6. Iniciar Docker
sudo systemctl start docker
sudo systemctl enable docker

# 7. Configurar usuário
sudo usermod -aG docker $USER

# 8. Verificar
docker --version
docker-compose --version

# 9. LOGOUT E LOGIN!
exit
ssh -i seu-key.pem ec2-user@3.83.28.223
```

---

## ⚠️ Problemas Comuns

### "docker: command not found"

```bash
# Reinstalar
sudo apt-get remove docker.io
sudo apt-get install -y docker.io

# Ou usar caminho completo
/usr/bin/docker ps
```

### "permission denied while trying to connect to Docker daemon"

```bash
# Adicionar ao grupo
sudo usermod -aG docker $USER

# LOGOUT E LOGIN OBRIGATÓRIO!
exit
ssh -i seu-key.pem ec2-user@3.83.28.223
```

### "docker-compose: command not found"

```bash
# Instalar
sudo apt-get install -y docker-compose

# Ou upgrade
sudo apt-get install --only-upgrade docker-compose
```

### Container não inicia

```bash
# Ver logs
docker logs jira-dashboard

# Limpar e recriar
docker-compose down -v
docker-compose up -d
```

---

## 🎯 Próximos Passos

Após Docker instalado:

```bash
cd /home/ssm-user/projetos/jira-dash

# Executar deploy
./deploy-docker.sh

# Acessar
http://3.83.28.223:3000
```

---

## 📊 Comandos Importantes

```bash
# Status
docker ps
docker-compose ps

# Logs
docker logs jira-dashboard
docker-compose logs -f

# Restart
docker-compose restart

# Parar
docker-compose down

# Limpar tudo
docker system prune -a
```

---

**Data**: 28 de Outubro de 2025
**Status**: ✅ Pronto para Instalar
