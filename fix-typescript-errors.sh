#!/bin/bash

echo "🔧 Iniciando correção de erros TypeScript..."

# 1. Adicionar tipos faltantes em hooks e tipos
echo "1️⃣ Adicionando tipos faltantes..."

# Corrigir NodeJS.Timeout
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/NodeJS\.Timeout/ReturnType<typeof setTimeout>/g'

# 2. Remover console.warn de imports não utilizados (comentar linhas)
echo "2️⃣ Removendo imports não utilizados..."

# Para Brain icon que não existe
sed -i 's/icon: Brain,/icon: Brain, \/\/ TODO: Importar ou substituir/g' src/components/analytics/ConfidenceImprovementGuide.tsx

echo "✅ Correções básicas aplicadas!"
echo "⚠️ Ainda existem erros que precisam ajustes manuais"
echo ""
echo "Próximos passos:"
echo "1. Remover imports não usados de cada arquivo"
echo "2. Adicionar tipos aos parâmetros implícitos"
echo "3. Corrigir propriedades de tipo incompatíveis"
