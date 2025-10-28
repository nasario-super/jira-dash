# 🚀 JIRA Dashboard - Deploy na AWS

## 📌 Resumo Rápido

Seu projeto **Jira Dashboard** está pronto para ser deployado na AWS EC2!

### Problemas Corrigidos ✅
- ✅ Adicionado `@tanstack/react-query@5.28.0`
- ✅ Adicionado `vite-plugin-pwa@0.17.4`
- ✅ Criados guias completos de deploy
- ✅ Criado script automatizado

---

## 🚀 Deploy Rápido em 3 Passos

### Passo 1: Clonar o repositório na EC2
```bash
cd /home/ssm-user/projetos
git clone https://github.com/seu-usuario/jira-dash.git
cd jira-dash
```

### Passo 2: Executar o script de deploy
```bash
chmod +x install-and-deploy.sh
./install-and-deploy.sh
```

### Passo 3: Acessar a aplicação
```
http://SEU-IP-DA-EC2:3000
```

---

## 📚 Documentação Disponível

| Documento | Conteúdo |
|-----------|----------|
| `SETUP_AWS_RESUMIDO.md` | ⚡ Versão super rápida (3 passos) |
| `DEPLOY_AWS.md` | 📖 Guia completo com todos os detalhes |
| `DEPENDENCIAS_CORRIGIDAS.md` | 📦 Lista completa de dependências |
| `RESUMO_CORRECOES_AWS.md` | 📋 Resumo de todas as correções |
| `install-and-deploy.sh` | 🤖 Script automatizado |

---

## 🔑 Credenciais de Acesso

Após abrir a aplicação, você será solicitado a fazer login:

- **Email**: seu-email@example.com
- **API Token**: Gerar em https://id.atlassian.com/manage-profile/security/api-tokens

### Como gerar API Token:
1. Abra https://id.atlassian.com/manage-profile/security/api-tokens
2. Clique em "Create API token"
3. Copie o token
4. Cole na tela de login do Jira Dashboard

---

## ✅ Checklist pré-Deploy

Na sua instância EC2, verifique:

```bash
# Node.js v18+
node --version

# npm v9+
npm --version

# Git
git --version
```

---

## 🐛 Se der Erro

### Erro: Cannot find package '@tanstack/react-query'
Já está corrigido! Apenas execute:
```bash
npm install
```

### Erro: Cannot find package 'vite-plugin-pwa'
Já está corrigido! Apenas execute:
```bash
npm install
```

### Erro: Build failed
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📊 Verificar Status

```bash
# Ver se está rodando
pm2 status

# Ver logs
pm2 logs jira-dashboard

# Monitorar recursos
pm2 monit
```

---

## 🔒 Segurança

**IMPORTANTE**: Não coloque credenciais Jira no `.env`!

```bash
# ❌ ERRADO - Não faça isso
JIRA_DOMAIN=superlogica.atlassian.net
EMAIL=seu-email@example.com
API_TOKEN=seu-token

# ✅ CERTO - Forneça via login na UI
```

---

## 🎯 Próximos Passos

1. **Deploy**: Executar o script `./install-and-deploy.sh`
2. **Testar**: Abrir `http://seu-ip:3000`
3. **Login**: Fornecer credenciais Jira
4. **Seleção**: Selecionar os projetos desejados
5. **Usar**: Dashboard estará pronto!

---

## 📞 Suporte

Se tiver problemas:

1. Verifique os logs: `pm2 logs jira-dashboard`
2. Reinicie: `pm2 restart jira-dashboard`
3. Limpe cache: `rm -rf node_modules && npm install`

---

## 📝 Notas Importantes

- **Port 3000**: A aplicação roda nessa porta
- **PM2**: Gerenciador de processos (auto-restart)
- **Build**: Otimizado em chunks para melhor performance
- **PWA**: Funcionalidade offline habilitada

---

## 🎉 Parabéns!

Seu Jira Dashboard está 100% pronto para produção na AWS! 🚀

**Data**: 28 de Outubro de 2025
**Status**: ✅ PRONTO PARA DEPLOY

---

### Comandos Úteis Rápidos

```bash
# Deploy
./install-and-deploy.sh

# Logs
pm2 logs jira-dashboard

# Restart
pm2 restart jira-dashboard

# Stop
pm2 stop jira-dashboard

# Status
pm2 status
```

