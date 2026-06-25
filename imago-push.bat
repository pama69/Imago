@echo off
echo === Setup repo Imago ===

cd /d "C:\Users\Utente\Desktop\Imago Repo"

REM Rimuove il lock file se esiste
if exist ".git\index.lock" del ".git\index.lock"

REM Configura identita' git
git config user.email "pama69@gmail.com"
git config user.name "pama69"

REM Corregge URL remote
git remote set-url origin https://github.com/pama69/Imago.git

REM Crea README e fa il commit iniziale
echo # Imago > README.md
git add README.md
git commit -m "Initial commit"

REM Push su GitHub (ti chiedera' le credenziali)
git push -u origin main

echo.
echo === Fatto! Premi un tasto per chiudere ===
pause
