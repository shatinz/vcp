@echo off
echo Registering vcp:// custom URL protocol in Windows Registry...

reg add "HKCU\Software\Classes\vcp" /ve /d "URL:Visual Click Prompt Protocol" /f >nul
reg add "HKCU\Software\Classes\vcp" /v "URL Protocol" /d "" /f >nul
reg add "HKCU\Software\Classes\vcp\shell\open\command" /ve /d "\"%~dp0start-bridge.bat\"" /f >nul

if %ERRORLEVEL% EQU 0 (
  echo [SUCCESS] vcp:// protocol registered successfully! Clicking "Start Bridge" in Chrome will launch the bridge.
) else (
  echo [ERROR] Failed to register protocol.
)
