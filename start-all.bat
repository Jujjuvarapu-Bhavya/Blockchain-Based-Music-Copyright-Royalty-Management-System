@echo off
echo ========================================================
echo  Launching Blockchain-Based Music Copyright System
echo ========================================================

start "MusicChain Backend API [Port 5050]" cmd /k "cd /d "%~dp0backend" && node server.js"
start "MusicChain React Frontend [Port 3000]" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Both Backend (http://localhost:5050) and Frontend (http://localhost:3000) are starting.
echo Browser UI will be available at: http://localhost:3000
echo.
echo Note: If you want to run the local Ethereum node, execute start-blockchain.bat in a separate terminal.
echo The backend runs seamlessly in hybrid mode with live on-chain capability or resilient simulated EVM ledger!
pause
