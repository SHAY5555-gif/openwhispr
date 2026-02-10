@echo off
:: NOTE: Do NOT run as Administrator - it breaks paste functionality
:: (Windows UIPI blocks elevated apps from sending keystrokes to normal windows)
cd /d "c:\projects\open-whispr"
node_modules\electron\dist\electron.exe .
