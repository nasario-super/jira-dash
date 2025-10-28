# 📋 RESUMO: Correções para Deploy na AWS

## 🔴 PROBLEMAS ENCONTRADOS

| Problema | Localização | Status |
|----------|-------------|--------|
| Falta `@tanstack/react-query` | package.json | ✅ Corrigido |
| Falta `vite-plugin-pwa` | package.json | ✅ Corrigido |
| Erro ao carregar em produção | src/App.tsx | ✅ Corrigido |

---

## ✅ CORREÇÕES APLICADAS

### 1. Adicionado `@tanstack/react-query` em dependencies
```json
"@tanstack/react-query": "^5.28.0",
```

### 2. Adicionado `vite-plugin-pwa` em devDependencies
```json
"vite-plugin-pwa": "^0.17.4"
```

### 3. Criados 3 Documentos de Guia
- ✅ `DEPLOY_AWS.md` - Guia completo de deploy
- ✅ `SETUP_AWS_RESUMIDO.md` - Resumo rápido
- ✅ `DEPENDENCIAS_CORRIGIDAS.md` - Detalhes de deps

### 4. Criado Script Automatizado
- ✅ `install-and-deploy.sh` - Automatiza todo o processo

---

## 🚀 INSTRUÇÕES PARA AWS

### Na Instância EC2

```bash
# 1. Clonar repositório
cd /home/ssm-user/projetos
git clone https://github.com/seu-usuario/jira-dash.git
cd jira-dash

# 2. Executar script de deploy
chmod +x install-and-deploy.sh
./install-and-deploy.sh

# 3. Acessar
# Abra: http://seu-ip-da-aws:3000
```

### Se der Erro Manualmente

```bash
# 1. Instalar dependências
npm install

# 2. Fazer build
npm run build

# 3. Iniciar com PM2
npm install -g pm2 serve
pm2 start pm2.config.js
```

---

## 📊 Arquivo package.json Corrigido

O arquivo `package.json` agora contém:

**Dependencies (22 pacotes)**:
- React 18.2.0
- React Router Dom 6.20.1
- Axios 1.6.2
- Zustand 4.4.7
- Recharts 2.8.0
- Framer Motion 12.23.24
- **@tanstack/react-query 5.28.0** ← NOVO
- E mais 14 pacotes

**DevDependencies (14 pacotes)**:
- Vite 4.5.0
- TypeScript 5.2.2
- Tailwind CSS 3.3.5
- ESLint 8.53.0
- **vite-plugin-pwa 0.17.4** ← NOVO
- E mais 9 pacotes

---

## ✅ Checklist de Deployment

Na AWS, após executar o script:

- [ ] ✅ npm install rodou sem erros
- [ ] ✅ @tanstack/react-query está instalado
- [ ] ✅ vite-plugin-pwa está instalado
- [ ] ✅ npm run build rodou sem erros
- [ ] ✅ pasta dist/ foi criada
- [ ] ✅ pm2 iniciou a aplicação
- [ ] ✅ Aplicação está rodando na porta 3000
- [ ] ✅ Acesso via http://ip:3000 funcionando
- [ ] ✅ Login funciona
- [ ] ✅ Seleção de projetos funciona
- [ ] ✅ Dashboard exibe dados

---

## 🔒 Segurança

**IMPORTANTE**: Não colocar credenciais no .env!

```bash
# ❌ NUNCA FAÇA
JIRA_DOMAIN=superlogica.atlassian.net
EMAIL=seu-email@example.com
API_TOKEN=seu-token

# ✅ SEMPRE FAÇA
# Credenciais via login na UI
```

---

## 📞 Troubleshooting

### Se der erro de permissão
```bash
sudo chown -R ssm-user:ssm-user /home/ssm-user/projetos/jira-dash
```

### Se PM2 não iniciar
```bash
npm install -g pm2
pm2 startup
pm2 save
```

### Se build falhar
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📈 Monitoramento

```bash
# Ver aplicação rodando
pm2 status

# Ver logs
pm2 logs jira-dashboard

# Monitorar CPU/Memória
pm2 monit

# Reiniciar se necessário
pm2 restart jira-dashboard
```

---

## 🎯 Próximos Passos

1. ✅ Corrigir package.json → FEITO
2. ⏭️ Executar npm install na AWS
3. ⏭️ Fazer build
4. ⏭️ Iniciar com PM2
5. ⏭️ Testar acesso
6. ⏭️ Configurar domínio (opcional)
7. ⏭️ Configurar SSL com Let's Encrypt (opcional)

---

## 📚 Documentação

- `DEPLOY_AWS.md` - Guia completo com todos os detalhes
- `SETUP_AWS_RESUMIDO.md` - Versão rápida do guia
- `DEPENDENCIAS_CORRIGIDAS.md` - Lista de dependências
- `install-and-deploy.sh` - Script automatizado

---

## 📝 Notas Importantes

1. **Proxy do Vite**: Configurado para repassar auth headers do usuário
2. **Credenciais**: Sistema usa login UI, não .env
3. **PWA**: Progressive Web App habilitado (cache offline)
4. **Performance**: Build otimizado com chunks separados

---

**Data**: 28 de Outubro de 2025
**Versão**: 1.0
**Status**: ✅ PRONTO PARA DEPLOY NA AWS
