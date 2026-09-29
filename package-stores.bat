@echo off
setlocal

title Package VCP for All Free Stores

echo Building packages for Microsoft Edge, Firefox AMO, Opera, and Chrome...
node "%~dp0package-all-stores.js"

if %ERRORLEVEL% equ 0 (
    echo.
    echo [SUCCESS] All store archives generated in %~dp0dist\
) else (
    echo.
    echo [ERROR] Packaging failed with error code %ERRORLEVEL%
)

pause
