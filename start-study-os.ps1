$ErrorActionPreference = "Stop"
$studyProject = $PSScriptRoot
$studyNode = (Get-Command node.exe -ErrorAction Stop).Source
# Keep compatibility with the existing local shortcut/autostart, but no absolute
# user-specific paths. This helper does not create a scheduled task or installer.
Start-Process -FilePath $studyNode -ArgumentList @("scripts/start-local.mjs") -WorkingDirectory $studyProject -WindowStyle Hidden
