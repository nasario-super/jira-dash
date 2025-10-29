# 🔴 CORREÇÃO CRÍTICA: Exposição de Credenciais em Tráfego

## ⚠️ PROBLEMA IDENTIFICADO

### O QUE ESTÁ ACONTECENDO

Credenciais Jira (email + API Token) estão sendo transmitidas em **texto plano** (HTTP) no tráfego de rede:

```
HTTP (sem criptografia)
├─ Email: seu-email@example.com ❌ EXPOSTO
├─ API Token: seu-token-12345... ❌ EXPOSTO
├─ Básico Auth Header ❌ VISÍVEL
└─ Todas as requisições ❌ NÃO ENCRIPTADAS
```

### IMPACTOS

🔴 **Crítico**:
- Qualquer pessoa na rede pode capturar credenciais (Man-in-the-Middle)
- Atacantes podem impersonificar o usuário
- Acesso não autorizado ao Jira
- Vazamento de dados do projeto

---

## ✅ SOLUÇÃO 1: ATIVAR HTTPS/SSL URGENTEMENTE

### Passo 1: Gerar Certificado SSL (Let's Encrypt - Gratuito)

Na instância AWS:

```bash
# 1. Instalar Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 2. Gerar certificado (substitua seu-dominio.com)
sudo certbot certonly --standalone -d seu-dominio.com

# OU se usar Nginx:
sudo certbot certonly --nginx -d seu-dominio.com

# OU para IP (se não tiver domínio):
# Usar self-signed (menos seguro, mas melhor que HTTP)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/jira-dashboard.key \
  -out /etc/ssl/certs/jira-dashboard.crt
```

### Passo 2: Configurar Nginx com HTTPS

```bash
sudo tee /etc/nginx/sites-available/jira-dashboard << 'EOFNGINX'
# Redirecionar HTTP para HTTPS
server {
    listen 80;
    server_name 3.83.28.223 seu-dominio.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS (seguro)
server {
    listen 443 ssl http2;
    server_name 3.83.28.223 seu-dominio.com;

    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    # Configurações SSL seguras
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Headers de segurança
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # ✅ Não logar credenciais
        proxy_set_header Authorization $http_authorization;
    }
}
EOFNGINX

# Ativar config
sudo ln -s /etc/nginx/sites-available/jira-dashboard /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default 2>/dev/null
sudo nginx -t
sudo systemctl restart nginx
```

### Resultado

```
❌ ANTES: http://3.83.28.223:3000 (inseguro)
✅ DEPOIS: https://seu-dominio.com (seguro)
```

---

## ✅ SOLUÇÃO 2: PROTEGER CREDENCIAIS NO CÓDIGO

### Modificação no Frontend - LoginForm.tsx

```typescript
// ANTES (❌ Inseguro - credenciais em request direto)
const response = await fetch('/api/jira/rest/api/2/myself', {
  headers: {
    'Authorization': `Basic ${btoa(email + ':' + apiToken)}`  // ❌ Exposto
  }
});

// DEPOIS (✅ Seguro - credenciais no backend)
const response = await fetch('/api/auth/validate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',  // ✅ Enviar cookies seguros
  body: JSON.stringify({
    email,
    apiToken
    // ❌ NÃO enviar credenciais direto
  })
});
```

### Novo Arquivo: Backend Gateway (Node.js Express)

```javascript
// src/server/auth-gateway.js
import express from 'express';
import fetch from 'node-fetch';
import session from 'express-session';
import https from 'https';

const app = express();

// ✅ Sessão segura
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,        // ✅ HTTPS only
    httpOnly: true,      // ✅ Não acessível via JS
    sameSite: 'strict',  // ✅ CSRF protection
    maxAge: 1000 * 60 * 60 * 24  // 24 horas
  }
}));

app.post('/api/auth/validate', async (req, res) => {
  const { email, apiToken } = req.body;

  try {
    // ✅ Armazenar credenciais APENAS na sessão do servidor
    req.session.jiraCredentials = {
      email,
      apiToken,
      domain: process.env.JIRA_DOMAIN
    };

    // Validar contra Jira (servidor para servidor = seguro)
    const jiraUrl = `https://${process.env.JIRA_DOMAIN}/rest/api/2/myself`;
    const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');

    const response = await fetch(jiraUrl, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });

    if (response.ok) {
      const userData = await response.json();
      res.json({
        success: true,
        user: {
          name: userData.displayName,
          email: userData.emailAddress
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Proxy seguro para requisições autenticadas
app.post('/api/jira/search', async (req, res) => {
  if (!req.session.jiraCredentials) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { jql } = req.body;
  const { email, apiToken, domain } = req.session.jiraCredentials;

  try {
    const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
    const response = await fetch(
      `https://${domain}/rest/api/3/search/jql?jql=${encodeURIComponent(jql)}`,
      {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Request failed' });
  }
});

app.listen(3001, () => {
  console.log('Auth gateway rodando em :3001 (apenas interno)');
});
```

---

## ✅ SOLUÇÃO 3: DOCKER COM HTTPS

### docker-compose.yml Atualizado

```yaml
version: '3.8'

services:
  jira-dashboard:
    build: .
    ports:
      - "3000:3000"  # Apenas interno
    restart: always
    environment:
      - NODE_ENV=production
      - SESSION_SECRET=seu-secret-aleatorio
      - JIRA_DOMAIN=${JIRA_DOMAIN}
    networks:
      - internal

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro  # Certificados
    depends_on:
      - jira-dashboard
    restart: always
    networks:
      - internal

networks:
  internal:
    driver: bridge
```

---

## ✅ SOLUÇÃO 4: HEADERS DE SEGURANÇA

### Vite Config - vite.config.ts

```typescript
export default defineConfig({
  server: {
    headers: {
      // ✅ Proteção contra Man-in-the-Middle
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      
      // ✅ Proteção contra Clickjacking
      'X-Frame-Options': 'SAMEORIGIN',
      
      // ✅ Proteção contra XSS
      'X-XSS-Protection': '1; mode=block',
      'X-Content-Type-Options': 'nosniff',
      
      // ✅ CORS restritivo
      'Access-Control-Allow-Origin': 'https://seu-dominio.com',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Expose-Headers': 'Set-Cookie'
    }
  }
});
```

---

## ✅ SOLUÇÃO 5: AUDIT LOG

### Registrar tentativas de login

```typescript
// src/services/securityAudit.ts

export async function logLoginAttempt(
  email: string,
  success: boolean,
  ipAddress: string
) {
  const timestamp = new Date().toISOString();
  
  const logEntry = {
    timestamp,
    event: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
    user: email,
    ipAddress,
    userAgent: navigator.userAgent
  };

  // Enviar para servidor
  await fetch('/api/security/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(logEntry)
  });

  console.log('🔐 Audit:', logEntry);
}
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Imediato (Hoje)

- [ ] Instalar Certbot: `sudo apt-get install -y certbot`
- [ ] Gerar certificado: `sudo certbot certonly --standalone -d seu-dominio.com`
- [ ] Configurar Nginx com HTTPS (ver acima)
- [ ] Testar: `https://seu-dominio.com`
- [ ] Redirecionar HTTP → HTTPS

### Curto Prazo (1-2 dias)

- [ ] Implementar backend auth gateway
- [ ] Mover credenciais para sessão do servidor
- [ ] Remover credenciais do frontend
- [ ] Adicionar headers de segurança
- [ ] Testar com ferramentas de segurança (curl, Wireshark)

### Médio Prazo (1-2 semanas)

- [ ] Audit log de logins
- [ ] Detecção de anomalias
- [ ] 2FA (Two-Factor Authentication)
- [ ] Rotação de tokens

---

## 🧪 COMO VERIFICAR SE ESTÁ SEGURO

### Teste 1: Verificar HTTPS

```bash
# Deve retornar HTTPS
curl -I https://seu-dominio.com
# Procure por: HTTP/2 200 (ou 301 redirect)

# HTTP deve redirecionar
curl -I http://seu-dominio.com
# Deve retornar: 301 Moved Permanently
```

### Teste 2: Verificar Headers

```bash
curl -I https://seu-dominio.com | grep -i strict-transport
# Deve retornar: Strict-Transport-Security: max-age=31536000
```

### Teste 3: Com Wireshark

1. Abrir Wireshark
2. Capturar tráfego
3. Filtrar por "jira-dashboard"
4. **Antes (❌)**: Ver credenciais em texto
5. **Depois (✅)**: Ver apenas TLS encriptado

### Teste 4: SSL Labs

Visite https://www.ssllabs.com/ssltest/
- Digitar seu domínio
- Score deve ser **A** ou **A+**

---

## 🔒 BOAS PRÁTICAS ADICIONAIS

### 1. Não Armazenar Tokens em localStorage

```typescript
// ❌ ERRADO
localStorage.setItem('apiToken', token);

// ✅ CERTO - Usar cookie httpOnly
// (servidor define automaticamente)
```

### 2. Usar CORS Restritivo

```typescript
// ❌ ERRADO
Access-Control-Allow-Origin: *

// ✅ CERTO
Access-Control-Allow-Origin: https://seu-dominio.com
```

### 3. Timeout de Sessão

```typescript
// Sessão expira após 24 horas
cookie: {
  maxAge: 1000 * 60 * 60 * 24  // 24h
}

// Ou mais restritivo para dados sensíveis
maxAge: 1000 * 60 * 15  // 15 minutos
```

### 4. Renovação de Tokens

```bash
# Renovar certificado Let's Encrypt (automático)
sudo certbot renew --dry-run

# Ou manual
sudo certbot renew
```

---

## 📊 ANTES vs DEPOIS

### ❌ ANTES (INSEGURO)

```
Cliente                    Internet                   Jira
   │                          │                        │
   │ HTTP (texto plano)       │                        │
   ├─ email@domain.com ────→ ❌ VISÍVEL ─────────→    │
   ├─ api-token-12345 ────→ ❌ VISÍVEL ─────────→    │
   │ Basic Auth exposed       │                        │
   │ (qualquer pode capturar) │                        │
```

### ✅ DEPOIS (SEGURO)

```
Cliente                    Internet                   Jira
   │                          │                        │
   │ HTTPS (encriptado)       │                        │
   ├─ ════════════════════╗   │                        │
   │  TLS/SSL Tunnel      ║   │                        │
   │ (credentials seguro) ╚═══→ Credenciais ────────→  │
   │ (servidor-para-servidor)  │                       │
```

---

## 🚨 TESTE DE SEGURANÇA FINAL

Após implementar, execute:

```bash
# 1. Verificar porta 3000 não está exposta
lsof -i :3000
# Deve retornar: LISTEN 127.0.0.1:3000 (apenas local)

# 2. Verificar Nginx está redirecionando
curl -I http://3.83.28.223:3000
# Deve retornar: 403 Forbidden (porta bloqueada) ou redirecionamento

# 3. Verificar HTTPS funciona
curl https://seu-dominio.com
# Deve retornar conteúdo (sem erro SSL)

# 4. Verificar headers
curl -I https://seu-dominio.com | grep -i "security\|strict"
# Deve retornar múltiplos headers de segurança
```

---

## 📞 PRÓXIMOS PASSOS

1. **URGENTE**: Implementar HTTPS/SSL hoje
2. **Hoje**: Testar que credenciais não aparecem em tráfego
3. **Amanhã**: Implementar auth gateway
4. **Dia 3**: Audit log e monitoramento
5. **Semana 2**: 2FA e rotação de tokens

---

## 🎯 RESULTADO ESPERADO

Após implementação:
- ✅ HTTPS ativo (cadeado verde)
- ✅ Credenciais em tráfego: NUNCA
- ✅ Sessão segura (cookie httpOnly)
- ✅ Headers de segurança ativos
- ✅ Certificado valido (Let's Encrypt)
- ✅ Score SSL Labs: A ou A+

---

**CRÍTICO**: Implementar HOJE!
**Data**: 28 de Outubro de 2025
**Prioridade**: 🔴 CRÍTICA
