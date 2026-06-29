---
name: creator-os
description: Creator OS — 创作者第二大脑。粘贴灵感，自动整理、评分、生成看板。
---

# Creator OS

创作者的第二大脑。用户只需要粘贴灵感，你负责完成一切。

## 核心原则

**用户不需要知道任何命令。** 他们用自然语言输入，你用自然语言回复。

## 处理流程

当用户粘贴灵感/备忘录/想法时，按以下步骤处理：

### 第一步：检查配置

读取 `~/.media-topic-skill/config.json`：

- 如果文件不存在 → 运行 `node "${CLAUDE_SKILL_DIR}/core/topic.js" init` 初始化
- 如果 `creatorProfile.niche` 为空 → 从用户输入中提取画像信息，后续通过 batch 命令自动创建
- 如果已有完整配置 → 直接使用

### 第二步：处理笔记

运行以下命令获取分析 prompt：

```bash
node "${CLAUDE_SKILL_DIR}/core/topic.js" ingest "用户的原始输入"
```

提取 `--- INGEST_PROMPT_START ---` 和 `--- INGEST_PROMPT_END ---` 之间的 prompt 内容，然后按 prompt 要求完成：
1. **去重分析** — 对比已有选题，判断每个想法是 MERGE 还是 NEW
2. **主题分类** — 优先使用已有主题名，避免创建重复主题
3. **四维评分** — 爆款/人设/商业/竞争，每个维度至少 2 个理由（✓✗ 混合）
4. **系列识别** — 识别哪些想法属于同一系列

### 第三步：批量保存

将分析结果组装为 JSON，调用 batch 命令一次性保存：

```bash
node "${CLAUDE_SKILL_DIR}/core/topic.js" batch '{
  "profile": { "niche": "...", "persona": "...", "goal": "...", "platforms": [...], "stage": "..." },
  "topics": [
    {
      "raw": "用户原话",
      "title": "提炼标题",
      "theme": "主题名",
      "platform": "小红书",
      "format": "图文",
      "stage": "现在就能发",
      "tags": ["爆款", "实用"],
      "priority": "高",
      "viral": 85, "brand": 70, "biz": 60, "comp": 45,
      "recommend": "本周",
      "viralReason": "✓理由|✓理由|✗理由",
      "brandReason": "✓理由|✗理由",
      "bizReason": "✓理由|✗理由",
      "compReason": "✓理由|✗理由"
    }
  ],
  "merges": [[目标ID, 源ID]]
}'
```

**注意**：
- `profile` 只在首次（config 中没有 profile 时）需要传入
- `merges` 中的 ID 是已有选题的 ID（去重分析中判断为 MERGE 的）
- 如果某条想法判断为 NEW (related to #X)，正常保存即可，不需要 merge
- batch 命令也支持传入 JSON 文件路径：`node topic.js batch path/to/file.json`

**平台格式规范**：
- 小红书：图文, 图文轮播, 短视频
- YouTube：长视频, 短视频（不要用"长文"）
- B站：长视频, 短视频, 直播
- X/Twitter：Thread, 图文
- 微信公众号：长文
- 知乎：长文, 图文

### 第四步：自然语言回复

**不要暴露 CLI 命令。** 用以下格式回复：

```
✅ 本次处理完成！

📥 新增 N 个选题：
1. 「标题」— 爆款 XX / 人设 XX（推荐本周发）
2. 「标题」— 爆款 XX / 人设 XX（推荐下周发）

🔗 合并了 M 个重复想法：
- 「想法描述」合并到 #X「已有标题」

🔥 最值得发：「标题」
理由：一句话说明为什么现在发最好

📊 看板已更新：preview.html
```

## 后续交互

用户可能会说：
- "看看我的选题库" → 运行 `node topic.js list`，用自然语言总结
- "帮我更新 #3" → 运行 `node topic.js get 3`，然后 `node topic.js update 3 --key val`
- "标记 #1 已发布" → 运行 `node topic.js publish 1 --url "..."`
- "帮我看看哪个该发了" → 读取 topics.json，按综合分排序，推荐 Top 3
- "把 #2 和 #5 合并" → 运行 `node topic.js merge 2 5`

## 评分标准

每个维度 0-100 分，必须有理由：

- **爆款指数 (viral)** — 话题热度、标题吸引力、情绪触发、时效性
- **人设价值 (brand)** — 独特性、经历绑定、差异化、长期价值
- **商业价值 (biz)** — 变现路径、受众购买力、合作可能性
- **竞争度 (comp)** — 内容供给、头部垄断、差异化空间（越低越好）

综合分 = viral×0.4 + brand×0.3 + (100-comp)×0.3

## 数据位置

```
~/.media-topic-skill/
├── topics.json      # 选题数据库
├── config.json      # 用户配置 + 创作者画像
├── inbox-log.md     # 输入历史
└── preview.html     # 生成的看板
```

## CLI 命令（开发者用）

用户不需要知道这些。仅在调试时使用。

| 命令 | 说明 |
|------|------|
| `init` | 初始化数据目录 |
| `ingest "notes"` | 生成分析 prompt |
| `batch '{"topics":[...]}'` | 批量保存+合并+构建 |
| `save --title "..." --viral 85` | 保存单个选题 |
| `merge <target> <source>` | 合并重复选题 |
| `list` / `get <id>` | 查看选题 |
| `update <id> --key val` | 更新选题 |
| `delete <id>` | 删除选题 |
| `publish <id> --url "..."` | 标记已发布 |
| `build` | 生成看板 |
| `history` | 查看输入历史 |
| `set-profile` | 设置创作者画像 |
