@echo off
chcp 65001 >nul
title Surebets - Bot Telegram para Discord

echo ========================================
echo   SURBETS - Bot Telegram para Discord
echo ========================================
echo.

REM Verificar se node_modules existe
if not exist "node_modules\" (
    echo ❌ Dependências não instaladas!
    echo.
    echo Execute 'setup.bat' primeiro para instalar as dependências.
    echo.
    pause
    exit /b 1
)

REM Verificar se dist existe
if not exist "dist\" (
    echo ❌ Projeto não compilado!
    echo.
    echo Execute 'setup.bat' primeiro para compilar o projeto.
    echo.
    pause
    exit /b 1
)

REM Verificar se .env existe
if not exist ".env" (
    echo ⚠️  Arquivo .env não encontrado!
    echo.
    echo Por favor, crie o arquivo .env baseado no env.example
    echo.
    pause
    exit /b 1
)

echo ✅ Iniciando o bot...
echo.
echo 💡 Para parar o bot, pressione Ctrl+C
echo.

node dist/index.js

if errorlevel 1 (
    echo.
    echo ❌ Erro ao executar o bot!
    echo.
    pause
)

