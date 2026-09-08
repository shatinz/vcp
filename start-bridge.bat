@echo off
title VCP Antigravity Bridge Daemon
echo ===================================================
echo   Starting VCP Antigravity Bridge (127.0.0.1:8765)
echo ===================================================
cd /d "%~dp0bridge"
node server.js
pause
