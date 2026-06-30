---
name: creator-os
description: Creator OS — The creator's second brain. Paste ideas, get organized, scored, and published.
---

# Creator OS

**Turn ideas into works.**

Creator OS is an AI-powered content management system. Just paste your ideas, and AI will automatically organize, categorize, deduplicate, score, and generate a content dashboard.

---

## What is Creator OS?

Creator OS is an **AI content assistant** that helps you:

- 📥 **Collect ideas** — Record thoughts anytime, no format required
- 🤖 **Smart analysis** — AI auto-splits, categorizes, and deduplicates
- 📊 **4D scoring** — Viral potential, brand value, business value, competition
- 📋 **Content dashboard** — Visual display of all topics and progress
- 🎯 **Publishing suggestions** — AI recommends what to publish next

---

## Who is it For?

- **Content creators** — Want to systematize ideas and topics
- **Multi-platform creators** — Managing Xiaohongshu, YouTube, Bilibili, etc.
- **Personal IP builders** — Want data-driven content decisions
- **AI tool enthusiasts** — Want to boost creative efficiency with AI

---

## Quick Start

### First-time Setup (Only Once)

Tell Creator OS who you are:

```
I'm an AI career growth creator.
Main platforms: Xiaohongshu and YouTube.
Goal: Build personal IP.
```

Creator OS will remember your profile forever.

### Daily Use

Just paste your ideas to AI:

```
Claude Code is way better than Cursor for complex projects.
AI weekly report automation saved me 2 hours per week.
Biggest mistake when meeting overseas clients: not confirming timezone.
Why most people give up learning AI: no immediate ROI.
My biggest win from building websites wasn't the code.
```

Or paste a full memo:

```
Today's thoughts:
* Claude Code is way better than Cursor
* AI weekly report automation
* Overseas client meeting pitfalls
* Why people give up on AI learning
* My website building lessons
```

---

## What AI Does Automatically

✓ Split ideas into independent topics

✓ Organize into different themes

✓ Identify and merge duplicates

✓ 4D scoring (Viral/Brand/Business/Competition)

✓ Identify content series

✓ Recommend what to publish next

✓ Generate content dashboard

---

## What You Get

✓ Organized topic library

✓ Content ecosystem analysis

✓ Content series suggestions

✓ Creator progress stats

✓ AI content director suggestions

✓ Top publishing recommendations

✓ Visual content dashboard

---

## Complete Example

### Scenario: First Use

**You input:**
```
I'm an AI career growth creator, main platforms are Xiaohongshu and YouTube, goal is to build personal IP.

Today's thoughts:
* Claude Code is way better than Cursor
* AI weekly report automation saves 2 hours
* Overseas client meetings need timezone confirmation
```

**AI responds:**
```
✅ Creator profile created!

📥 Processed 3 topics:

1. "Claude Code vs Cursor: Why I Switched"
   Viral 85 / Brand 70 / Business 60 / Competition 45
   Recommend: This week

2. "AI Weekly Report: From 2 Hours to 15 Minutes"
   Viral 75 / Brand 65 / Business 70 / Competition 50
   Recommend: Next week

3. "5 Pitfalls in Overseas Client Meetings"
   Viral 60 / Brand 80 / Business 55 / Competition 40
   Recommend: Anytime

🔥 Best pick: "Claude Code vs Cursor"
Reason: AI tools content has high search volume, and you have real experience

📊 Dashboard updated: <data-dir>/preview.html
```

---

## Dashboard Features

Creator OS generates a visual content dashboard with:

| Section | Function |
|---------|----------|
| ✍️ Idea Inbox | Recent recorded ideas |
| 🤖 AI Director | AI content strategy suggestions |
| 🔥 Top Picks | Top 3 topics by composite score |
| 📊 Ecosystem | Theme distribution and balance analysis |
| 📋 Topic Library | All topics, grouped by theme |
| 📚 Content Series | Auto-detected content series |
| 📈 Progress | Creator stats and milestones |
| 💎 Assets | Total ideas, topics, merges |
| 👤 Profile | Your creator information |
| 🪦 Not Recommended | Low-scoring or unsuitable topics |
| 🎯 Value Map | Visual topic distribution |

---

## Supported Languages

- **Interface language**: Chinese / English
- **Content language**: Preserves original (default)

You can switch interface language in the dashboard, but content keeps its original language.

---

## Data Location

Creator OS auto-detects a writable location for your data:

```
~/.media-topic-skill/  or  <project>/data/
├── topics.json      # Topic database
├── config.json      # Your config and profile
├── inbox-log.md     # Input history
└── preview.html     # Generated dashboard
```

**Backup suggestion:** Regularly backup the data folder

---

## Project Structure

```
creator-os/
├── core/
│   ├── topic.js              # Core engine
│   ├── prompts/              # AI prompt templates
│   └── config/               # Configuration files
│
├── .codex/skills/            # Codex native Skill (auto-discovered)
│   └── creator-os/SKILL.md
│
├── adapters/                 # Platform adapters
│   ├── claude-code/SKILL.md
│   ├── cursor/.cursorrules
│   └── generic/AGENT.md
│
├── examples/                 # Example files
├── screenshots/              # Screenshots
├── skill.md                  # This file
├── README.md                 # English documentation
├── README.zh-CN.md           # Chinese documentation
├── LICENSE                   # MIT License
└── .gitignore
```

---

## FAQ

### Q: Do I need to know how to code?

**No.** Creator OS is designed for regular creators. You just need:
1. Install an AI assistant (like Claude Code)
2. Download the project
3. Start using

### Q: Is my data safe?

**Completely safe.** All data is saved on your computer, not uploaded to any server.

### Q: Which platforms are supported?

All major content platforms: Xiaohongshu, YouTube, Bilibili, Douyin, WeChat Official Account, Zhihu, X/Twitter, etc.

### Q: Can multiple people collaborate?

Currently only supports single-user use. Team collaboration may be added in the future.

### Q: How do I update to a new version?

Download the latest version and overwrite old files. Your data won't be lost.

---

## License

MIT License — see [LICENSE](LICENSE)

Copyright (c) 2026 Creator OS
