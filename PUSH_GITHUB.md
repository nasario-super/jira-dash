# 🚀 GUIA RÁPIDO: ENVIAR PARA GITHUB

## PASSO 1: Fazer Commit de Todas as Mudanças

```bash
cd /home/anderson.nasario/Documentos/Nasario/jira-dash

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "feat: Jira Dashboard v1.0 com modais de usuário e detalhes de issue"
```

## PASSO 2: Criar Novo Repositório no GitHub

**Opção MANUAL (Browser):**
1. Ir para https://github.com/new
2. Nome: `jira-dash`
3. Descrição: "Jira Dashboard com filtros de projetos e análise de dados"
4. Escolher: **Public** (para compartilhar) ou **Private** (privado)
5. ❌ **NÃO** marcar nada em "Initialize this repository"
6. Clique **Create repository**

**Depois que criar, você verá uma página como:**
```
git remote add origin https://github.com/SEU_USUARIO/jira-dash.git
git branch -M main
git push -u origin main
```

## PASSO 3: Executar os Comandos que GitHub Forneceu

```bash
# Adicionar o repositório remoto (COPIAR A URL DO GITHUB)
git remote add origin https://github.com/SEU_USUARIO/jira-dash.git

# Renomear branch para "main"
git branch -M main

# Fazer push para GitHub
git push -u origin main
```

## PASSO 4: Verificar

Ir para https://github.com/SEU_USUARIO/jira-dash

Se vir seus arquivos lá, **SUCESSO!** ✅

---

## ⚠️ IMPORTANTE: Não Esqueça de Adicionar .env ao .gitignore

```bash
# Verificar se .gitignore existe
cat .gitignore

# Se não houver, criar:
cat > .gitignore << 'IGNORE'
# Env
.env
.env.local
.env.*.local

# Dependencies
node_modules/
.pnp

# Build
dist/
build/

# IDE
.vscode
.idea
*.swp

# Misc
.DS_Store
IGNORE
```

Depois fazer commit:
```bash
git add .gitignore
git commit -m "chore: Add .gitignore"
git push
```

---

## 🆘 Se Houver Erro: "fatal: 'origin' does not appear to be a git repository"

```bash
# Verificar remotes
git remote -v

# Se não tiver "origin", adicionar:
git remote add origin https://github.com/SEU_USUARIO/jira-dash.git

# Fazer push
git push -u origin main
```

---

## 📝 SUBSTITUA "SEU_USUARIO" POR SEU USUÁRIO DO GITHUB!

Exemplo: Se seu usuário for "anderson-nasario"
```
https://github.com/anderson-nasario/jira-dash.git
```

---

**Pronto! Seu projeto está no GitHub! 🎉**

