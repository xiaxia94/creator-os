#!/bin/bash
# Creator OS — Codex 启动脚本
# 以正确的权限设置启动 Codex CLI
# 用法：chmod +x start-codex.sh && ./start-codex.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "  🧠 Creator OS — 启动 Codex"
echo "  项目目录：$SCRIPT_DIR"
echo ""

# 以 workspace-write 模式启动，允许 AI 写入项目文件和数据目录
codex -s workspace-write -a on-request -C "$SCRIPT_DIR"
