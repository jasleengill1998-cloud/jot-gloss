@echo off
:loop
cd /d "C:\Users\jasle\Desktop\jot-gloss"
git pull --quiet
timeout /t 15 /nobreak >nul
goto loop
