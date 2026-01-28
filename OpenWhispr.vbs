Set objShell = CreateObject("Shell.Application")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get the script's directory
scriptPath = objFSO.GetParentFolderName(WScript.ScriptFullName)
batPath = scriptPath & "\OpenWhispr.bat"

' Run as administrator (hidden window)
objShell.ShellExecute "cmd.exe", "/c """ & batPath & """", scriptPath, "runas", 0
