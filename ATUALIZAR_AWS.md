# 🚀 Como Atualizar o Código na Instância AWS

## ⚡ Passo Rápido (Se já tem repo clonado)

```bash
cd /home/ssm-user/projetos/jira-dash

# 1. Atualizar código
git pull origin master

# 2. Instalar novas dependências (se houver)
npm install

# 3. Fazer build
npm run build

# 4. Reiniciar aplicação
pm2 restart jira-dashboard

# 5. Ver logs
pm2 logs jira-dashboard
```

---

## 📋 Detalhes da Atualização

### Correção Mais Recente (28 de Outubro)

**Problema**: Erro "Jira configuration is missing" na inicialização
**Solução**: Permitir inicialização sem credenciais (virão do login)

**Arquivos atualizados**:
- `src/services/jiraApi.ts` ✅
- `src/services/jiraApiReal.ts` ✅
- `src/services/jiraApiAlternative.ts` ✅

### O que mudou:
- ❌ Antes: Lançava erro se sem credenciais
- ✅ Depois: Apenas avisa, permite inicializar normalmente

---

## 🔄 Processo Completo de Atualização

Se estiver sem repositório:

```bash
cd /home/ssm-user/projetos
git clone https://github.com/seu-usuario/jira-dash.git
cd jira-dash
chmod +x install-and-deploy.sh
./install-and-deploy.sh
```

Se já tem repositório:

```bash
cd /home/ssm-user/projetos/jira-dash
git pull origin master
npm install
npm run build
pm2 restart jira-dashboard
```

---

## 📊 Verificar Após Atualização

```bash
# Status
pm2 status

# Logs (últimas 50 linhas)
pm2 logs jira-dashboard -n 50

# Monitorar em tempo real
pm2 logs jira-dashboard

# Reiniciar se necessário
pm2 restart jira-dashboard
```

---

## 🧪 Testar Após Atualização

1. Abrir `http://seu-ip:3000` no navegador
2. ✅ Deve abrir página de login sem erros
3. ✅ Login com credenciais Jira
4. ✅ Selecionar projetos
5. ✅ Dashboard deve exibir dados

---

## ⚠️ Se Tiver Problemas

### Erro: Build failed
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
pm2 restart jira-dashboard
```

### Erro: Port already in use
```bash
pm2 stop jira-dashboard
pm2 delete jira-dashboard
pm2 start pm2.config.js
```

### Erro: Git not found
```bash
sudo apt-get install git
cd /home/ssm-user/projetos/jira-dash
git pull origin master
```

### Erro: npm not found
```bash
# Verificar instalação
node --version
npm --version

# Se não tiver, instalar
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## 📈 Commands Úteis

```bash
# Ver versão do node
node --version

# Ver versão do npm
npm --version

# Listar branches
git branch -a

# Ver histórico de commits
git log --oneline -5

# Ver status do repositório
git status

# Ver diferenças
git diff

# Cancelar mudanças locais
git checkout -- .

# Limpar todos os arquivos não rastreados
git clean -fd
```

---

## 🔒 Segurança

**Nunca coloque credenciais no `.env`!**

```bash
# ❌ Errado
VITE_JIRA_DOMAIN=...
VITE_JIRA_EMAIL=...
VITE_JIRA_API_TOKEN=...

# ✅ Certo
# Credenciais via UI de login
```

---

## 📞 Support

Se tiver problemas:

1. Verifique logs: `pm2 logs jira-dashboard`
2. Reinicie: `pm2 restart jira-dashboard`
3. Limpe cache: `npm cache clean --force`
4. Reinstale deps: `rm -rf node_modules && npm install`

---

**Última atualização**: 28 de Outubro de 2025
**Status**: ✅ Pronto para atualizar
