# 📝 COMANDOS GIT ESSENCIAIS

## 🔄 SINCRONIZAR REPOSITÓRIO (Atualizar Conteúdo)

### COMANDO PRINCIPAL

```bash
git pull origin master
```

**O que faz:**
- Busca atualizações do repositório remoto (GitHub)
- Mescla automaticamente as mudanças locais
- Atualiza seu código para a versão mais recente

---

## 📊 OUTROS COMANDOS IMPORTANTES

### 1️⃣ Ver Status (O que mudou?)

```bash
git status
```

**Resposta típica:**
```
On branch master
Your branch is up-to-date with 'origin/master'.

nothing to commit, working tree clean
```

---

### 2️⃣ Commitar Mudanças (Salvar localmente)

```bash
# Adicionar todos os arquivos modificados
git add .

# Commitar com mensagem
git commit -m "Descrição das mudanças"

# Exemplo real
git commit -m "docs: adicionar guia de segurança"
```

---

### 3️⃣ Enviar para GitHub (Push)

```bash
# Enviar commits para GitHub
git push origin master
```

**Resultado:**
```
Enumerating objects: 5, done.
Writing objects: 100% (5/5), 1.2 KiB | 0 bytes/s, done.
Total 5 (delta 4), reused 0 (delta 0)
remote: Resolving deltas: 100% (4/4), completed with 3 local objects.
To github.com:seu-usuario/jira-dash.git
   b8ad58d..2e5d72b  master -> master
```

---

### 4️⃣ Ver Histórico de Commits

```bash
# Ver últimos 5 commits
git log --oneline -5

# Ver commit específico
git show b8ad58d

# Ver mudanças em arquivo
git log -p src/App.tsx
```

---

### 5️⃣ Ver Diferenças (Diff)

```bash
# Ver mudanças não commitadas
git diff

# Ver mudanças de um arquivo
git diff src/App.tsx

# Ver mudanças entre commits
git diff b8ad58d 2e5d72b
```

---

## 🔄 FLUXO COMPLETO (GIT WORKFLOW)

```bash
# 1. Atualizar seu código local
git pull origin master

# 2. Fazer alterações nos arquivos
# (editar arquivos no seu editor)

# 3. Ver o que mudou
git status

# 4. Adicionar mudanças
git add .

# 5. Commitar
git commit -m "docs: atualizar guias"

# 6. Enviar para GitHub
git push origin master
```

---

## 📋 CENÁRIOS COMUNS

### Cenário 1: Alguém fez mudanças no GitHub

```bash
# Seu repositório local ficou desatualizado
git pull origin master

# ✅ Seu código agora tem as mudanças mais recentes
```

---

### Cenário 2: Você fez mudanças locais

```bash
# 1. Ver mudanças
git status

# 2. Adicionar
git add .

# 3. Salvar localmente
git commit -m "Feature: adicionar HTTPS"

# 4. Enviar para GitHub
git push origin master
```

---

### Cenário 3: Sincronizar antes de trabalhar

```bash
# Bom hábito: sempre sincronizar primeiro
git pull origin master

# Agora você tem o código mais recente
# Faça suas mudanças
# git add .
# git commit -m "..."
# git push origin master
```

---

### Cenário 4: Desfazer última mudança

```bash
# Desfazer último commit (mas manter arquivos)
git reset --soft HEAD~1

# Desfazer último commit (perder mudanças)
git reset --hard HEAD~1
```

---

## 🚨 ERROS COMUNS

### Erro: "Your branch is behind origin"

```bash
# Seu repositório está desatualizado
git pull origin master

# ✅ Resolve automaticamente
```

---

### Erro: "Merge conflict"

```bash
# Você e outra pessoa editaram o mesmo arquivo
# Git pede para você resolver

# 1. Abrir arquivo com conflito
# 2. Ver marcadores: <<<<<<, ======, >>>>>>
# 3. Escolher qual versão manter
# 4. Remover marcadores
# 5. Commitar

git add .
git commit -m "Resolve merge conflict"
git push origin master
```

---

### Erro: "Permission denied"

```bash
# Problema: SSH key não configurada
# Solução: Gerar chave SSH
ssh-keygen -t ed25519 -C "seu-email@example.com"

# Adicionar à conta GitHub
# 1. Copiar conteúdo: cat ~/.ssh/id_ed25519.pub
# 2. GitHub → Settings → SSH Keys → Add new
```

---

## 💡 DICAS

### 1. Sempre sincronizar antes de trabalhar

```bash
git pull origin master  # Bom hábito!
```

### 2. Commits pequenos e específicos

```bash
# ✅ BOM
git commit -m "docs: adicionar guia HTTPS"

# ❌ RUIM
git commit -m "atualizar tudo"
```

### 3. Ver o que será enviado

```bash
git diff origin/master  # Ver mudanças antes de push
```

### 4. Atualizar enquanto está trabalhando

```bash
# Se precisa de mudanças de outros enquanto trabalha
git fetch origin        # Busca sem mesclar
git rebase origin/master # Rebase suas mudanças
```

---

## 🎯 COMANDOS MAIS USADOS

| Comando | O que faz |
|---------|-----------|
| `git pull origin master` | **Atualizar seu código** |
| `git status` | Ver mudanças |
| `git add .` | Adicionar mudanças |
| `git commit -m "msg"` | Salvar localmente |
| `git push origin master` | Enviar para GitHub |
| `git log --oneline -5` | Ver histórico |
| `git diff` | Ver diferenças |

---

## 🚀 ATALHO RÁPIDO

Se quer fazer tudo em 1 comando (após editar arquivos):

```bash
git add . && git commit -m "Descrição" && git push origin master
```

Mas **cuidado**: sempre revise antes de fazer push!

---

## 📞 FLUXO RECOMENDADO

1. **Sempre começar com:**
   ```bash
   git pull origin master
   ```

2. **Fazer suas mudanças** (editar arquivos)

3. **Antes de enviar, verificar:**
   ```bash
   git status
   git diff
   ```

4. **Se tudo OK, enviar:**
   ```bash
   git add .
   git commit -m "Descrição clara"
   git push origin master
   ```

5. **Verificar no GitHub** que as mudanças foram enviadas

---

**Dica de Ouro:** 
Se usar VS Code, pode fazer tudo pela interface gráfica do Git (Source Control tab) 🎨

---

**Data**: 28 de Outubro de 2025
**Status**: ✅ Pronto para usar
