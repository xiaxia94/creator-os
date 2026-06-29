# Screenshots

This directory contains screenshots of Creator OS dashboard.

## Required Screenshots

| File | Description | Section |
|------|-------------|---------|
| `dashboard-overview.png` | Full dashboard overview showing all sections | Top to bottom |
| `hero-section.png` | Hero section with stats and today's pick | Top |
| `idea-inbox.png` | Idea Inbox section with recent inputs | Section 1 |
| `ai-director.png` | AI Content Director insights and recommendations | Section 2 |
| `top-picks.png` | Top 3 picks with scores | Section 3 |
| `ecosystem-analysis.png` | Content ecosystem analysis with theme distribution | Section 4 |
| `topic-library.png` | Topic library organized by themes | Section 5 |
| `content-series.png` | Content series tracking and suggestions | Section 6 |
| `creator-progress.png` | Creator progress stats and milestones | Section 7 |
| `creator-assets.png` | Creator assets overview | Section 8 |
| `creator-profile.png` | Creator profile information | Section 9 |
| `graveyard.png` | Not recommended topics | Section 10 |
| `value-map.png` | Topic value map with viral vs brand positioning | Section 11 |
| `topic-modal.png` | Topic detail modal with scores | Modal |

## How to Take Screenshots

### Step 1: Generate Dashboard
```bash
cd D:\claudecode\media-topic-skill
node core/topic.js build
```

### Step 2: Open in Browser
- Open `preview.html` in Chrome (recommended)
- Set browser width to 1440px for best quality

### Step 3: Set Language
- Click "EN" button for English version
- Or keep "中文" for Chinese version

### Step 4: Take Screenshots
- Use Windows Snipping Tool (Win + Shift + S)
- Or use browser extensions like "Full Page Screen Capture"
- Save as PNG with the filenames listed above

## Screenshot Guidelines

### Quality Requirements
- **Resolution**: 1440px width minimum
- **Format**: PNG (for clarity)
- **Browser**: Chrome (consistent rendering)

### Content Requirements
- Use sample data that showcases all features
- Ensure all sections have content (no empty states)
- Include realistic topic titles and scores
- Show both positive and negative score reasons

### Visual Requirements
- Clean, professional appearance
- No browser tabs or bookmarks visible
- Consistent styling across all screenshots
- Good contrast and readability

### Naming Convention
- Use lowercase with hyphens: `section-name.png`
- Be descriptive: `ai-director.png` not `section2.png`
- Include both Chinese and English versions if possible: `dashboard-zh.png`, `dashboard-en.png`

## Sample Data for Screenshots

To create consistent screenshots, use this sample data:

```json
{
  "topics": [
    {
      "title": "5个AI工具让我的周报效率提升10倍",
      "theme": "AI工具测评",
      "platform": "小红书",
      "format": "图文",
      "viral": 85,
      "brand": 70,
      "biz": 60,
      "comp": 45
    },
    {
      "title": "理工科转行运营：我是如何从0到1的",
      "theme": "理工转运营",
      "platform": "公众号",
      "format": "长文",
      "viral": 75,
      "brand": 85,
      "biz": 55,
      "comp": 40
    }
  ]
}
```

## Quick Screenshot Checklist

- [ ] Dashboard overview (full page)
- [ ] Hero section with stats
- [ ] Idea inbox with recent items
- [ ] AI Director with insights
- [ ] Top picks with scores
- [ ] Ecosystem analysis chart
- [ ] Topic library with cards
- [ ] Content series tracking
- [ ] Creator progress stats
- [ ] Creator assets overview
- [ ] Creator profile info
- [ ] Not recommended section
- [ ] Value map visualization
- [ ] Topic detail modal

## File Size Guidelines

- Keep each screenshot under 500KB
- Use PNG compression tools if needed
- Consider WebP format for GitHub (smaller size)

## Usage in Documentation

These screenshots are used in:
- `README.md` — Main documentation
- `README.zh-CN.md` — Chinese documentation
- `skill.md` — Skill description
- GitHub repository showcase

## Backup

Keep original high-resolution screenshots in a separate folder for future use.
