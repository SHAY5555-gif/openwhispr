$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:APPDATA\Microsoft\Windows\Start Menu\Programs\OpenWhispr.lnk")
$Shortcut.TargetPath = "c:\projects\open-whispr\OpenWhispr.vbs"
$Shortcut.WorkingDirectory = "c:\projects\open-whispr"
$Shortcut.Description = "OpenWhispr Voice Dictation"
$Shortcut.Save()
Write-Host "Shortcut created in Start Menu! You can now search for 'OpenWhispr' in Start."
