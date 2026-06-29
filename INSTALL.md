# Creator OS 安装指南

## 快速安装（3 分钟）

### 方式一：Claude Code 用户（推荐）

**第 1 步：下载项目**

1. 访问 GitHub 项目页面
2. 点击绿色按钮 `Code` → `Download ZIP`
3. 解压到任意位置（比如桌面）

**第 2 步：开始使用**

1. 打开 Claude Code
2. 直接输入你的灵感，例如：
   ```
   我是一个 AI 职场成长创作者，主平台是小红书和 YouTube，目标是建立个人 IP。

   今天想到：
   * Claude Code 比 Cursor 好用
   * AI 周报自动化能节省 2 小时
   ```
3. AI 会自动处理并回复结果

**完成！** 无需其他配置。

---

### 方式二：Cursor 用户

**第 1 步：下载项目**

1. 访问 GitHub 项目页面
2. 点击绿色按钮 `Code` → `Download ZIP`
3. 解压到任意位置

**第 2 步：打开项目**

1. 打开 Cursor
2. 选择 `File` → `Open Folder`
3. 选择解压后的项目文件夹

**第 3 步：开始使用**

1. 在 Cursor 中输入你的灵感
2. AI 会自动处理并回复结果

---

### 方式三：其他 AI 助手

**第 1 步：下载项目**

1. 访问 GitHub 项目页面
2. 点击绿色按钮 `Code` → `Download ZIP`
3. 解压到任意位置

**第 2 步：加载适配器**

根据你使用的 AI 助手，选择对应的适配器文件：

| AI 助手 | 适配器文件 |
|---------|-----------|
| Claude Code | `adapters/claude-code/SKILL.md` |
| Cursor | `adapters/cursor/.cursorrules` |
| Codex | `adapters/codex/system-prompt.md` |
| 其他 | `adapters/generic/AGENT.md` |

**第 3 步：开始使用**

1. 将适配器内容复制到你的 AI 助手中
2. 输入你的灵感
3. AI 会自动处理并回复结果

---

## 验证安装

安装完成后，你可以测试一下：

**输入：**
```
测试 Creator OS
```

**期望输出：**
```
✅ 已为你创建创作者画像！

📥 本次处理 1 个选题：

1. 「测试 Creator OS」
   爆款 50 / 人设 50 / 商业 50 / 竞争 50
   推荐：随时可发

📊 看板已更新，打开 preview.html 查看
```

如果看到类似输出，说明安装成功！

---

## 常见问题

### Q: 我需要安装 Node.js 吗？

**不需要。** Creator OS 的核心功能由 AI 助手处理，你只需要下载项目文件即可。

### Q: 我需要安装 Git 吗？

**不需要。** 你可以直接下载 ZIP 包，无需安装 Git。

### Q: 我的数据保存在哪里？

数据保存在你的电脑上：
- Windows: `C:\Users\你的用户名\.media-topic-skill\`
- Mac: `/Users/你的用户名/.media-topic-skill/`
- Linux: `/home/你的用户名/.media-topic-skill/`

### Q: 如何备份数据？

直接复制 `.media-topic-skill` 文件夹即可。

### Q: 如何更新到新版本？

1. 下载最新版本
2. 覆盖旧文件
3. 你的数据不会丢失

---

## 获取帮助

- **问题反馈**：GitHub Issues
- **功能建议**：GitHub Discussions
- **使用交流**：待创建社区
