# Script para executar testes localmente no Windows

Write-Host "🚀 Iniciando testes locais..." -ForegroundColor Green
Write-Host ""

# Verificar se Docker está disponível
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker não encontrado. Instale Docker para executar os testes." -ForegroundColor Red
    exit 1
}

# Parar containers antigos se existirem
Write-Host "🧹 Limpando containers antigos..." -ForegroundColor Yellow
docker-compose down --remove-orphans 2>$null

# Iniciar MongoDB
Write-Host "🗄️  Iniciando MongoDB..." -ForegroundColor Cyan
docker-compose up -d

# Aguardar MongoDB estar pronto
Write-Host "⏳ Aguardando MongoDB ficar pronto..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

$retry = 0
$maxRetries = 30

while ($retry -lt $maxRetries) {
    try {
        $result = docker exec gestao-alunos-mongodb mongosh --eval "db.adminCommand('ping')" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ MongoDB está pronto!" -ForegroundColor Green
            break
        }
    } catch {
        # Ignorar erro
    }

    if ($retry -eq ($maxRetries - 1)) {
        Write-Host "❌ MongoDB não ficou pronto" -ForegroundColor Red
        docker-compose logs
        exit 1
    }

    Write-Host "  Tentativa $($retry + 1)/$maxRetries..." -ForegroundColor Yellow
    Start-Sleep -Seconds 1
    $retry++
}

# Executar testes
Write-Host ""
Write-Host "🧪 Executando testes..." -ForegroundColor Green
npm test

$testResult = $LASTEXITCODE

# Parar MongoDB
Write-Host ""
Write-Host "🛑 Parando MongoDB..." -ForegroundColor Yellow
docker-compose down

exit $testResult
