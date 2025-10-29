#!/bin/bash

# 🐳 Script de Deploy Docker - Jira Dashboard

set -e

echo "================================"
echo "🐳 DEPLOY DOCKER - JIRA DASHBOARD"
echo "================================"
echo ""

# 1. Verificar se Docker está instalado
echo "🔍 Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado!"
    echo "Instale com: sudo apt-get install -y docker.io"
    exit 1
fi
echo "✅ Docker encontrado: $(docker --version)"

# 2. Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado!"
    echo "Instale com: sudo apt-get install -y docker-compose"
    exit 1
fi
echo "✅ Docker Compose encontrado: $(docker-compose --version)"

# 3. Parar containers antigos
echo ""
echo "🛑 Parando containers antigos..."
docker-compose down 2>/dev/null || echo "Nenhum container anterior"

# 4. Build
echo ""
echo "🏗️  Fazendo build da imagem..."
docker build -t jira-dashboard:latest .

# 5. Verificar se build funcionou
if [ $? -ne 0 ]; then
    echo "❌ Build falhou!"
    exit 1
fi
echo "✅ Build concluído com sucesso!"

# 6. Rodar com docker-compose
echo ""
echo "🚀 Iniciando container..."
docker-compose up -d

# 7. Aguardar container ficar pronto
echo ""
echo "⏳ Aguardando container iniciar..."
sleep 5

# 8. Verificar status
echo ""
echo "📊 Status dos containers:"
docker-compose ps

# 9. Verificar logs
echo ""
echo "📋 Primeiros logs:"
docker-compose logs --tail=20

# 10. Teste rápido
echo ""
echo "🧪 Testando conectividade..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Aplicação respondendo em http://localhost:3000"
else
    echo "⚠️  Aplicação pode ainda estar iniciando..."
fi

# 11. Resumo
echo ""
echo "================================"
echo "✅ DEPLOY COMPLETO!"
echo "================================"
echo ""
echo "🌐 Acessar: http://3.83.28.223:3000"
echo ""
echo "📊 Comandos úteis:"
echo "  docker-compose ps         → Ver status"
echo "  docker-compose logs -f    → Ver logs em tempo real"
echo "  docker-compose restart    → Reiniciar"
echo "  docker-compose down       → Parar"
echo ""
echo "✅ Tudo pronto! Seu dashboard está em produção com Docker!"
echo ""

