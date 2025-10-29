# 🔒 HTTPS COM CERTIFICADO AUTO-ASSINADO (Sem Domínio)

## ✅ SOLUÇÃO PARA AMBIENTE CORPORATIVO

Se você não tem domínio, use certificado **auto-assinado** que é perfeitamente válido para:
- ✅ Ambiente corporativo/interno
- ✅ IP fixo (3.83.28.223)
- ✅ Protege tráfego igual ao Let's Encrypt
- ✅ Sem custo
- ⚠️ Navegador mostra aviso (normal)

---

## 🚀 GERAR CERTIFICADO AUTO-ASSINADO (10 MINUTOS)

### Passo 1: SSH na Instância

```bash
ssh -i seu-key.pem ec2-user@3.83.28.223
```

### Passo 2: Gerar Certificado

```bash
# Virar root
sudo su -

# Criar diretórios
mkdir -p /etc/ssl/private
mkdir -p /etc/ssl/certs

# Gerar certificado auto-assinado (válido por 365 dias)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/jira-dashboard.key \
  -out /etc/ssl/certs/jira-dashboard.crt \
  -subj "/C=BR/ST=SP/L=Sao Paulo/O=SeuEmpresa/CN=3.83.28.223"

# Verificar se foi criado
ls -la /etc/ssl/private/jira-dashboard.key
ls -la /etc/ssl/certs/jira-dashboard.crt

# Definir permissões
chmod 600 /etc/ssl/private/jira-dashboard.key
chmod 644 /etc/ssl/certs/jira-dashboard.crt
```

### Passo 3: Criar Arquivo Nginx

```bash
# Criar configuração Nginx com HTTPS
cat > /etc/nginx/sites-available/jira-dashboard << 'EOFNGINX'
# Redirecionar HTTP para HTTPS
server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
}

# HTTPS (seguro com certificado auto-assinado)
server {
    listen 443 ssl http2;
    server_name _;

    # Certificados SSL auto-assinados
    ssl_certificate /etc/ssl/certs/jira-dashboard.crt;
    ssl_certificate_key /etc/ssl/private/jira-dashboard.key;

    # Configurações SSL seguras
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Headers de segurança
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Proxy para aplicação
    location / {
        proxy_pass http://localhost:3000;
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
EOFNGINX

# Verificar arquivo
cat /etc/nginx/sites-available/jira-dashboard
```

### Passo 4: Ativar Nginx

```bash
# Remover config padrão
rm /etc/nginx/sites-enabled/default

# Ativar nova config
ln -s /etc/nginx/sites-available/jira-dashboard /etc/nginx/sites-enabled/

# Testar sintaxe
nginx -t
# Deve retornar: OK

# Iniciar/Reiniciar Nginx
systemctl start nginx
systemctl enable nginx  # Auto-start
systemctl restart nginx

# Verificar status
systemctl status nginx
```

### Passo 5: Verificar Portas

```bash
# Verificar que nginx está ouvindo
netstat -tlnp | grep nginx
# Deve mostrar:
# LISTEN 0.0.0.0:80
# LISTEN 0.0.0.0:443

# Sair de root
exit
```

---

## 🧪 TESTAR HTTPS (10 SEGUNDOS)

### Do seu Computador

```bash
# Teste 1: HTTPS funciona
curl -k https://3.83.28.223
# Deve retornar HTML (ignore cert warning)

# Teste 2: HTTP redireciona
curl -I http://3.83.28.223
# Deve retornar: 301 (redirect)

# Teste 3: Ver certificado
openssl s_client -connect 3.83.28.223:443 -showcerts
# Deve mostrar: self-signed (OK)
```

### No Navegador

1. Abrir: `https://3.83.28.223:3000`
2. ⚠️ Verá aviso: "Conexão não é privada"
3. 👉 Clique: "Avançado" → "Prosseguir mesmo assim"
4. ✅ Dashboard abre normalmente
5. 🔒 URL muda para `https://3.83.28.223`

---

## 🔒 DIAGRAMA DE FLUXO

```
Navegador (seu-ip)
    ↓
    ├─→ http://3.83.28.223 (80)
    │        ↓
    │   Nginx redireciona
    │        ↓
    ├─→ https://3.83.28.223 (443)
    │        ↓
    │   TLS Handshake
    │   (certificado auto-assinado)
    │        ↓
    │   Tráfego ENCRIPTADO 🔒
    │        ↓
    └─→ Node.js App (3000)
         ↓
    Credenciais PROTEGIDAS
```

---

## 📊 SEGURANÇA DO CERTIFICADO AUTO-ASSINADO

### ✅ PROTEGE CONTRA

| Tipo de Ataque | Proteção |
|---|---|
| **Sniffing** | ✅ Tráfego encriptado |
| **Man-in-the-Middle** | ✅ TLS 1.2/1.3 |
| **Credenciais em texto** | ✅ Base64 encriptado |
| **Sessão hijacking** | ✅ Cookie seguro |
| **Phishing direto** | ✅ HTTPS obrigatório |

### ⚠️ LIMITAÇÃO

- ❌ Não protege contra "self-signed cert warning"
  - Solução: Seus usuários clicam "Prosseguir"
  - Normal em ambiente corporativo
  - Pode adicionar à "exceção" do navegador

---

## 🔄 RENOVAR CERTIFICADO (ANUAL)

Certificado válido por 365 dias. Para renovar depois de 1 ano:

```bash
sudo su -

# Gerar novo certificado
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/jira-dashboard.key \
  -out /etc/ssl/certs/jira-dashboard.crt \
  -subj "/C=BR/ST=SP/L=Sao Paulo/O=SeuEmpresa/CN=3.83.28.223"

# Reiniciar Nginx
systemctl restart nginx

# Verificar
curl -k https://3.83.28.223
```

---

## 📋 CHECKLIST RÁPIDO

- [ ] SSH na instância
- [ ] Gerar certificado (openssl)
- [ ] Criar arquivo Nginx
- [ ] Ativar Nginx config
- [ ] Testar: `curl -k https://3.83.28.223`
- [ ] Abrir navegador e aceitar certificado
- [ ] Testar login

---

## 🎯 DEPOIS DISTO

1. ✅ HTTPS ativo
2. ✅ Credenciais protegidas
3. ⏭️ Deploy Docker (próximo)
4. ⏭️ Auth Gateway (próximo)

---

## 📞 PROBLEMAS COMUNS

### "Connection refused"
```bash
# Verificar Nginx
sudo systemctl status nginx

# Reiniciar
sudo systemctl restart nginx

# Ver logs
sudo tail -f /var/log/nginx/error.log
```

### "Nginx permission denied"
```bash
# Verificar permissões
sudo chmod 644 /etc/ssl/certs/jira-dashboard.crt
sudo chmod 600 /etc/ssl/private/jira-dashboard.key

# Reiniciar
sudo systemctl restart nginx
```

### "SSL handshake failed"
```bash
# Regenerar certificado
sudo su -
rm /etc/ssl/certs/jira-dashboard.crt
rm /etc/ssl/private/jira-dashboard.key

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/jira-dashboard.key \
  -out /etc/ssl/certs/jira-dashboard.crt

systemctl restart nginx
```

---

## 🚀 PASSO A PASSO COMPLETO (COPIAR/COLAR)

```bash
# 1. SSH
ssh -i seu-key.pem ec2-user@3.83.28.223

# 2. Virar root
sudo su -

# 3. Criar certificado
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/jira-dashboard.key \
  -out /etc/ssl/certs/jira-dashboard.crt \
  -subj "/C=BR/ST=SP/L=Sao Paulo/O=Empresa/CN=3.83.28.223"

# 4. Permissões
chmod 600 /etc/ssl/private/jira-dashboard.key
chmod 644 /etc/ssl/certs/jira-dashboard.crt

# 5. Config Nginx (copiar todo o bloco abaixo)
cat > /etc/nginx/sites-available/jira-dashboard << 'EOFNGINX'
server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name _;
    ssl_certificate /etc/ssl/certs/jira-dashboard.crt;
    ssl_certificate_key /etc/ssl/private/jira-dashboard.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
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

# 6. Ativar
rm /etc/nginx/sites-enabled/default 2>/dev/null
ln -s /etc/nginx/sites-available/jira-dashboard /etc/nginx/sites-enabled/

# 7. Testar e iniciar
nginx -t
systemctl start nginx
systemctl enable nginx
systemctl restart nginx

# 8. Sair de root
exit

# 9. Testar (do seu computador)
# curl -k https://3.83.28.223
```

---

**Status**: ✅ Pronto para implementar
**Tempo**: 15 minutos
**Segurança**: ✅ Equivalente a Let's Encrypt (criptografia)
**Próximo**: Docker + Auth Gateway

