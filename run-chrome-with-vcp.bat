@echo off
setlocal EnableDelayedExpansion

title Launch Chrome with VCP Pre-Loaded

set "EXT_DIR=%~dp0extension"
if not exist "%EXT_DIR%\manifest.json" (
    echo [ERROR] Extension directory not found at: %EXT_DIR%
    pause
    exit /b 1
)

set "CHROME_EXE="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_EXE=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_EXE=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
) else if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_EXE=%LocalAppData%\Google\Chrome\Application\chrome.exe"
)

if not defined CHROME_EXE (
    echo [ERROR] Google Chrome was not found in standard paths.
    echo Please run add-to-chrome.bat instead.
    pause
    exit /b 1
)

echo Launching Chrome with VCP extension preloaded...
echo Extension: %EXT_DIR%

start "" "%CHROME_EXE%" --load-extension="%EXT_DIR%" "https://google.com"
exit /b 0
