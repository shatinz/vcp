@echo off
setlocal EnableDelayedExpansion

title VCP (Visual Click Prompt) - 1-Click Chrome Installer

echo ================================================================================
echo       🚀 Visual Click Prompt (VCP) - 1-Click Chrome Extension Installer
echo ================================================================================
echo.

set "EXT_DIR=%~dp0extension"
if not exist "%EXT_DIR%\manifest.json" (
    echo [ERROR] Could not find extension folder at:
    echo         %EXT_DIR%
    echo Please make sure you run this script from the root of the VCP repository.
    echo.
    pause
    exit /b 1
)

:: 1. Copy extension path to Windows clipboard
powershell -NoProfile -Command "Set-Clipboard -Value '%EXT_DIR%'" >nul 2>&1
echo [✔] Step 1/3: Extension path COPIED to your Windows clipboard:
echo     --^> %EXT_DIR%
echo.

:: 2. Locate Google Chrome
set "CHROME_EXE="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_EXE=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_EXE=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
) else if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_EXE=%LocalAppData%\Google\Chrome\Application\chrome.exe"
)

if defined CHROME_EXE (
    echo [✔] Step 2/3: Opening Google Chrome to extensions management...
    start "" "%CHROME_EXE%" "chrome://extensions"
) else (
    echo [✔] Step 2/3: Opening default browser to extensions management...
    start "" "chrome://extensions"
)

:: 3. Highlight extension folder in Windows Explorer
echo [✔] Step 3/3: Opening folder in Windows Explorer...
explorer /select,"%EXT_DIR%\manifest.json"

echo.
echo ================================================================================
echo                       ⚡ 5-SECOND SETUP IN CHROME:
echo ================================================================================
echo  1. In the Chrome tab that just opened:
echo     Turn ON [Developer mode] toggle switch in the TOP-RIGHT corner.
echo.
echo  2. Click the [Load unpacked] button in the TOP-LEFT corner.
echo.
echo  3. In the folder picker dialog that appears:
echo     Click the address bar or filename box, press Ctrl + V (to paste the path),
echo     and click [Select Folder]!
echo ================================================================================
echo.
echo  🎯 DONE! VCP will appear in your Chrome toolbar.
echo  📌 Pro-tip: Click the puzzle icon in Chrome and PIN VCP for quick access!
echo  ⌨️  Press Alt + Shift + V on any webpage to start visual prompting!
echo.
echo ================================================================================
echo Press any key to exit this installer...
pause >nul
