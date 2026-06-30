# Creator OS — Codex 启动脚本
# 以正确的权限设置启动 Codex CLI
# 用法：右键 → 使用 PowerShell 运行，或在终端中执行：.\start-codex.ps1

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "  🧠 Creator OS — 启动 Codex" -ForegroundColor Cyan
Write-Host "  项目目录：$scriptDir" -ForegroundColor Gray
Write-Host ""

# 以 workspace-write 模式启动，允许 AI 写入项目文件和数据目录
codex -s workspace-write -a on-request -C "$scriptDir"
