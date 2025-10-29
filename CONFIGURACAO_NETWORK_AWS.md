# 🌐 Configuração de Rede - Instância AWS

## 📍 Seus IPs

| Tipo | IP | URL |
|------|----|----|
| **IP Público** | 3.83.28.223 | http://3.83.28.223:3000 |
| **IP Privado** | 172.16.80.81 | http://172.16.80.81:3000 |
| **Porta** | 3000 | Aplicação Jira Dashboard |

---

## 🔐 Security Group (Firewall AWS)

Para a aplicação ser acessível, verifique se a porta 3000 está aberta:

### ✅ Verificar Security Group

1. **AWS Console → EC2 → Instances**
2. Selecionar sua instância
3. Clicar em "Security groups"
4. Verificar se existe regra:
   - **Type**: Custom TCP
   - **Protocol**: TCP
   - **Port Range**: 3000
   - **Source**: 0.0.0.0/0 (qualquer IP) ou seu IP específico

### ❌ Se não existir, adicionar regra:

1. **Edit inbound rules**
2. **Add rule**:
   - Type: Custom TCP
   - Port: 3000
   - Source: 0.0.0.0/0 (ou seu IP)
3. **Save rules**

---

## 🔌 Testar Conectividade

### Teste 1: Do seu computador

```bash
# Linux/Mac
curl http://3.83.28.223:3000

# Windows (PowerShell)
Invoke-WebRequest http://3.83.28.223:3000

# Deve retornar o HTML da página
```

### Teste 2: De dentro da instância

```bash
# Conectar via SSH
ssh -i seu-key.pem ec2-user@3.83.28.223

# Dentro da instância, testar localhost
curl http://localhost:3000

# Deve retornar HTML
```

---

## 🧭 Nginx (Opcional - Proxy Reverso)

Se quiser usar domínio ao invés de IP:porta, configure Nginx:

### 1. Instalar Nginx

```bash
sudo apt-get update
sudo apt-get install -y nginx
```

### 2. Configurar

```bash
sudo tee /etc/nginx/sites-available/jira-dashboard << 'EOFNGINX'
server {
    listen 80;
    server_name 3.83.28.223;  # ou seu domínio

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOFNGINX

# Ativar
sudo ln -s /etc/nginx/sites-available/jira-dashboard /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 3. Acessar

```
http://3.83.28.223  (sem :3000)
```

---

## 🚀 URLs de Acesso

### Desenvolvimento (com porta)
```
http://3.83.28.223:3000
http://172.16.80.81:3000
```

### Produção (com Nginx)
```
http://3.83.28.223
http://seu-dominio.com
```

---

## 🔍 Verificar Status da Aplicação

```bash
# SSH na instância
ssh -i seu-key.pem ec2-user@3.83.28.223

# Verificar se está rodando
pm2 status

# Ver logs
pm2 logs jira-dashboard

# Ver porta
lsof -i :3000
```

---

## 📊 Diagrama de Rede

```
Seu Computador
    ↓
Internet
    ↓
AWS Security Group (Firewall)
    ├─ Porta 3000 aberta? ✅
    ↓
EC2 Instance (3.83.28.223)
    ↓
Nginx (localhost:80) [Opcional]
    ↓
Node.js App (localhost:3000)
    ↓
Banco de Dados / APIs Jira
```

---

## ⚙️ Configuração Nginx com SSL (Produção)

Para HTTPS com Let's Encrypt:

```bash
# 1. Instalar Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 2. Gerar certificado
sudo certbot certonly --nginx -d seu-dominio.com

# 3. Atualizar Nginx config
sudo tee /etc/nginx/sites-available/jira-dashboard << 'EOFNGINX'
server {
    listen 80;
    server_name seu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name seu-dominio.com;
    
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
EOFNGINX

# 4. Reiniciar Nginx
sudo systemctl restart nginx
```

---

## 📋 Checklist de Rede

- [ ] Security Group permite porta 3000
- [ ] Aplicação rodando: `pm2 status`
- [ ] Porta aberta: `lsof -i :3000`
- [ ] Teste local: `curl http://localhost:3000`
- [ ] Teste público: `curl http://3.83.28.223:3000`
- [ ] Pode acessar via navegador

---

## 🔗 Links Rápidos

**Acessar Aplicação:**
- http://3.83.28.223:3000

**PM2 Dashboard (se instalado):**
```bash
# Instalar
npm install -g pm2
pm2 web

# Acessar
http://3.83.28.223:9615
```

---

## 📝 Notas

1. **IP Público**: Muda se você parar a instância (use Elastic IP para fixo)
2. **IP Privado**: Sempre o mesmo enquanto instância existe
3. **Porta 3000**: Aplicação Node.js
4. **Porta 80**: Nginx (se instalado)
5. **Porta 443**: HTTPS/SSL

---

**Seu Jira Dashboard está online!** 🎉

IP Público: http://3.83.28.223:3000
IP Privado: http://172.16.80.81:3000

---

**Data**: 28 de Outubro de 2025
**Status**: ✅ Pronto para Uso
