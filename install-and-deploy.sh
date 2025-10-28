#!/bin/bash

# 🚀 Script de Instalação e Deploy do Jira Dashboard

set -e  # Parar se algum comando falhar

echo "================================"
echo "🚀 DEPLOY JIRA DASHBOARD"
echo "================================"
echo ""

# 1. Atualizar repositório
echo "📡 Atualizando repositório..."
git pull origin main 2>/dev/null || echo "⚠️ Git pull falhou, continuando com arquivos locais..."

# 2. Instalar/Atualizar dependências
echo "📦 Instalando dependências..."
npm install

# 3. Verificar dependências críticas
echo "🔍 Verificando dependências críticas..."
npm list @tanstack/react-query > /dev/null 2>&1 || (echo "❌ @tanstack/react-query não instalado!" && exit 1)
npm list vite-plugin-pwa > /dev/null 2>&1 || (echo "❌ vite-plugin-pwa não instalado!" && exit 1)

# 4. Build
echo "🏗️  Fazendo build..."
npm run build

# 5. Verificar build
if [ -d "dist" ]; then
    echo "✅ Build realizado com sucesso!"
    ls -lh dist/index.html
else
    echo "❌ Build falhou!"
    exit 1
fi

# 6. Parar PM2 se estiver rodando
echo "🛑 Parando aplicação anterior (se houver)..."
pm2 stop jira-dashboard 2>/dev/null || echo "⚠️ PM2 não encontrado, continuando..."

# 7. Instalar PM2 se necessário
if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalando PM2..."
    npm install -g pm2
fi

# 8. Iniciar com PM2
echo "🚀 Iniciando aplicação com PM2..."
pm2 start pm2.config.js --name jira-dashboard 2>/dev/null || pm2 restart jira-dashboard

# 9. Salvar config do PM2
echo "💾 Salvando configuração do PM2..."
pm2 startup > /dev/null 2>&1 || echo "⚠️ pm2 startup falhou (pode ser permissão)"
pm2 save

# 10. Resumo
echo ""
echo "================================"
echo "✅ DEPLOY COMPLETO!"
echo "================================"
echo ""
echo "📊 Status dos Processos:"
pm2 status
echo ""
echo "🌐 Acesse: http://localhost:3000"
echo ""
echo "📋 Comandos úteis:"
echo "  pm2 logs jira-dashboard     → Ver logs"
echo "  pm2 monit                   → Monitorar recursos"
echo "  pm2 restart jira-dashboard  → Reiniciar"
echo "  pm2 stop jira-dashboard     → Parar"
echo ""

