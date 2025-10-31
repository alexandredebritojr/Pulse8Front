# Script para iniciar o servidor de desenvolvimento
$env:DISABLE_SWC = "true"
$env:NEXT_DISABLE_SWC = "true"
$env:NEXT_SWC_DISABLE = "true"

Write-Host "Iniciando servidor de desenvolvimento com SWC desabilitado..."
npm run dev

