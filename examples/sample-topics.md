# 使用示例

## 1. 设置

```bash
node topic.js init
node topic.js set-config persona "理工科转海外运营的ToB媒体主管"
node topic.js set-config language zh
```

## 2. 粘贴备忘录

```
使用 mediatopic，帮我整理：

今天试了一下cursor写代码，真的好用到离谱。
最近在想理工科思维做运营到底有什么优势。
有个想法，想做一个AI工具的横评视频。
同事问我怎么用AI写周报，我直接把prompt给她了。
海外客户开会的时候文化差异真的很大。
```

## 3. AI 输出

```
## 01 AI工具与效率 · 用AI重新定义工作流

| 原始想法 | 选题标题 | 平台 | 形式 | 阶段 | 标签 | 优先级 |
|----------|----------|------|------|------|------|--------|
| cursor好用 | Cursor vs Copilot：我选了它 | 小红书 | 图文 | 现在就能发 | 爆款,实用 | 高 |
| AI工具横评 | 5款AI编程助手横评 | YouTube | 长文 | 现在就能发 | 爆款,实用 | 高 |
| AI写周报 | AI把周报从2小时缩到15分钟 | 小红书 | 图文 | 1000粉后发 | 爆款,实用 | 中 |

## 02 职业成长路径 · 从理工科到运营主管

| 原始想法 | 选题标题 | 平台 | 形式 | 阶段 | 标签 | 优先级 |
|----------|----------|------|------|------|------|--------|
| 理工科思维 | 理工科做运营的3个天然优势 | LinkedIn | 图文 | 现在就能发 | 人设 | 中 |

## 03 海外运营实战 · 跨文化沟通

| 原始想法 | 选题标题 | 平台 | 形式 | 阶段 | 标签 | 优先级 |
|----------|----------|------|------|------|------|--------|
| 海外文化差异 | 和海外客户开会差点踩雷 | 小红书 | 图文 | 有案例后发 | 情绪 | 低 |
```

## 4. 保存

```bash
node topic.js save --theme "AI工具与效率" --title "Cursor vs Copilot" --raw "cursor好用" --platform "小红书" --format "图文" --stage "现在就能发" --tags "爆款,实用" --priority "高"
node topic.js save --theme "AI工具与效率" --title "5款AI编程助手横评" --raw "AI工具横评" --platform "YouTube" --format "长文" --stage "现在就能发" --tags "爆款,实用" --priority "高"
# ... 更多选题
```

## 5. 生成 HTML

```bash
node topic.js build
# → 生成 preview.html，浏览器打开即可
```

## 6. 发布后标记

```bash
node topic.js publish 1
node topic.js publish 1 --url "https://xiaohongshu.com/..."
node topic.js build  # 更新HTML
```
