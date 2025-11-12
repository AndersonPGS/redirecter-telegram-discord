@echo off
chcp 65001 >nul
echo ========================================
echo   INSTALAÇÃO DO SURBETS
echo ========================================
echo.
echo Executando script de instalação...
echo.

powershell -ExecutionPolicy Bypass -File install.ps1

pause

