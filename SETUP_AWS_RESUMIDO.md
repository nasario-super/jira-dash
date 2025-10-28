# 🚀 DEPLOY NA AWS - Resumido

## ⚡ 3 PASSOS RÁPIDOS

### Passo 1: Clonar e Entrar no Projeto
```bash
cd /home/ssm-user/projetos
git clone https://github.com/seu-usuario/jira-dash.git
cd jira-dash
```

### Passo 2: Executar Script de Deploy
```bash
chmod +x install-and-deploy.sh
./install-and-deploy.sh
```

### Passo 3: Acessar a Aplicação
```
http://seu-ip-da-aws:3000
```

---

## 🔑 Credenciais

**Login**: Use suas credenciais do Jira Cloud
- Email: seu-email@example.com
- API Token: Gerar em https://id.atlassian.com/manage-profile/security/api-tokens

---

## 📊 Verificar Status

```bash
# Ver se está rodando
pm2 list

# Ver logs
pm2 logs jira-dashboard

# Reiniciar se necessário
pm2 restart jira-dashboard
```

---

## 🐛 Se der Erro

### Erro: Cannot find package '@tanstack/react-query'
```bash
npm install @tanstack/react-query --save
```

### Erro: Cannot find package 'vite-plugin-pwa'
```bash
npm install vite-plugin-pwa --save-dev
```

### Erro: npm ERR! code EACCES (Permissão)
```bash
# Configurar npm para não precisar sudo
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

---

## 🔒 IMPORTANTE: Segurança

**NÃO coloque credenciais no .env!**

```bash
# ❌ ERRADO
JIRA_DOMAIN=superlogica.atlassian.net
EMAIL=seu-email@example.com
API_TOKEN=seu-token

# ✅ CERTO - Forneça via login na UI
```

---

## 🎯 Proximos Passos

1. ✅ Deploy realizado
2. ⏭️ Testar login
3. ⏭️ Selecionar projetos
4. ⏭️ Verificar dashboard
5. ⏭️ Configurar Nginx (opcional, para domínio)

---

**Suporte**: Verifique `pm2 logs jira-dashboard` para erros
