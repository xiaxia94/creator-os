# Creator OS

**Turn ideas into works.**

[English](README.md) | [中文](README.zh-CN.md)

Creator OS is an AI-powered content management system. Just paste your ideas, and AI will automatically organize, categorize, deduplicate, score, and generate a content dashboard.

---

## 🚀 Quick Start

### Step 1: Get the Project

**Option 1: Clone (Recommended)**

Tell your AI:
```
Clone https://github.com/xiaxia94/creator-os and follow the instructions in AGENTS.md to help me manage my content ideas
```

**Option 2: Download ZIP (If Clone Fails)**

If your AI can't clone the repo, open in your browser:
https://github.com/xiaxia94/creator-os
Click the green `Code` button → `Download ZIP` → Extract to the current workspace. Then tell your AI: "The project is downloaded. Follow the instructions in AGENTS.md to help me manage my content ideas."

### Step 2: Tell AI Who You Are (Only Once)

```
I'm an AI creator, main platforms are Xiaohongshu and YouTube, goal is to build personal IP.
```

### Step 3: Paste Ideas

```
Today's thoughts:
* AI weekly report automation saves 2 hours
* Overseas client meetings need timezone confirmation
* Why most people give up learning AI
```

AI will automatically: split → deduplicate → score → generate dashboard.

### Step 4: View Dashboard

Open `preview.html` to see your content dashboard.

That's it! See [USER_GUIDE.md](USER_GUIDE.md) for details.

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
- **Multi-platform creators** — Managing X/Twitter, YouTube, Xiaohongshu, Bilibili, etc.
- **Personal IP builders** — Want data-driven content decisions
- **AI tool enthusiasts** — Want to boost creative efficiency with AI

---

## Complete Example

### Scenario: First Use

**You input:**
```
I'm an AI creator, main platforms are Xiaohongshu and YouTube, goal is to build personal influence.

Today's thoughts:
* AI weekly report automation saves 2 hours
* Overseas client meetings need timezone confirmation
* Why most people give up learning AI
```

**AI responds:**
```
✅ Creator profile created!

📥 Processed 3 topics:

1. "AI Weekly Report: From 2 Hours to 15 Minutes"
   Viral 75 / Brand 65 / Business 70 / Competition 50
   Recommend: This week

2. "5 Pitfalls in Overseas Client Meetings"
   Viral 60 / Brand 80 / Business 55 / Competition 40
   Recommend: Next week

3. "Why 90% of People Give Up Learning AI"
   Viral 80 / Brand 75 / Business 50 / Competition 60
   Recommend: Anytime

🔥 Best pick: "AI Weekly Report Automation"
Reason: High practical value, saves real time for creators

📊 Dashboard updated: ~/.media-topic-skill/preview.html
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

## Screenshots

![Creator OS Dashboard](screenshots/en.png)

*Full dashboard: Idea Inbox, AI Director, Top Picks, Ecosystem Analysis, Topic Library, Content Series, Creator Progress, and Value Map.*

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
├── AGENTS.md                 # Universal entry — all AI tools auto-load
├── CLAUDE.md                 # Claude Code specific
├── .cursorrules              # Cursor auto-loads
├── .codex/skills/            # Codex native Skill (auto-discovered)
│   └── creator-os/SKILL.md
├── core/
│   ├── topic.js              # Core engine
│   ├── prompts/              # AI prompt templates
│   └── config/               # Configuration files
│
├── adapters/                 # Platform adapters (fallback)
│   ├── claude-code/SKILL.md
│   ├── cursor/.cursorrules
│   └── generic/AGENT.md
│
├── examples/                 # Example files
├── screenshots/              # Screenshots
├── skill.md                  # Skill documentation
├── README.md                 # This file
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

Run `git pull` in the project directory. Your data won't be lost.

---

## License

MIT License — see [LICENSE](LICENSE)

Copyright (c) 2026 Creator OS

---

## Feedback & Support

- **Bug reports**: GitHub Issues
- **Feature suggestions**: GitHub Discussions
- **Community**: Coming soon
