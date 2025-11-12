# Script de Instalação Automática - Surebets
# Este script instala todas as dependências necessárias

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INSTALAÇÃO DO SURBETS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Node.js está instalado
Write-Host "🔍 Verificando se Node.js está instalado..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, instale o Node.js primeiro:" -ForegroundColor Yellow
    Write-Host "1. Acesse: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "2. Baixe e instale a versão LTS" -ForegroundColor Yellow
    Write-Host "3. Execute este script novamente" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Verificar se npm está instalado
Write-Host "🔍 Verificando se npm está instalado..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm encontrado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm não encontrado!" -ForegroundColor Red
    Write-Host "O npm deveria vir com o Node.js. Por favor, reinstale o Node.js." -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "📦 Instalando dependências do projeto..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "🔨 Compilando o projeto..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao compilar o projeto!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "📝 Configurando arquivos de configuração..." -ForegroundColor Yellow

# Criar .env se não existir
if (-not (Test-Path ".env")) {
    if (Test-Path "env.example") {
        Copy-Item "env.example" ".env"
        Write-Host "✅ Arquivo .env criado a partir do env.example" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Arquivo env.example não encontrado. Crie o arquivo .env manualmente." -ForegroundColor Yellow
    }
} else {
    Write-Host "ℹ️  Arquivo .env já existe" -ForegroundColor Cyan
}

# Criar config.json se não existir
if (-not (Test-Path "config.json")) {
    if (Test-Path "config.json.example") {
        Copy-Item "config.json.example" "config.json"
        Write-Host "✅ Arquivo config.json criado a partir do config.json.example" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Arquivo config.json.example não encontrado. Crie o arquivo config.json manualmente." -ForegroundColor Yellow
    }
} else {
    Write-Host "ℹ️  Arquivo config.json já existe" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  INSTALAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Edite o arquivo '.env' com suas credenciais do Telegram e Discord" -ForegroundColor White
Write-Host "2. Edite o arquivo 'config.json' com as configurações desejadas" -ForegroundColor White
Write-Host "3. Execute 'run.bat' para iniciar o bot" -ForegroundColor White
Write-Host ""
Write-Host "💡 Dica: Veja o arquivo INSTRUCOES.md para um guia detalhado!" -ForegroundColor Yellow
Write-Host ""
Read-Host "Pressione Enter para sair"

