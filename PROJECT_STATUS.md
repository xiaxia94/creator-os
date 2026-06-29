# Creator OS — 项目状态

> 最后更新：2026-06-24

---

## 一、今天完成的内容

### 1. Bug 修复

**markPublished 函数优化**
- 原问题：modal 中的"标记为已发布"按钮只显示 alert 提示用户运行 CLI 命令
- 修复：改进为友好的交互流程
  - 弹出输入框让用户输入发布 URL（可选）
  - 生成完整的 CLI 命令
  - 自动复制到剪贴板
  - 提示用户在终端运行后刷新页面

### 2. Ingest Prompt 优化（V3）

**主题命名统一**
- 新增标准分类列表（9 个分类）
- 强制要求优先使用已有主题名
- 禁止自由创造新分类名称
- 保持主题名字符串一致性

**去重标准明确化**
- 新增明确的 MERGE 判断条件（3 个条件，满足任一即合并）
- 新增明确的 NEW 判断条件（3 个条件）
- 新增明确的 NEW related 判断条件（2 个条件）
- 要求去重理由必须引用具体内容

**评分理由质量提升**
- 强调理由必须具体化（不要"话题热度高"，要"AI工具类内容搜索量月增30%"）
- 要求理由可验证（基于可观察的事实或合理推断）
- 要求✓/✗平衡（每个维度至少1个✓和1个✗）
- 要求数据支撑（引用具体数据、案例或对比）
- 提供好的理由和差的理由示例

**系列识别改进**
- 新增明确的系列识别标准（3 个条件，必须全部满足）
- 新增系列类型分类（教程系列、案例系列、对比系列、复盘系列）
- 要求系列识别有明确的逻辑关联

**输出格式优化**
- 新增质量检查清单
- 强化输出格式要求

### 3. Screenshots 目录完善

- 更新 README.md，添加详细的截图指南
- 新增截图清单（14 个截图）
- 新增示例数据用于创建一致的截图
- 新增文件大小和命名规范
- 新增快速截图检查清单

---

## 二、当前 Creator OS 已实现功能

### 核心 CLI (`core/topic.js`)

| 命令 | 功能 | 状态 |
|------|------|------|
| `init` | 初始化数据目录 | ✅ |
| `ingest "notes"` | 生成分析 prompt | ✅ |
| `batch '{"topics":[...]}'` | 批量保存+合并+构建（JSON 输入） | ✅ NEW |
| `save --title "..." --viral 85` | 保存选题（带评分） | ✅ |
| `merge <target> <source>` | 合并重复选题 | ✅ |
| `list` | 列表查看 | ✅ |
| `get <id>` | 查看详情 | ✅ |
| `update <id> --key val` | 更新选题 | ✅ |
| `delete <id>` | 删除选题 | ✅ |
| `publish <id> --url "..."` | 标记已发布 | ✅ |
| `build` | 生成 HTML 看板 | ✅ |
| `history` | 查看输入历史 | ✅ |
| `set-config` | 设置配置 | ✅ |
| `set-profile` | 设置创作者画像 | ✅ |

### 使用流程

| 流程 | 说明 | 状态 |
|------|------|------|
| 首次使用 | 用户说"我是XX，主平台XX，目标XX"，AI 自动创建 profile | ✅ |
| 日常使用 | 用户粘贴灵感，AI 自动拆分+去重+分类+评分+保存+build | ✅ V3 |
| 后续交互 | "看看选题库"、"帮我更新 #3"、"标记已发布" 等 | ✅ |

### 评分系统

每条选题 4 个维度，每个维度带 ✓/✗ 理由：

- **爆款指数 (viral)** — 话题热度、标题吸引力、情绪触发、时效性
- **人设价值 (brand)** — 独特性、经历绑定、差异化、长期价值
- **商业价值 (biz)** — 变现路径、目标受众、合作可能性
- **竞争度 (comp)** — 内容供给、头部垄断、差异化空间

综合分 = viral×0.4 + brand×0.3 + (100-comp)×0.3

### 语言系统

| 功能 | 状态 |
|------|------|
| Dashboard Language 切换（zh / en） | ✅ |
| Content Language 保留原文 | ✅ |
| localStorage 持久化 | ✅ |
| 语言提示（浅灰色小字） | ✅ |
| 80+ UI 文案翻译 | ✅ |
| 韩文支持 | ❌ 已删除 |

### HTML 看板板块（12 个）

| # | 板块 | 状态 |
|---|------|------|
| 1 | ✍️ 灵感收件箱 | ✅ i18n |
| 2 | 🆕 本次更新 | ✅ i18n |
| 3 | 🤖 AI 内容总监 | ✅ i18n |
| 4 | 🔥 近期最值得发 | ✅ i18n |
| 5 | 📊 内容生态分析 | ✅ i18n |
| 6 | 📋 选题库 | ✅ i18n |
| 7 | 📚 内容系列 | ✅ i18n |
| 8 | 📈 创作进度 | ✅ i18n |
| 9 | 💎 创作资产 | ✅ i18n |
| 10 | 👤 创作者画像 | ✅ i18n |
| 11 | 🪦 暂不推荐 | ✅ i18n |
| 12 | 🎯 选题价值地图 | ✅ i18n |

### 平台适配器

| 文件 | 状态 |
|------|------|
| `adapters/claude-code/SKILL.md` | ✅ 重写为自然语言流程 |
| `adapters/codex/system-prompt.md` | ✅ 重写 |
| `adapters/cursor/.cursorrules` | ✅ 重写 |
| `adapters/generic/AGENT.md` | ✅ 重写 |

---

## 三、已发现但未解决的问题

### 高优先级

| 问题 | 说明 | 状态 |
|------|------|------|
| **主题名不统一** | LLM 自由生成主题名，"AI工具与效率" vs "AI工具测评" 会分裂成多个主题。prompt 应要求优先使用已有主题名 | ✅ 已修复 |
| **去重标准不明确** | prompt 只给了 MERGE / NEW / NEW related 三种判断，没有明确的判断标准 | ✅ 已修复 |
| **系列识别脱节** | ingest prompt 让 LLM 基于内容关联识别系列，但 build 时只按 theme 字符串分组 | ⚠️ 部分修复（prompt 已优化，build 逻辑未改） |
| **评分理由太泛** | 部分理由没有具体数据支撑，✗ 理由不够深入 | ✅ 已修复 |

### 中优先级

| 问题 | 说明 | 状态 |
|------|------|------|
| **real data 测试不足** | 目前只用 6-8 条模拟数据测试过，需要 20-50 条真实备忘录验证 | ⏳ 待处理 |
| **markPublished 函数缺失** | modal 中引用了 `markPublished()` 但 JS 中未定义 | ✅ 已修复 |
| **seriesSuggest 参数未动态化** | `还差 N 个选题即可形成系列` 中的 N 是硬编码的 2，不是动态计算 | ⏳ 待处理 |
| **default-categories.json 未被引用** | 配置文件定义了 9 个分类，但 prompt 完全没引用 | ✅ 已修复 |

### 低优先级

| 问题 | 说明 | 状态 |
|------|------|------|
| **date locale 不一致** | `toLocaleDateString('zh-CN')` 硬编码，应跟随 Dashboard Language | ⏳ 待处理 |
| **CSS 中仍有韩文残留** | 部分 CSS class 名或注释可能有韩文（不影响功能） | ⏳ 待处理 |

---

## 四、明天建议优先处理事项

| 优先级 | 事项 | 预计工作量 |
|--------|------|-----------|
| 1 | **真实数据测试** — 用 20-50 条真实备忘录跑完整流程，验证 prompt V3 效果 | 1-2 小时 |
| 2 | **系列识别改进** — 在 build 时增加 series 字段，与 prompt 中的系列识别对接 | 1 小时 |
| 3 | **seriesSuggest 动态化** — 将硬编码的 N=2 改为动态计算 | 30 分钟 |
| 4 | **date locale 修复** — 让日期格式跟随 Dashboard Language | 15 分钟 |
| 5 | **截图制作** — 按 screenshots/README.md 指南制作所有截图 | 1 小时 |
| 6 | **GitHub 上传** — 确认所有文件就绪后上传 | 30 分钟 |

---

## 五、当前 GitHub 上传准备情况

| 项目 | 状态 |
|------|------|
| README.md | ✅ 创作者友好，已更新 |
| README.zh-CN.md | ✅ 已同步 |
| SKILL.md | ✅ 自然语言流程，已更新 |
| 其他适配器 | ✅ 已同步 |
| PROJECT_STATUS.md | ✅ 本文件，已更新 |
| core/topic.js | ✅ 含 batch 命令 + i18n + markPublished 修复 |
| core/prompts/ingest.md | ✅ V3 版本，优化主题命名、去重标准、评分理由 |
| core/config/ | ✅ 不变 |
| examples/ | ✅ 不变 |
| screenshots/ | ✅ README 已完善，待制作截图 |
| 韩文残留 | ✅ 已清理 |
| 测试数据 | ⚠️ topics.json 中有测试数据，上传前应清理或保留为示例 |
| preview.html | ⚠️ 是生成文件，建议 .gitignore |

---

## 六、当前语言系统状态

### Dashboard Language

- 支持：`zh`（中文）、`en`（English）
- 默认：`zh`
- 切换方式：点击顶部按钮
- 持久化：localStorage
- 覆盖范围：80+ UI 文案（section 标题、按钮、标签、空状态、modal、评分标签、地图象限）

### Content Language

- 默认：`preserve_original`（保留原文）
- V1 不执行自动翻译
- 预留字段：`supported_content_languages: ['preserve_original', 'zh', 'en']`
- 未来 V2 可支持：Translate to Chinese / Translate to English

### 配置字段

```json
{
  "dashboard_language": "zh",
  "content_language": "preserve_original",
  "supported_dashboard_languages": ["zh", "en"],
  "supported_content_languages": ["preserve_original", "zh", "en"]
}
```

---

## 七、下一步待验证功能

| 功能 | 验证方式 |
|------|---------|
| batch 命令完整流程 | 用真实备忘录测试 init → ingest → batch → build |
| **Ingest Prompt V3** | 用真实数据测试主题命名、去重标准、评分理由质量 |
| **markPublished 交互** | 点击 modal 中的"标记为已发布"按钮，验证交互流程 |
| 语言切换 | 打开 preview.html，点击 EN 验证所有 UI 文案切换 |
| localStorage 持久化 | 切换到 EN 后刷新页面，验证是否保持 EN |
| profile 自动创建 | 删除 config.json 后重新 batch，验证 profile 是否自动创建 |
| 去重合并 | batch 中包含 merges，验证合并后数据正确 |
| modal 详情 | 点击卡片验证 modal 中 i18n 标签正确切换 |
| 响应式布局 | 缩小浏览器窗口验证移动端显示 |
| **截图制作** | 按 screenshots/README.md 指南制作所有截图 |
