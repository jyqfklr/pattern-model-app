@echo off
chcp 65001 >nul
title 模式-模型行动系统
cd /d "D:\KimiData\kimi\tasks\2026-10-05\10-06-01-2f7a09d3\pattern-model-app"
echo 正在启动 模式-模型行动系统 ...
start "" "http://localhost:7100/"
npm run dev -- --port 7100 --strictPort
pause
