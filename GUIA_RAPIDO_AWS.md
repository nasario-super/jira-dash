# 🚀 GUIA RÁPIDO - Deploy + HTTPS na AWS

## ✅ PRÉ-REQUISITOS
- ✅ Código compilado (build feito localmente)
- ✅ Git sincronizado
- ✅ Conectado na instância AWS via SSH

---

## 📋 PASSO A PASSO (15 minutos)

### 1️⃣ CLONAR/ATUALIZAR CÓDIGO (2 min)

```bash
# Se for primeira vez:
cd /home/ssm-user
git clone https://github.com/nasario-super/jira-dash.git
cd jira-dash

# Se já existe:
cd /home/ssm-user/jira-dash
git pull origin master
```

### 2️⃣ INSTALAR DEPENDÊNCIAS (3 min)

```bash
npm install
```

### 3️⃣ COMPILAR (2 min)

```bash
npm run build
```

Resultado esperado:
```
✓ built in 17.12s
```

### 4️⃣ PARAR APLICAÇÃO ANTERIOR (1 min)

```bash
# Se usar PM2:
pm2 stop all

# Se usar systemd:
sudo systemctl stop jira-dashboard

# Se usar nohup:
pkill -f "serve -s dist"
```

### 5️⃣ INICIAR APLICAÇÃO (1 min)

```bash
# Opção A: PM2 (recomendado)
pm2 start "npm run serve" --name jira-dashboard

# Opção B: Systemd (mais robusto)
sudo systemctl restart jira-dashboard

# Opção C: Nohup (simples)
nohup npm run serve &
```

### 6️⃣ CONFIGURAR HTTPS + NGINX (6 min)

```bash
# Copiar arquivo Nginx
sudo cp /tmp/nginx-jira-dashboard.conf /etc/nginx/sites-available/jira-dashboard

# Copiar certificado (se não existir)
sudo mkdir -p /etc/ssl/certs /etc/ssl/private
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/jira-dashboard.key \
  -out /etc/ssl/certs/jira-dashboard.crt \
  -subj "/C=BR/ST=SP/L=Sao Paulo/O=Superlogica/CN=3.83.28.223"

# Ativar site
sudo ln -sf /etc/nginx/sites-available/jira-dashboard /etc/nginx/sites-enabled/jira-dashboard
sudo rm -f /etc/nginx/sites-enabled/default

# Testar e iniciar
sudo nginx -t
sudo systemctl restart nginx
```

---

## ✅ VERIFICAR SE FUNCIONOU

### 1. Verificar Nginx
```bash
sudo systemctl status nginx
sudo nginx -t
```

### 2. Verificar aplicação
```bash
# Verificar porta 3000 (local)
lsof -i :3000

# Verificar porta 443 (HTTPS)
lsof -i :443
```

### 3. Testar HTTPS
```bash
# Na máquina local:
curl -k https://3.83.28.223

# Resultado esperado: HTML da aplicação
```

### 4. Abrir no navegador
```
https://3.83.28.223
```

⚠️ Aceitar aviso de certificado (é normal com certificado auto-assinado)

---

## 📊 MONITORAR

### Logs Nginx
```bash
# Access log
sudo tail -f /var/log/nginx/jira-dashboard-access.log

# Error log
sudo tail -f /var/log/nginx/jira-dashboard-error.log
```

### Logs Aplicação
```bash
# PM2
pm2 logs jira-dashboard

# Systemd
sudo journalctl -u jira-dashboard -f

# Nohup
tail -f nohup.out
```

---

## 🔐 VERIFICAR SEGURANÇA

### HTTPS está funcionando?
```bash
curl -I https://3.83.28.223 | grep -i strict
# Deve retornar: strict-transport-security
```

### Certificado é válido?
```bash
openssl s_client -connect 3.83.28.223:443 -brief
```

### Credenciais aparecem no tráfego?
```bash
# Com Wireshark, você NÃO deve ver credenciais em plain text
# Tudo deve estar criptografado (TLS)
```

---

## ⚠️ PROBLEMAS COMUNS

### "Connection refused"
```bash
# Verificar se aplicação está rodando
pm2 list
lsof -i :3000

# Reiniciar
pm2 restart jira-dashboard
```

### "Bad Gateway" (502)
```bash
# Nginx não consegue conectar na aplicação
# Verificar se app está na porta 3000
lsof -i :3000

# Verificar logs Nginx
sudo tail -20 /var/log/nginx/jira-dashboard-error.log
```

### Certificado expirado
```bash
# Certificado dura 365 dias
# Renovar:
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/jira-dashboard.key \
  -out /etc/ssl/certs/jira-dashboard.crt \
  -subj "/C=BR/ST=SP/L=Sao Paulo/O=Superlogica/CN=3.83.28.223"

sudo systemctl restart nginx
```

---

## 📝 CHECKLIST FINAL

- [ ] Código atualizado (git pull)
- [ ] Dependências instaladas (npm install)
- [ ] Build compilado (npm run build)
- [ ] Aplicação rodando (port 3000)
- [ ] Nginx configurado (sites-enabled)
- [ ] Certificado gerado (/etc/ssl/certs)
- [ ] HTTPS respondendo (443)
- [ ] Headers de segurança presentes
- [ ] Time de segurança validou ✅

---

**Tempo total: ~15 minutos**

---

Data: 29 de Outubro de 2025
Status: ✅ PRONTO
