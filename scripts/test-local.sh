#!/bin/bash

set -e

echo "🚀 Iniciando testes locais..."
echo ""

# Verificar se Docker está disponível
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Instale Docker para executar os testes."
    exit 1
fi

# Parar containers antigos se existirem
echo "🧹 Limpando containers antigos..."
docker-compose down --remove-orphans 2>/dev/null || true

# Iniciar MongoDB
echo "🗄️  Iniciando MongoDB..."
docker-compose up -d

# Aguardar MongoDB estar pronto
echo "⏳ Aguardando MongoDB ficar pronto..."
sleep 3

for i in {1..30}; do
    if docker exec gestao-alunos-mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        echo "✓ MongoDB está pronto!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ MongoDB não ficou pronto"
        docker-compose logs
        exit 1
    fi
    echo "  Tentativa $i/30..."
    sleep 1
done

# Executar testes
echo ""
echo "🧪 Executando testes..."
npm test

# Código de saída
TEST_RESULT=$?

# Parar MongoDB
echo ""
echo "🛑 Parando MongoDB..."
docker-compose down

exit $TEST_RESULT
