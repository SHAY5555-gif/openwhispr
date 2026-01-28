@echo off
:: Check for admin rights and self-elevate if needed
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting administrator privileges...
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

:: Run the app
cd /d "c:\projects\open-whispr"
node_modules\electron\dist\electron.exe .
