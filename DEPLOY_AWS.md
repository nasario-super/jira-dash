# 🚀 DEPLOY NA AWS - Guia Completo

## 🔧 Pré-Requisitos Instalados

Na instância EC2 você precisa ter:
- **Node.js**: `node --version` (v18+)
- **npm**: `npm --version` (v9+)
- **Git**: `git --version`

---

## 📋 PASSO 1: Clonar o Repositório

```bash
cd /home/ssm-user/projetos
git clone https://github.com/seu-usuario/jira-dash.git
cd jira-dash
```

---

## 📋 PASSO 2: Instalar Dependências

```bash
# Instalar todas as dependências (incluindo @tanstack/react-query e vite-plugin-pwa)
npm install

# Verificar que todas foram instaladas
npm list @tanstack/react-query
npm list vite-plugin-pwa
```

---

## 📋 PASSO 3: Build para Produção

```bash
# Compilar TypeScript e Vite
npm run build

# Verificar que o build foi bem-sucedido
ls -la dist/
```

---

## 📋 PASSO 4: Servir com Node.js (Opção 1 - Simples)

```bash
# Instalar um servidor web simples
npm install -g serve

# Rodar o build
serve -s dist -l 3000
```

---

## 📋 PASSO 5: Configurar com PM2 (Opção 2 - Recomendado para Produção)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Criar arquivo pm2.config.js
cat > pm2.config.js << 'EOFPM2'
module.exports = {
  apps: [
    {
      name: 'jira-dashboard',
      script: 'serve',
      args: '-s dist -l 3000',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
EOFPM2

# Iniciar com PM2
pm2 start pm2.config.js

# Salvar config do PM2 para iniciar automaticamente ao reiniciar
pm2 startup
pm2 save
```

---

## 📋 PASSO 6: Configurar Nginx como Reverse Proxy (Recomendado)

```bash
# Instalar Nginx
sudo apt-get update
sudo apt-get install -y nginx

# Criar config do Nginx
sudo tee /etc/nginx/sites-available/jira-dashboard << 'EOFNGINX'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOFNGINX

# Ativar config
sudo ln -s /etc/nginx/sites-available/jira-dashboard /etc/nginx/sites-enabled/

# Remover config padrão
sudo rm /etc/nginx/sites-enabled/default

# Testar config
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

## 📋 PASSO 7: Configurar .env em Produção

```bash
# Criar arquivo .env
cat > .env << 'EOFENV'
# Nota: Em produção, as credenciais devem ser fornecidas via login,
# não via variáveis de ambiente!
# Não adicione JIRA_DOMAIN, EMAIL ou API_TOKEN aqui!

# Opcional: URLs de logging, analytics, etc
VITE_API_URL=https://seu-dominio.com
VITE_ENABLE_LOGS=true
EOFENV
```

---

## 🔒 SEGURANÇA - IMPORTANTE!

### ❌ NÃO FAÇA ISSO:
```bash
# NÃO exponha credenciais em .env ou variáveis de ambiente!
JIRA_DOMAIN=superlogica.atlassian.net
EMAIL=seu-email@example.com
API_TOKEN=seu-api-token
```

### ✅ FAÇA ASSIM:
1. Usuário faz login na UI
2. Fornece credenciais na tela de login
3. Sistema armazena em `authStore` (localStorage)
4. Requisições usam as credenciais do usuário logado

---

## 📊 VERIFICAR SE ESTÁ RODANDO

```bash
# Ver processos do PM2
pm2 list

# Ver logs em tempo real
pm2 logs jira-dashboard

# Ver status
pm2 status

# Verificar se porta 3000 está aberta
lsof -i :3000

# Testar acesso
curl http://localhost:3000

# Verificar erro 404 no Nginx
curl -v http://localhost:80
```

---

## 🔄 ATUALIZAR CÓDIGO EM PRODUÇÃO

```bash
# 1. Ir ao diretório do projeto
cd /home/ssm-user/projetos/jira-dash

# 2. Puxar atualizações
git pull origin main

# 3. Reinstalar dependências (se package.json mudou)
npm install

# 4. Fazer build
npm run build

# 5. Reiniciar aplicação
pm2 restart jira-dashboard

# 6. Verificar logs
pm2 logs jira-dashboard
```

---

## 🐛 TROUBLESHOOTING

### Erro: "Cannot find package '@tanstack/react-query'"
```bash
npm install @tanstack/react-query --save
```

### Erro: "Cannot find package 'vite-plugin-pwa'"
```bash
npm install vite-plugin-pwa --save-dev
```

### Erro: "Build failed"
```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Aplicação lenta ou travando
```bash
# Aumentar memória do Node
NODE_OPTIONS="--max-old-space-size=2048" npm run build

# Ou via PM2
pm2 start pm2.config.js --node-args="--max-old-space-size=2048"
```

### Nginx retorna 502 Bad Gateway
```bash
# Verificar se aplicação está rodando
pm2 list

# Verificar logs
pm2 logs jira-dashboard

# Reiniciar
pm2 restart jira-dashboard
```

---

## 📈 MONITORAMENTO EM PRODUÇÃO

```bash
# Monitorar uso de CPU e memória
pm2 monit

# Salvar logs em arquivo
pm2 logs jira-dashboard > /tmp/jira-logs.txt

# Analisar erros
pm2 logs jira-dashboard --err
```

---

## 🚀 CHECKLIST FINAL

- [ ] Node.js v18+ instalado
- [ ] npm install executado com sucesso
- [ ] npm run build executado sem erros
- [ ] Servidor rodando em :3000
- [ ] Nginx configurado apontando para :3000
- [ ] Acesso via http://ip-da-instancia
- [ ] Login funciona
- [ ] Seleção de projetos funciona
- [ ] Dashboard exibe dados
- [ ] PM2 salvo para autostart

---

## 📞 SUPORTE

Se tiver erro:
1. Verifique `pm2 logs jira-dashboard`
2. Verifique `sudo systemctl status nginx`
3. Verifique se porta 3000 está aberta: `lsof -i :3000`
4. Verifique credenciais Jira fornecidas no login

---

**Data**: 28 de Outubro de 2025
**Versão**: 1.0
**Status**: ✅ Pronto para Deploy
