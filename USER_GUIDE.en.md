# Creator OS User Guide

> 🎯 A complete guide for new users

[English](USER_GUIDE.en.md) | [中文](USER_GUIDE.md)

---

## 🚀 Quick Start in 5 Minutes

### Step 1: Install Creator OS

#### Option A: Claude Code Users (Recommended)

1. **Download the project**
   - Click the green `Code` button on GitHub → `Download ZIP`
   - Extract to any location (like Desktop)

2. **Use in Claude Code**
   - Open Claude Code
   - Start using directly (Claude Code will auto-detect the skill)

#### Option B: Codex Users

1. Download and extract the project
2. Open Codex, load the project folder
3. Start using in Codex

#### Option C: Cursor Users

1. Download and extract the project
2. Open Cursor, load the project folder
3. Start using in Cursor

#### Option D: Other AI Assistants

1. Download and extract the project
2. Load the `skill.md` or adapter files from `adapters/` into your AI assistant
3. Start using

---

### Step 2: First Use — Tell AI Who You Are

**Only need to say once**, Creator OS will remember your identity:

```
I'm an AI creator.
Main platforms: Xiaohongshu and YouTube.
Goal: Build personal influence.
```

Or more detailed:

```
I'm an AI creator.
Main platforms: Xiaohongshu, WeChat Official Account, YouTube.
Goal: Share AI tools and creation experience.
Current stage: Just starting, less than 1000 followers.
```

**AI will automatically:**
- ✅ Create your creator profile
- ✅ Initialize topic library
- ✅ Ready to receive your ideas

---

### Step 3: Daily Use — Paste Ideas

**No format required**, just paste your thoughts:

#### Example 1: Random Ideas

```
AI weekly report automation saves me 2 hours per week
Biggest mistake when meeting overseas clients: not confirming timezone
Why most people give up learning AI: no immediate ROI
```

#### Example 2: Full Memo

```
Today's thoughts:
* AI weekly report automation really saves time, from 2 hours to 15 minutes
* Must confirm timezone when meeting overseas clients, almost missed last time
* Many people give up learning AI because they can't see immediate results
```

#### Example 3: Ideas + Profile (First Use)

```
I'm an AI creator, main platforms are Xiaohongshu and YouTube.

Today's ideas:
* AI weekly report automation: from 2 hours to 15 minutes
* 5 pitfalls in overseas client meetings
* Why 90% of people give up learning AI
```

---

### Step 4: View Results

After AI processing, you'll see:

```
✅ Processing complete!

📥 Added 3 new topics:
1. "AI Weekly Report: From 2 Hours to 15 Minutes"
   Viral 75 / Brand 65 (Recommend: This week)

2. "5 Pitfalls in Overseas Client Meetings"
   Viral 60 / Brand 80 (Recommend: Next week)

3. "Why 90% of People Give Up Learning AI"
   Viral 80 / Brand 75 (Recommend: Anytime)

🔥 Best pick: "AI Weekly Report Automation"
Reason: High practical value, saves real time for creators

📊 Dashboard updated: ~/.media-topic-skill/preview.html
```

**Then you can:**
- Open the dashboard file (path shown above) to view the visual dashboard
- Continue inputting more ideas
- Ask AI which topic is most worth publishing

---

## 📱 Follow-up Interaction Examples

### View Topic Library

```
Show me my topic library
```

AI will list all topics, grouped by theme.

### View Topic Details

```
Show me topic #3
```

AI will display detailed information and scores for that topic.

### Update Topic

```
Update topic #3, change platform to Bilibili, format to short video
```

### Merge Duplicate Topics

```
I think #2 and #5 are about the same thing, merge them
```

### Mark as Published

```
Topic #1 has been published to Xiaohongshu, link is https://...
```

### Get Publishing Suggestions

```
What should I publish now?
```

AI will sort by composite score and recommend Top 3.

### Generate Dashboard

```
Update my dashboard
```

Regenerate `preview.html`.

---

## 🎯 Scoring System

Each topic is scored on 4 dimensions (0-100):

| Dimension | Description | Criteria |
|-----------|-------------|----------|
| 🔥 Viral | How many people want to see it? | Topic heat, title appeal, emotional trigger, timeliness |
| 👤 Brand | How much does it help personal brand? | Uniqueness, experience binding, differentiation, long-term value |
| 💰 Business | How many business opportunities? | Monetization path, audience purchasing power, collaboration potential |
| ⚔️ Competition | How competitive is this track? | Content supply, top monopoly, differentiation space (lower is better) |

**Composite = Viral×0.4 + Brand×0.3 + (100-Competition)×0.3**

---

## 📊 Dashboard Features

Open the dashboard file (`preview.html` in your data directory), you'll see:

1. **✍️ Idea Inbox** — Recent input ideas
2. **🤖 AI Director** — AI content strategy suggestions
3. **🔥 Top Picks** — Top 3 recommended topics
4. **📊 Ecosystem** — Theme distribution balance
5. **📋 Topic Library** — All topics, grouped by theme
6. **📚 Content Series** — Auto-detected content series
7. **📈 Progress** — Statistics
8. **💎 Assets** — Cumulative data
9. **👤 Profile** — Your identity info
10. **🪦 Not Recommended** — Low-scoring or unsuitable topics
11. **🎯 Value Map** — Visual distribution

---

## 💡 Usage Tips

### 1. Batch Input is More Efficient

Input 5-10 ideas at once, more efficient than one by one.

### 2. Don't Worry About Format

AI will auto-identify and organize, you just need to express ideas.

### 3. Review Dashboard Regularly

Open `preview.html` every week to understand your content ecosystem.

### 4. Use "Series" Feature

If multiple ideas are related, AI will auto-identify as a series.

### 5. Mark as Published Promptly

After publishing, tell AI, it will update status and recommend next.

---

## ❓ FAQ

### Q: Do I need technical skills?

**No.** You just need to know how to copy and paste.

### Q: Is my data safe?

**Completely safe.** All data is on your computer, not uploaded to any server.

### Q: Which platforms are supported?

All major platforms: Xiaohongshu, YouTube, Bilibili, Douyin, WeChat Official Account, Zhihu, X/Twitter, etc.

### Q: Can multiple people collaborate?

Currently only supports single-user use. Team collaboration may be added in the future.

### Q: How to update version?

Download the latest version and overwrite old files. Your data won't be lost.

---

## 🆘 Encountering Problems?

### Problem 1: AI didn't auto-process

**Solution:** Make sure you've told AI who you are (first use).

### Problem 2: Dashboard not updated

**Solution:** Ask AI to "update my dashboard" or "regenerate preview.html".

### Problem 3: Topic scoring不合理

**Solution:** Tell AI "I think topic #X score is too high/low because...", AI will adjust.

### Problem 4: Want to delete a topic

**Solution:** Tell AI "delete topic #X".

---

## 📞 Get Help

- **GitHub Issues**: Submit bug reports or feature requests
- **Discussions**: Community discussion and Q&A
- **Documentation**: See README.md and PROJECT_STATUS.md

---

## 🎉 Start Using

Now you understand how to use Creator OS.

**Next steps:**
1. Install Creator OS
2. Tell AI who you are
3. Paste your first idea

**Happy creating!** 🚀

---

*Creator OS — Turn ideas into works.*
