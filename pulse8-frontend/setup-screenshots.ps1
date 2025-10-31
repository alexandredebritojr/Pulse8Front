# Script PowerShell para configurar e executar captura de screenshots

Write-Host "🚀 Configurando captura automática de screenshots do Pulse8..." -ForegroundColor Green

# Verificar se o Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado! Instale o Node.js primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se o servidor está rodando
Write-Host "🔍 Verificando se o servidor está rodando..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Servidor está rodando!" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Servidor não está rodando!" -ForegroundColor Red
    Write-Host "💡 Execute: npm run dev" -ForegroundColor Yellow
    exit 1
}

# Instalar Playwright
Write-Host "📦 Instalando Playwright..." -ForegroundColor Yellow
try {
    npm install playwright
    npx playwright install chromium
    Write-Host "✅ Playwright instalado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao instalar Playwright" -ForegroundColor Red
    exit 1
}

# Criar diretório de screenshots
Write-Host "📁 Criando diretório de screenshots..." -ForegroundColor Yellow
if (!(Test-Path "screenshots")) {
    New-Item -ItemType Directory -Path "screenshots" -Force
    Write-Host "✅ Diretório criado!" -ForegroundColor Green
}

# Executar captura
Write-Host "📸 Iniciando captura de screenshots..." -ForegroundColor Yellow
try {
    node capture-screenshots.js
    Write-Host "🎉 Captura concluída com sucesso!" -ForegroundColor Green
    Write-Host "📁 Screenshots salvos em: ./screenshots/" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erro durante a captura" -ForegroundColor Red
    Write-Host "💡 Verifique se o servidor está rodando e tente novamente" -ForegroundColor Yellow
}

Write-Host "✨ Processo concluído!" -ForegroundColor Green










