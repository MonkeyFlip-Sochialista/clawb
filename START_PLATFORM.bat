@echo off
TITLE AI MASSIVE HUB - STARTUP
echo [1/2] Actualizando recopilacion masiva (150+ items)...
node scraper.js
echo.
echo [2/2] Iniciando Servidor HTTP para evitar bloqueos del navegador...
echo Si tienes Python instalado, se abrira automaticamente en http://localhost:8000
echo.
echo Presiona una tecla para intentar abrir con Python...
pause
start http://localhost:8000
python -m http.server 8000
pause
