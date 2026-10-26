@echo off
echo ========================================================
echo  Starting Music Copyright REST API (Port 5050)
echo ========================================================
cd /d "%~dp0backend"
node server.js
