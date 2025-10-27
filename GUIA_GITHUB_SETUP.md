# 📚 GUIA: ENVIAR PROJETO PARA NOVO REPOSITÓRIO NO GITHUB

**Data**: 27/10/2025
**Versão**: 1.0 - Release Inicial
**Status**: Pronto para Deploy

---

## 🎯 PASSO-A-PASSO

### PASSO 1: Preparar o Repositório Local

```bash
cd /home/anderson.nasario/Documentos/Nasario/jira-dash

# Verificar se já há um .git
git status

# Se não houver, inicializar
git init
```

### PASSO 2: Configurar Git Local

```bash
# Configurar usuário (se não estiver configurado)
git config user.email "anderson.nasario@superlogica.com"
git config user.name "Anderson Nasário"

# Verificar configuração
git config --list | grep user
```

### PASSO 3: Criar Arquivo .gitignore

```bash
# Verificar se existe
cat .gitignore

# Se não existir, criar:
cat > .gitignore << 'GITIGNORE'
# Dependencies
node_modules/
/.pnp
.pnp.js

# Production
/dist
/build
/out

# Environment variables
.env
.env.local
.env.*.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode
.idea
*.swp
*.swo
*~
.DS_Store

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Misc
.cache/
.turbo/
GITIGNORE
```

### PASSO 4: Adicionar e Commitar Arquivos

```bash
# Adicionar todos os arquivos
git add .

# Verificar o que será commitado
git status

# Fazer commit inicial
git commit -m "Initial commit: Jira Dashboard com autenticação, filtros de projetos e modais detalhados"
```

### PASSO 5: Criar Repositório no GitHub

**Opção A: Via Web Browser**
1. Ir para https://github.com/new
2. Nome: `jira-dash` (ou outro nome de sua preferência)
3. Descrição: "Jira Dashboard com filtros de projetos, análise de dados e modais interativos"
4. Visibilidade: **Public** ou **Private** (escolher)
5. ❌ NÃO marque "Initialize repository with"
6. Clicar **Create repository**

**Opção B: Via GitHub CLI**
```bash
# Se não tiver gh instalado:
# sudo apt install gh

gh auth login
gh repo create jira-dash \
  --description "Jira Dashboard com filtros de projetos e análise de dados" \
  --public \
  --source=. \
  --remote=origin \
  --push
```

### PASSO 6: Adicionar Remote e Fazer Push

```bash
# Copiar a URL do novo repositório do GitHub
# Formato: https://github.com/SEU_USUARIO/jira-dash.git

# Adicionar remote
git remote add origin https://github.com/SEU_USUARIO/jira-dash.git

# Verificar remotes
git remote -v

# Renomear branch main (se necessário)
git branch -M main

# Fazer push inicial
git push -u origin main
```

### PASSO 7: Verificar no GitHub

```bash
# Verificar status
git status

# Ver commits
git log --oneline

# Ir para https://github.com/SEU_USUARIO/jira-dash para verificar
```

---

## 📋 CHECKLIST PRE-DEPLOY

Antes de fazer push, verificar:

- [x] `.env` está no `.gitignore` (não enviar credenciais!)
- [x] `node_modules/` está no `.gitignore`
- [x] `dist/` está no `.gitignore`
- [x] `package.json` contém todas as dependências
- [x] `package-lock.json` está presente
- [x] Sem arquivos de teste locais não versionados
- [x] `README.md` está atualizado
- [x] Documentação está completa

---

## 📖 CRIAR README.md PARA GITHUB

```bash
cat > README.md << 'EOF'
# 📊 Jira Dashboard

Dashboard interativo para Jira com autenticação, filtros de projetos, análise de dados em tempo real e modais detalhados.

## 🎯 Features

- ✅ **Autenticação**: Login seguro com JWT e Jira API
- ✅ **Seleção de Projetos**: Escolha manual de projetos após login
- ✅ **Filtros Avançados**: Status, Prioridade, Tipo, Assignado, etc
- ✅ **Análise de Dados**: Issues por status, performance do usuário, velocity
- ✅ **Modais Interativos**: 
  - Modal de usuário com métricas e issues expandíveis
  - Modal de detalhes da issue com informações completas
- ✅ **Performance**: 5-15 segundos de carregamento com busca paralela
- ✅ **Responsivo**: Mobile, Tablet, Desktop

## 🚀 Quick Start

### Pré-requisitos
- Node.js 16+
- npm ou yarn
- Credenciais do Jira (email + API token)

### Instalação

```bash
# Clonar repositório
git clone https://github.com/SEU_USUARIO/jira-dash.git
cd jira-dash

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp env.example .env
# Editar .env com suas credenciais do Jira
nano .env
```

### Variáveis de Ambiente

```env
VITE_JIRA_DOMAIN=your-domain.atlassian.net
VITE_JIRA_EMAIL=your-email@company.com
VITE_JIRA_API_TOKEN=your-api-token
```

### Executar em Desenvolvimento

```bash
npm run dev
# Acesso: http://localhost:5173
```

### Build para Produção

```bash
npm run build
npm run preview
```

## 📊 Estrutura do Projeto

```
src/
├── components/
│   ├── auth/          # Autenticação e seleção de projetos
│   ├── dashboard/     # Dashboard principal e modais
│   └── ui/            # Componentes UI reutilizáveis
├── hooks/             # Hooks customizados
├── services/          # Serviços (Jira API, filtros, etc)
├── stores/            # Zustand stores
├── types/             # TypeScript types
└── App.tsx            # Aplicação principal
```

## 🔐 Segurança

- ✅ Credenciais em `.env` (nunca commitidas)
- ✅ Filtro de projetos por acesso do usuário
- ✅ Validação de dados em múltiplas camadas
- ✅ HTTPS recomendado em produção

## 🧪 Testes

```bash
npm run test          # Executar testes
npm run lint          # Verificar linting
npm run build         # Build test
```

## 📚 Documentação

- [GUIA_GITHUB_SETUP.md](./GUIA_GITHUB_SETUP.md) - Setup do repositório
- [MELHORIAS_MODAIS_USUARIO.md](./MELHORIAS_MODAIS_USUARIO.md) - Modais de usuário e issue
- [FILTRO_PROJETOS_GLOBAIS.md](./FILTRO_PROJETOS_GLOBAIS.md) - Filtro global de projetos
- [OTIMIZACOES_PERFORMANCE.md](./OTIMIZACOES_PERFORMANCE.md) - Otimizações implementadas

## 🚀 Deploy

### Vercel
```bash
# Conectar GitHub no Vercel
# Selecionar este repositório
# Deploy automático a cada push
```

### GitHub Pages
```bash
npm run build
# Fazer upload da pasta dist/
```

### Docker
```bash
docker build -t jira-dash .
docker run -p 3000:80 jira-dash
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Changelog

### v1.0 (27/10/2025)
- ✨ Versão inicial com autenticação
- ✨ Seleção manual de projetos
- ✨ Dashboard com análise de dados
- ✨ Modais de usuário e detalhes de issue
- ✨ Otimizações de performance

## 📄 Licença

Este projeto está sob a licença MIT. Ver arquivo [LICENSE](LICENSE) para mais detalhes.

## 👤 Autor

**Anderson Nasário**
- GitHub: [@anderson-nasario](https://github.com/anderson-nasario)
- Email: anderson.nasario@superlogica.com

## 💬 Suporte

Para suporte, abra uma [issue](https://github.com/SEU_USUARIO/jira-dash/issues) no GitHub.

---

**Status**: ✅ Production Ready
**Última atualização**: 27/10/2025

