# 🔌 Como Manter Sessão SSH Ativa Mais Tempo

## 🎯 Problema
Conexão SSH desconecta com pouco tempo de uso (timeout)

## ✅ Solução

### OPÇÃO 1: Configurar SSH Client (SEU COMPUTADOR) - ⭐ Recomendado

```bash
# 1. Editar arquivo de config do SSH
nano ~/.ssh/config

# 2. Adicionar ou editar sua conexão AWS:
Host jira-aws
    HostName 3.83.28.223
    User ec2-user
    IdentityFile ~/.ssh/sua-chave.pem
    ServerAliveInterval 60
    ServerAliveCountMax 10

# 3. Salvar (Ctrl+X, Y, Enter)

# 4. Próxima vez, conectar assim:
ssh jira-aws

# Pronto! Nunca mais timeout durante 10 minutos de inatividade
```

**Explicação:**
- `ServerAliveInterval 60` → Envia ping a cada 60 segundos
- `ServerAliveCountMax 10` → Tenta 10 vezes antes de desconectar (10 min)

---

### OPÇÃO 2: Configurar SSH Server (NA INSTÂNCIA AWS)

```bash
# 1. Conectar na instância
ssh -i sua-chave.pem ec2-user@3.83.28.223

# 2. Editar arquivo de servidor SSH
sudo nano /etc/ssh/sshd_config

# 3. Adicionar ao final:
ClientAliveInterval 300
ClientAliveCountMax 2

# 4. Salvar (Ctrl+X, Y, Enter)

# 5. Reiniciar SSH
sudo systemctl restart sshd

# Agora o servidor mantém conexão por até 600 segundos (10 min)
```

---

### OPÇÃO 3: Usar Tmux (Terminal Multiplexer) - Para Desenvolvimento

```bash
# 1. Instalar tmux
sudo apt-get install -y tmux

# 2. Criar nova sessão
tmux new-session -d -s jira

# 3. Dentro da sessão, rodar sua aplicação
tmux send-keys -t jira "cd /home/ssm-user/projetos/jira-dash && pm2 logs jira-dashboard" Enter

# 4. Desanexar (Ctrl+B, D)

# 5. Desconectar SSH - aplicação continua rodando

# 6. Próxima vez, reconectar e ver logs:
tmux attach-session -t jira
```

---

### OPÇÃO 4: Screen (Mais Simples que Tmux)

```bash
# 1. Instalar screen
sudo apt-get install -y screen

# 2. Criar sessão chamada "app"
screen -S app

# 3. Rodar comando dentro (ex: ver logs)
pm2 logs jira-dashboard

# 4. Desanexar (Ctrl+A, D)

# 5. Sair da SSH - continua rodando!

# 6. Reconectar e voltar:
screen -r app
```

---

### OPÇÃO 5: Usar tmux com Auto-Load

Script para iniciar tudo automaticamente:

```bash
# 1. Criar script
cat > ~/start-jira.sh << 'EOFSH'
#!/bin/bash

# Criar ou retomar sessão tmux
if tmux has-session -t jira 2>/dev/null; then
    echo "Sessão jira já existe"
    tmux attach-session -t jira
else
    echo "Criando nova sessão jira"
    tmux new-session -d -s jira
    tmux send-keys -t jira "cd /home/ssm-user/projetos/jira-dash && pm2 logs jira-dashboard" Enter
    tmux attach-session -t jira
fi
EOFSH

# 2. Dar permissão
chmod +x ~/start-jira.sh

# 3. Usar
./start-jira.sh
```

---

## 📊 Comparativo

| Solução | Facilidade | Efetividade | Setup |
|---------|-----------|-----------|-------|
| SSH Config (Client) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 5 min |
| SSH Config (Server) | ⭐⭐⭐ | ⭐⭐⭐⭐ | 5 min |
| Tmux | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 10 min |
| Screen | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 5 min |

**Recomendação:**
1. Primeira vez → Use Screen (mais simples)
2. Depois → Configure SSH Client (mais permanente)
3. Desenvolvimento → Use Tmux (mais recursos)

---

## 🔍 Verificar Conectividade

```bash
# Ver configuração SSH atual
cat ~/.ssh/config

# Testar tempo de timeout
ssh -v jira-aws
# Ver linhas com "keep-alive" e "ServerAlive"

# Se quer ver enquanto está conectado
# Deixar 10+ min sem fazer nada
# Deve manter conexão ativa
```

---

## ⚙️ Configuração SSH Completa Recomendada

```bash
# ~/.ssh/config

Host jira-aws
    HostName 3.83.28.223
    User ec2-user
    IdentityFile ~/.ssh/jira-key.pem
    
    # Keep-alive settings
    ServerAliveInterval 60
    ServerAliveCountMax 10
    
    # Connection settings
    ConnectTimeout 10
    StrictHostKeyChecking no
    UserKnownHostsFile=/dev/null
    
    # Compression (mais rápido em conexão lenta)
    Compression yes
    
    # Port forwarding (opcional)
    # LocalForward 3000 localhost:3000
```

---

## 🧪 Teste de Timeout

```bash
# 1. Conectar
ssh jira-aws

# 2. Deixar parado por 15 minutos

# 3. Tentar escrever algo
echo "teste"

# ✅ Se funcionar, timeout foi resolvido!
# ❌ Se desconectou, timeout ainda é problema
```

---

## 🚨 Se Desconectar Mesmo Assim

```bash
# Aumentar ainda mais
nano ~/.ssh/config

# Mudar para:
ServerAliveInterval 30
ServerAliveCountMax 20  # 10 minutos total

# Salvar e tentar de novo
```

---

## 📋 Checklist Final

- [ ] Editar ~/.ssh/config
- [ ] Adicionar ServerAliveInterval e ServerAliveCountMax
- [ ] Testar: `ssh jira-aws`
- [ ] Deixar 15+ min parado
- [ ] Verificar se ainda conectado
- [ ] PM2 está rodando (não depende de SSH)

---

## 💡 Dica Pro

A melhor solução é:
1. **SSH Client Config** → Para manter terminal conectado
2. **PM2** → Para manter aplicação rodando (já está configurado!)

Assim, mesmo que SSH desconecte, a aplicação continua online! ✅

---

**Your Jira Dashboard is always online!** 🎉

---

**Data**: 28 de Outubro de 2025
**Status**: ✅ Pronto para Configurar
