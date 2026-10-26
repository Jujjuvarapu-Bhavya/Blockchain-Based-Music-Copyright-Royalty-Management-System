@echo off
echo ========================================================
echo  Deploying Music Copyright Smart Contract
echo ========================================================
cd /d "%~dp0contracts"
set LOCALAPPDATA=%~dp0contracts\.localappdata
npx hardhat run scripts/deploy.js --network localhost
echo Deployment complete. Contract address saved to shared/contract-deployment.json
