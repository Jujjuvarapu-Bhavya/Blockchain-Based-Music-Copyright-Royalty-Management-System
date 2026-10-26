@echo off
echo ========================================================
echo  Starting Local Ethereum Blockchain Node (Hardhat)
echo ========================================================
cd /d "%~dp0contracts"
set LOCALAPPDATA=%~dp0contracts\.localappdata
npx hardhat node
