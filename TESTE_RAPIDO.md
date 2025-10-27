# 🧪 TESTE RÁPIDO - Correção de Múltiplos Projetos

## ⚡ COMEÇO RÁPIDO

### Passo 1: Verificar DevTools
```
Pressione: F12
Vá para: Console
```

### Passo 2: Fazer Login
1. Acesse http://localhost:3000
2. Login com credenciais do Jira

### Passo 3: Selecionar Projetos

#### Teste A: INFOSECC Apenas
```
1. Selecionar: INFOSECC
2. Dashboard carrega
3. Console deve mostrar:
   ✅ "Projeto único detectado"
   ✅ "INFOSECC: ~2000 issues"
4. Dashboard exibe apenas INFOSECC
```

#### Teste B: SEGP Apenas
```
1. Selecionar: SEGP
2. Dashboard carrega
3. Console deve mostrar:
   ✅ "Projeto único detectado"
   ✅ "SEGP: ~2000 issues"
4. Dashboard exibe apenas SEGP
```

#### Teste C: INFOSECC + SEGP
```
1. Selecionar: INFOSECC E SEGP
2. Dashboard carrega
3. Console deve mostrar:
   ✅ "Múltiplos projetos detectados"
   ✅ "INFOSECC: 2000 issues"
   ✅ "SEGP: 2000 issues"
   ✅ "RESULTADO FINAL: 4000 issues"
   ✅ "0 duplicatas removidas"
4. Dashboard exibe:
   ✅ Status: 2 projetos
   ✅ Total: ~4000 issues
   ✅ Usuários: 12+
```

## 📝 O QUE PROCURAR NO CONSOLE

### Sucesso (Múltiplos Projetos)
```
====================================
🔍 fetchFilteredData - START
====================================
...
🟡 Múltiplos projetos detectados
📁 Fetching project: INFOSECC
✅ INFOSECC: 2000 issues
📁 Fetching project: SEGP
✅ SEGP: 2000 issues
🔄 Deduplicando...
✅ Nenhuma duplicata
🔍 Validação de Projetos:
   Projetos esperados: INFOSECC, SEGP
   Projetos encontrados: INFOSECC, SEGP
   📊 INFOSECC: 2000
   📊 SEGP: 2000
📊 RESULTADO FINAL: 4000
✅ fetchFilteredData - SUCESSO
====================================
```

### Erro (Projetos Ausentes)
```
🚨 CRÍTICO: Projetos ausentes nos dados: INFOSECC
```

## ✅ VALIDAÇÃO FINAL

| Aspecto | Esperado | Seu Resultado |
|---------|----------|--------------|
| Dashboard exibe 2 projetos? | SIM | ☐ |
| Total issues é ~4000? | SIM | ☐ |
| Usuários é 12+? | SIM | ☐ |
| 0 duplicatas removidas? | SIM | ☐ |
| "SUCESSO" no console? | SIM | ☐ |

Se todos os ☐ forem marcados: ✅ **TESTES PASSARAM!**

## 🔍 TROUBLESHOOTING RÁPIDO

**P: Mostra apenas 1 projeto?**
R: Verificar console. Se disser "Projeto único detectado", selecione 2 projetos.

**P: Console mostra erro?**
R: Procurar por "❌" ou "🚨" no console. Reportar a mensagem de erro.

**P: Números não batem?**
R: Verificar se "✅ fetchFilteredData - SUCESSO" aparece. Se não, houve erro durante fetch.

**P: Duplicatas foram removidas?**
R: Isso é anormal. Reportar se aparecer "X duplicatas removidas" onde X > 0.

## 📊 PRÓXIMOS PASSOS

- [ ] Testar Teste A (INFOSECC)
- [ ] Testar Teste B (SEGP)
- [ ] Testar Teste C (Múltiplos)
- [ ] Preencher tabela de validação
- [ ] Reportar resultado

**Resultado?** ✅ SUCESSO ou ❌ ERRO?
