#!/usr/bin/env node

/**
 * Creator OS — Sustainable Creative Second Brain
 *
 * Core commands:
 *   init                    Initialize
 *   ingest "new notes"      Process new ideas (dedup + merge + classify)
 *   list                    List all topics
 *   get <id>                View detail
 *   update <id> --key val   Update topic
 *   delete <id>             Delete topic
 *   publish <id> [--url]    Mark published
 *   build                   Generate dashboard HTML
 *   history                 View inbox log
 *   config / set-config     Configuration
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(homedir(), '.media-topic-skill');
const TOPICS_FILE = join(DATA_DIR, 'topics.json');
const CONFIG_FILE = join(DATA_DIR, 'config.json');
const INBOX_FILE = join(DATA_DIR, 'inbox-log.md');
const PROMPTS_DIR = join(__dirname, 'prompts');

function ensureDataDir() { if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true }); }
function readJSON(p, fb = null) { try { return JSON.parse(readFileSync(p, 'utf-8')); } catch { return fb; } }
function writeJSON(p, d) { ensureDataDir(); writeFileSync(p, JSON.stringify(d, null, 2) + '\n', 'utf-8'); }
function readPrompt(n) { try { return readFileSync(join(PROMPTS_DIR, `${n}.md`), 'utf-8'); } catch { return null; } }
function now() { return new Date().toISOString(); }
function today() { return new Date().toISOString().split('T')[0]; }
function loadTopics() { return readJSON(TOPICS_FILE, { topics: [], nextId: 1, lastUpdate: null, updateLog: [] }); }
function loadConfig() { return readJSON(CONFIG_FILE, null); }
function esc(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function logInbox(input, summary) {
  ensureDataDir();
  const entry = `\n## ${today()} ${new Date().toLocaleTimeString('zh-CN')}\n\n**输入：**\n\`\`\`\n${input}\n\`\`\`\n\n**结果：** ${summary}\n`;
  if (!existsSync(INBOX_FILE)) {
    writeFileSync(INBOX_FILE, '# 📥 Inbox Log\n\n记录每次输入的原始内容和处理结果。\n' + entry, 'utf-8');
  } else {
    appendFileSync(INBOX_FILE, entry, 'utf-8');
  }
}

// ========== Commands ==========

function cmdInit() {
  ensureDataDir();
  if (existsSync(CONFIG_FILE)) { console.log('⚠️  Already initialized.'); return; }
  writeJSON(CONFIG_FILE, {
    language: 'zh', persona: 'Content Creator',
    dashboard_language: 'zh',
    content_language: 'preserve_original',
    supported_dashboard_languages: ['zh', 'en'],
    supported_content_languages: ['preserve_original', 'zh', 'en'],
    creatorProfile: {
      niche: '',
      persona: '',
      goal: '',
      platforms: [],
      stage: ''
    },
    followers: { xiaohongshu: 0, youtube: 0, wechat: 0, linkedin: 0, channels: 0 },
    defaultPlatforms: ['小红书', '视频号', '公众号', 'LinkedIn', 'YouTube'],
    onboardingComplete: false,
    stats: { totalInputs: 0, totalMerges: 0, totalSeries: 0 }
  });
  writeJSON(TOPICS_FILE, { topics: [], nextId: 1, lastUpdate: null, updateLog: [] });
  console.log('✅ Creator OS initialized!\n   Data: ' + DATA_DIR);
  console.log('\nNext steps:');
  console.log('  1. node topic.js set-config persona "Your persona"');
  console.log('  2. node topic.js set-config language zh|en|kr');
  console.log('  3. node topic.js ingest "your first batch of notes"');
}

function cmdIngest(text) {
  if (!text) { console.error('❌ node topic.js ingest "your notes"'); process.exit(1); }
  const config = loadConfig();
  const data = loadTopics();
  const prompt = readPrompt('ingest');
  if (!prompt) { console.error('❌ prompts/ingest.md not found'); process.exit(1); }

  // Build existing topics summary for dedup
  const existingSummary = data.topics.map(t => {
    return `#${t.id} [${t.theme || '未分类'}] "${t.title || t.raw}" (tags: ${(t.valueTags || []).join(',')}, viral:${t.viralScore || '-'}, brand:${t.brandScore || '-'})`;
  }).join('\n');

  const lang = config?.language || 'zh';
  const li = { zh: '请用中文回复。', en: 'Reply in English.' };

  const filled = prompt
    .replace('{persona}', config?.persona || 'Content Creator')
    .replace('{language_instruction}', li[lang] || li.zh)
    .replace('{existing_topics}', existingSummary || '（暂无选题，这是第一次输入）')
    .replace('{new_input}', text);

  // Log to inbox
  logInbox(text, '已输出 ingest prompt，等待 AI 处理');

  console.log('--- INGEST_PROMPT_START ---');
  console.log(filled);
  console.log('--- INGEST_PROMPT_END ---');
  console.log('\n💡 Agent: 处理完 prompt 后，请用以下命令保存选题：');
  console.log('  node topic.js save --title "..." --theme "..." --viral 85 --brand 70 ...');
  console.log('  保存完成后运行: node topic.js build');
}

function cmdSave(args) {
  const data = loadTopics();
  const p = {};
  for (let i = 0; i < args.length; i += 2) { const k = args[i]?.replace(/^--/, ''); if (k && args[i + 1]) p[k] = args[i + 1]; }
  const t = {
    id: data.nextId, raw: p.raw || '', title: p.title || '', theme: p.theme || null,
    platform: p.platform || null, format: p.format || null, stage: p.stage || null,
    valueTags: p.tags ? p.tags.split(',').map(s => s.trim()) : [],
    priority: p.priority || null, note: p.note || null,
    status: 'draft', publishedAt: null, publishUrl: null,
    viralScore: parseInt(p.viral) || null, brandScore: parseInt(p.brand) || null,
    bizScore: parseInt(p.biz) || null, competition: parseInt(p.comp) || null,
    recommendTime: p.recommend || null,
    scoreReasons: {
      viral: p.viralReason ? p.viralReason.split('|') : [],
      brand: p.brandReason ? p.brandReason.split('|') : [],
      biz: p.bizReason ? p.bizReason.split('|') : [],
      comp: p.compReason ? p.compReason.split('|') : []
    },
    mergedFrom: p.merged ? p.merged.split(',').map(s => s.trim()) : [],
    createdAt: now(), updatedAt: now()
  };
  data.topics.push(t);
  data.nextId++;
  data.lastUpdate = now();
  writeJSON(TOPICS_FILE, data);
  console.log(`✅ #${t.id} saved: ${t.title}`);
}

function cmdMerge(targetId, sourceId) {
  const data = loadTopics();
  const target = data.topics.find(t => t.id === parseInt(targetId));
  const source = data.topics.find(t => t.id === parseInt(sourceId));
  if (!target || !source) { console.error('❌ Topic not found'); process.exit(1); }

  // Merge: add source raw to target's mergedFrom, delete source
  target.mergedFrom = [...(target.mergedFrom || []), source.raw, ...(source.mergedFrom || [])];
  target.valueTags = [...new Set([...(target.valueTags || []), ...(source.valueTags || [])])];
  if (!target.note && source.note) target.note = source.note;
  if (!target.viralScore && source.viralScore) target.viralScore = source.viralScore;
  if (!target.brandScore && source.brandScore) target.brandScore = source.brandScore;
  target.updatedAt = now();

  // Remove source
  const idx = data.topics.findIndex(t => t.id === parseInt(sourceId));
  data.topics.splice(idx, 1);
  data.lastUpdate = now();

  writeJSON(TOPICS_FILE, data);
  console.log(`✅ Merged #${sourceId} into #${targetId}`);
}

function cmdList() {
  const data = loadTopics();
  if (!data.topics.length) { console.log('📋 No topics. Run: node topic.js ingest "your notes"'); return; }
  console.log(`📋 Topics (${data.topics.length})\n`);
  for (const t of data.topics) {
    const s = t.status === 'published' ? '✅' : '📝';
    const v = t.viralScore ? ` 🔥${t.viralScore}` : '';
    const m = t.mergedFrom?.length ? ` [merged:${t.mergedFrom.length}]` : '';
    console.log(`#${t.id} ${s} ${t.title || t.raw}${v}${m}`);
  }
}

function cmdGet(id) {
  const t = loadTopics().topics.find(x => x.id === parseInt(id));
  if (!t) { console.error('❌ Not found'); process.exit(1); }
  console.log(JSON.stringify(t, null, 2));
}

function cmdUpdate(id, args) {
  const data = loadTopics(); const t = data.topics.find(x => x.id === parseInt(id));
  if (!t) { console.error('❌ Not found'); process.exit(1); }
  for (let i = 0; i < args.length; i += 2) {
    const k = args[i]?.replace(/^--/, '');
    if (k && args[i + 1]) {
      if (k === 'tags') t.valueTags = args[i + 1].split(',').map(s => s.trim());
      else if (k in t) t[k] = args[i + 1];
    }
  }
  t.updatedAt = now(); data.lastUpdate = now();
  writeJSON(TOPICS_FILE, data); console.log(`✅ #${id} updated`);
}

function cmdDelete(id) {
  const data = loadTopics(); const idx = data.topics.findIndex(t => t.id === parseInt(id));
  if (idx === -1) { console.error('❌ Not found'); process.exit(1); }
  data.topics.splice(idx, 1); data.lastUpdate = now();
  writeJSON(TOPICS_FILE, data); console.log(`🗑️  Deleted #${id}`);
}

function cmdPublish(id, url) {
  const data = loadTopics(); const t = data.topics.find(x => x.id === parseInt(id));
  if (!t) { console.error('❌ Not found'); process.exit(1); }
  t.status = 'published'; t.publishedAt = now(); if (url) t.publishUrl = url;
  t.updatedAt = now(); data.lastUpdate = now();
  writeJSON(TOPICS_FILE, data); console.log(`✅ #${id} published!`);
}

function cmdHistory() {
  if (!existsSync(INBOX_FILE)) { console.log('📥 No history yet.'); return; }
  console.log(readFileSync(INBOX_FILE, 'utf-8'));
}

function cmdConfig() { const c = loadConfig(); if (!c) { console.log('⚠️  Not initialized.'); return; } console.log(JSON.stringify(c, null, 2)); }

function cmdSetProfile(args) {
  const config = loadConfig(); if (!config) { console.error('❌ Not initialized'); process.exit(1); }
  if (!config.creatorProfile) config.creatorProfile = {};
  const p = {};
  for (let i = 0; i < args.length; i += 2) { const k = args[i]?.replace(/^--/, ''); if (k && args[i + 1]) p[k] = args[i + 1]; }
  if (p.niche) config.creatorProfile.niche = p.niche;
  if (p.persona) config.creatorProfile.persona = p.persona;
  if (p.goal) config.creatorProfile.goal = p.goal;
  if (p.platforms) config.creatorProfile.platforms = p.platforms.split(',').map(s => s.trim());
  if (p.stage) config.creatorProfile.stage = p.stage;
  writeJSON(CONFIG_FILE, config);
  console.log('✅ Creator profile updated');
  console.log(JSON.stringify(config.creatorProfile, null, 2));
}

function cmdSetConfig(key, value) {
  const config = loadConfig(); if (!config) { console.error('❌ Not initialized'); process.exit(1); }
  const keys = key.split('.'); let obj = config;
  for (let i = 0; i < keys.length - 1; i++) { if (!obj[keys[i]]) obj[keys[i]] = {}; obj = obj[keys[i]]; }
  try { obj[keys[keys.length - 1]] = JSON.parse(value); } catch { obj[keys[keys.length - 1]] = value; }
  writeJSON(CONFIG_FILE, config); console.log(`✅ ${key} updated`);
}

// ========== Batch (auto-save + merge + build) ==========

function cmdBatch(jsonStr) {
  if (!jsonStr) { console.error('❌ node topic.js batch \'{"topics":[...]}\''); process.exit(1); }
  let input;
  // Support file path (ends with .json) or inline JSON
  if (jsonStr.endsWith('.json') && existsSync(jsonStr)) {
    try { input = JSON.parse(readFileSync(jsonStr, 'utf-8')); } catch (e) { console.error('❌ Invalid JSON file:', e.message); process.exit(1); }
  } else {
    try { input = JSON.parse(jsonStr); } catch (e) { console.error('❌ Invalid JSON:', e.message); process.exit(1); }
  }

  // Ensure initialized
  if (!existsSync(CONFIG_FILE)) { cmdInit(); }

  const config = loadConfig();
  const result = { saved: [], merged: [], profileCreated: false };

  // Auto-create profile if provided and current profile is empty
  if (input.profile && (!config.creatorProfile || !config.creatorProfile.niche)) {
    const p = input.profile;
    config.creatorProfile = {
      niche: p.niche || '',
      persona: p.persona || '',
      goal: p.goal || '',
      platforms: Array.isArray(p.platforms) ? p.platforms : (p.platforms ? p.platforms.split(',').map(s => s.trim()) : []),
      stage: p.stage || ''
    };
    // Also set top-level persona for ingest prompt
    if (p.persona) config.persona = p.persona;
    writeJSON(CONFIG_FILE, config);
    result.profileCreated = true;
  }

  // Save topics
  if (input.topics && Array.isArray(input.topics)) {
    for (const t of input.topics) {
      const args = [];
      const fields = { raw: 'raw', title: 'title', theme: 'theme', platform: 'platform', format: 'format',
        stage: 'stage', priority: 'priority', note: 'note', recommend: 'recommend' };
      for (const [key, field] of Object.entries(fields)) {
        if (t[field]) args.push(`--${key}`, String(t[field]));
      }
      if (t.tags) args.push('--tags', Array.isArray(t.tags) ? t.tags.join(',') : t.tags);
      if (t.viral != null) args.push('--viral', String(t.viral));
      if (t.brand != null) args.push('--brand', String(t.brand));
      if (t.biz != null) args.push('--biz', String(t.biz));
      if (t.comp != null) args.push('--comp', String(t.comp));
      if (t.viralReason) args.push('--viralReason', t.viralReason);
      if (t.brandReason) args.push('--brandReason', t.brandReason);
      if (t.bizReason) args.push('--bizReason', t.bizReason);
      if (t.compReason) args.push('--compReason', t.compReason);
      if (t.merged) args.push('--merged', Array.isArray(t.merged) ? t.merged.join(',') : t.merged);

      cmdSave(args);
      const data = loadTopics();
      const saved = data.topics[data.topics.length - 1];
      result.saved.push({ id: saved.id, title: saved.title, theme: saved.theme });
    }
  }

  // Execute merges
  if (input.merges && Array.isArray(input.merges)) {
    for (const [targetId, sourceId] of input.merges) {
      try {
        cmdMerge(String(targetId), String(sourceId));
        result.merged.push({ target: targetId, source: sourceId });
      } catch (e) {
        console.error(`⚠️ Merge failed: #${sourceId} → #${targetId}: ${e.message}`);
      }
    }
  }

  // Build dashboard
  cmdBuild();

  // Output summary as JSON
  const data = loadTopics();
  const topPick = data.topics
    .filter(t => t.status !== 'published')
    .sort((a, b) => {
      const sa = (a.viralScore || 50) * 0.4 + (a.brandScore || 50) * 0.3 + (100 - (a.competition || 50)) * 0.3;
      const sb = (b.viralScore || 50) * 0.4 + (b.brandScore || 50) * 0.3 + (100 - (b.competition || 50)) * 0.3;
      return sb - sa;
    })[0];

  console.log('\n--- BATCH_RESULT ---');
  console.log(JSON.stringify({
    saved: result.saved.length,
    merged: result.merged.length,
    profileCreated: result.profileCreated,
    topPick: topPick ? { id: topPick.id, title: topPick.title } : null,
    dashboard: join(__dirname, '..', 'preview.html'),
    savedTopics: result.saved,
    mergedPairs: result.merged
  }, null, 2));
  console.log('--- BATCH_RESULT_END ---');
}

// ========== Build HTML ==========

function cmdBuild() {
  const data = loadTopics();
  const config = loadConfig();
  const followers = config?.followers || {};
  const dashboardLang = config?.dashboard_language || 'zh';

  // Date formatting function based on dashboard language
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (dashboardLang === 'en') {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString('zh-CN');
  }

  // Group by theme
  const themes = {}; const themeOrder = [];
  const uncategorized = dashboardLang === 'en' ? 'Uncategorized' : '未分类';
  for (const t of data.topics) { const th = t.theme || uncategorized; if (!themes[th]) { themes[th] = []; themeOrder.push(th); } themes[th].push(t); }

  const published = data.topics.filter(t => t.status === 'published').length;
  const ready = data.topics.filter(t => (t.stage || '').match(/现在|Ready|지금/)).length;
  const total = data.topics.length || 1;

  // Composite score
  function score(t) { return ((t.viralScore || 50) * 0.4 + (t.brandScore || 50) * 0.3 + (100 - (t.competition || 50)) * 0.3); }

  // Topic readiness status
  function readiness(t) {
    if (t.status === 'published') return { cls: 'rs-published', key: 'readinessPublished', text: '已发布', icon: '✅' };
    if ((t.stage || '').match(/现在|Ready|지금/)) return { cls: 'rs-ready', key: 'readinessReady', text: '准备完成', icon: '🟢' };
    if (t.viralScore >= 70 && t.brandScore >= 70) return { cls: 'rs-ready', key: 'readinessHighPotential', text: '高潜力', icon: '🟢' };
    if (t.note && t.note.includes('需')) return { cls: 'rs-warn', key: 'readinessNeedsCases', text: '需要补充', icon: '🟡' };
    return { cls: 'rs-draft', key: 'readinessDraft', text: '想法阶段', icon: '🔴' };
  }

  // Top picks (not published, sorted by score)
  const topPicks = data.topics.filter(t => t.status !== 'published').sort((a, b) => score(b) - score(a)).slice(0, 3);

  // Theme distribution
  const themeDist = themeOrder.map(th => ({ name: th, count: themes[th].length, pct: Math.round(themes[th].length / total * 100) }));
  const thinThemes = themeDist.filter(d => d.pct < 15);
  const heavyThemes = themeDist.filter(d => d.pct > 35);

  // Recent inbox (last 6 topics by createdAt)
  const recentInbox = [...data.topics].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

  // Series detection - group topics by theme that have multiple entries
  const seriesList = themeOrder.map(th => {
    const topics = themes[th];
    const done = topics.filter(t => t.status === 'published').length;
    return { name: th, total: topics.length, done, topics };
  }).filter(s => s.total >= 2);

  // Progress stats
  const needCases = data.topics.filter(t => t.status !== 'published' && (t.stage || '').match(/案例|cases/)).length;
  const abandoned = data.topics.filter(t => score(t) < 40 && t.status !== 'published').length;
  const draftCount = data.topics.filter(t => t.status !== 'published' && readiness(t).cls === 'rs-draft').length;

  // Graveyard (low score topics)
  const graveyard = data.topics.filter(t => {
    if (t.status === 'published') return false;
    const s = score(t);
    return s < 40 || (t.competition || 0) > 80;
  }).slice(0, 3);

  // Value map
  const mapTopics = data.topics.filter(t => t.status !== 'published');

  // Roadmap with linked topics
  const followerNum = Math.max(...Object.values(followers), 0);
  const milestones = [
    { target: 1000, items: ['AI周报系统', '工具横评系列'] },
    { target: 5000, items: ['我的工作流全公开', '行业深度分析'] },
    { target: 10000, items: ['真实收入结构', '商业合作复盘'] },
    { target: 50000, items: ['品牌联名经验', '付费产品方法论'] }
  ];

  // ===== Build sections =====

  // 0. 灵感收件箱
  let inboxHtml = recentInbox.map(t => {
    const date = formatDate(t.createdAt);
    return `<div class="inbox-item" onclick="openDetail(${t.id})"><span class="inbox-dot">•</span><span class="inbox-text">${esc(t.raw)}</span><span class="inbox-date">${date}</span></div>`;
  }).join('');
  if (!inboxHtml) inboxHtml = '<div style="color:var(--text3);font-size:0.85em" data-i18n="emptyInbox">还没有灵感记录</div>';

  // 0b. 内容系列
  let seriesHtml = seriesList.map(s => {
    const pct = Math.round(s.done / s.total * 100);
    const items = s.topics.map(t => {
      const done = t.status === 'published';
      return `<div class="series-item ${done ? 'series-done' : ''}" onclick="openDetail(${t.id})">${done ? '✓' : '□'} ${esc(t.title || t.raw)}</div>`;
    }).join('');
    return `<div class="series-block">
      <div class="series-head"><span class="series-name">${esc(s.name)}</span><span class="series-progress">${s.done}/${s.total}</span></div>
      <div class="series-bar"><div class="series-fill" style="width:${pct}%"></div></div>
      <div class="series-items">${items}</div>
    </div>`;
  }).join('');

  // Series suggestions for thin themes
  let seriesSuggestHtml = '';
  if (!seriesList.length) {
    const nearSeries = themeDist.filter(d => d.count >= 1).slice(0, 2);
    if (nearSeries.length) {
      seriesSuggestHtml = nearSeries.map(d => {
        const suggestions = {
          'AI工具与效率': ['AI日报', 'AI会议纪要', 'AI知识库', 'AI自动整理资料'],
          '职业成长路径': ['转行故事', '职场判断', '管理经验', '升职方法论'],
          '海外运营实战': ['文化差异', '客户沟通', '出海策略', '本地化经验'],
          '内容方法论': ['爆款分析', '涨粉策略', '内容排期', '平台算法'],
          'AI生活方式': ['AI学英语', 'AI健身', 'AI理财', 'AI时间管理']
        };
        const sugs = suggestions[d.name] || ['补充更多相关内容'];
        return `<div class="series-suggest">
          <div class="series-suggest-title">${esc(d.name)}</div>
          <div class="series-suggest-desc"><span data-i18n="seriesSuggest" data-i18n-args='${JSON.stringify({n: Math.max(0, 2 - d.count)})}'>还差 ${Math.max(0, 2 - d.count)} 个选题即可形成系列</span></div>
          <div class="series-suggest-items"><span data-i18n="seriesSuggestPrefix">建议补充：</span>${sugs.slice(0, 3).map(s => `<span class="series-suggest-tag">${esc(s)}</span>`).join('')}</div>
        </div>`;
      }).join('');
    } else {
      seriesSuggestHtml = '<div style="color:var(--text3);font-size:0.85em" data-i18n="seriesEmpty">继续输入灵感，系统会自动识别可形成系列的内容</div>';
    }
  }

  // 1. 本次更新 — best discovery
  const bestPick = topPicks[0];
  const updateHtml = `
    <div class="update-grid">
      <div class="update-stat"><div class="update-num">${data.topics.length}</div><div class="update-label" data-i18n="labelTotal">总选题</div></div>
      <div class="update-stat"><div class="update-num">${data.topics.filter(t => t.mergedFrom?.length).length}</div><div class="update-label" data-i18n="assetMerged">已合并</div></div>
      <div class="update-stat"><div class="update-num">${ready}</div><div class="update-label" data-i18n="statReady">可发布</div></div>
      <div class="update-stat"><div class="update-num">${published}</div><div class="update-label" data-i18n="statPublished">已发布</div></div>
    </div>
    ${bestPick ? `<div class="update-best">
      <div class="update-best-label">🔥 <span data-i18n="updateBestLabel">本次最佳发现</span></div>
      <div class="update-best-title" onclick="openDetail(${bestPick.id})">${esc(bestPick.title || bestPick.raw)}</div>
      <div class="update-best-reason"><span data-i18n="scoreBrand">人设</span> ${bestPick.brandScore || '-'} · <span data-i18n="scoreViral">爆款</span> ${bestPick.viralScore || '-'} · 综合分 ${Math.round(score(bestPick))}</div>
    </div>` : ''}`;

  // 2. AI 内容总监 — insights not reports
  let directorHtml = '';
  if (heavyThemes.length) {
    const themeLabel = dashboardLang === 'en' ? 'Overproducing' : '你最近在过度生产';
    const themeEnd = dashboardLang === 'en' ? 'content — ' + heavyThemes[0].pct + '% of your last ' + data.topics.length + ' topics.' : '」内容。过去 ' + data.topics.length + ' 个选题中，它占了 ' + heavyThemes[0].pct + '%。';
    directorHtml += `<div class="dn-item dn-warn">${themeLabel}「<span data-theme-name="${esc(heavyThemes[0].name)}">${esc(heavyThemes[0].name)}</span>${themeEnd}</div>`;
  }
  if (topPicks.length) {
    const p = topPicks[0];
    directorHtml += `<div class="dn-item dn-pick"><span data-i18n="directorNext">建议下一篇发：</span>「${esc(p.title || p.raw)}」<br><span class="dn-reason">${(p.brandScore || 0) > 70 ? '<span data-i18n="scoreBrand">人设价值</span>' : '<span data-i18n="scoreViral">爆款潜力</span>'} <span data-i18n="directorIsHighest">是当前最高的。</span>${p.recommendTime ? '<span data-i18n="directorSuggestTime" data-i18n-args=\'' + JSON.stringify({time: p.recommendTime}) + '\'>建议' + p.recommendTime + '发布。</span>' : ''}</span></div>`;
  }
  if (thinThemes.length) {
    directorHtml += `<div class="dn-item dn-gap">「${thinThemes.map(t => `<span data-theme-name="${esc(t.name)}">${esc(t.name)}</span>`).join('」「')}」<span data-i18n="directorGap">内容不足，建议补充。</span></div>`;
  }
  if (!directorHtml) {
    directorHtml = '<div class="dn-item dn-ok" data-i18n="directorOk">内容分布健康，继续保持当前节奏。</div>';
  }

  // 3. Top picks
  let topPicksHtml = topPicks.map((t, i) => {
    const vs = t.viralScore || 50; const bs = t.brandScore || 50; const cs = t.competition || 50;
    const composite = Math.round(score(t));
    return `<div class="pick-card" onclick="openDetail(${t.id})">
      <div class="pick-rank">${i + 1}</div>
      <div class="pick-body">
        <div class="pick-title">${esc(t.title || t.raw)}</div>
        <div class="pick-meta">${esc(t.platform || '-')} · ${t.format ? `<span data-format="${esc(t.format)}">${esc(t.format)}</span>` : '-'} · ${esc(t.recommendTime || (dashboardLang === 'en' ? 'Anytime' : '随时'))}</div>
        <div class="pick-scores">
          <div class="score-item"><span class="score-label" data-i18n="scoreViral">爆款</span><div class="score-bar"><div class="score-fill pick-score-fill-${i % 2 === 0 ? 'yellow' : 'purple'}" style="width:${vs}%"></div></div><span class="score-num">${vs}</span></div>
          <div class="score-item"><span class="score-label" data-i18n="scoreBrand">人设</span><div class="score-bar"><div class="score-fill pick-score-fill-${i % 2 === 0 ? 'yellow' : 'purple'}" style="width:${bs}%"></div></div><span class="score-num">${bs}</span></div>
          <div class="score-item"><span class="score-label" data-i18n="scoreComp">竞争</span><div class="score-bar"><div class="score-fill pick-score-fill-${i % 2 === 0 ? 'yellow' : 'purple'}" style="width:${100 - cs}%"></div></div><span class="score-num" data-i18n="${cs < 40 ? 'levelLow' : cs < 70 ? 'levelMid' : 'levelHigh'}">${cs < 40 ? '低' : cs < 70 ? '中' : '高'}</span></div>
        </div>
      </div>
      <div class="pick-composite">${composite}</div>
    </div>`;
  }).join('');

  // 4. Ecosystem
  let ecoHtml = themeDist.map((d, i) => {
    const barColor = 'var(--yellow)';
    return `<div class="eco-row"><div class="eco-name" data-theme-name="${esc(d.name)}">${esc(d.name)}</div><div class="eco-bar"><div class="eco-fill" style="width:${d.pct}%;background:${barColor}"></div></div><div class="eco-pct">${d.pct}%</div><div class="eco-count">${d.count}<span data-i18n="unitArticles">篇</span></div></div>`;
  }).join('');

  let ecoAdvice = '';
  if (thinThemes.length) {
    ecoAdvice = `<div class="eco-advice"><div class="eco-advice-title">⚠️ <span data-i18n="ecoUnbalanced">内容生态不均衡</span></div>${thinThemes.map(d => `<div class="eco-advice-item">「<span data-theme-name="${esc(d.name)}">${esc(d.name)}</span>」<span data-i18n="ecoSuggest" data-i18n-args='${JSON.stringify({pct: d.pct})}'>仅占 ${d.pct}%，建议补充</span></div>`).join('')}</div>`;
  }

  // 5. Theme cards with readiness + time
  let themeSections = '';
  let themeIdx = 0;
  for (const themeName of themeOrder) {
    themeIdx++;
    let cards = '';
    for (const t of themes[themeName]) {
      const rd = readiness(t);
      const prClass = (t.priority || '').match(/高|High/) ? 't-high' : (t.priority || '').match(/中|Mid/) ? 't-mid' : 't-low';
      const vs = t.viralScore; const bs = t.brandScore;
      const miniScores = (vs || bs) ? `<div class="tc-scores">${vs ? `<span class="tc-score">🔥${vs}</span>` : ''}${bs ? `<span class="tc-score">👤${bs}</span>` : ''}</div>` : '';
      const merged = t.mergedFrom?.length ? `<div class="tc-merged">📎 <span data-i18n="updateMerged" data-i18n-args='${JSON.stringify({n: t.mergedFrom.length})}'>合并了 ${t.mergedFrom.length} 条相似想法</span></div>` : '';
      const createdDate = formatDate(t.createdAt);
      const updatedDate = formatDate(t.updatedAt);
      const createdLabel = dashboardLang === 'en' ? 'Created' : '创建';
      const updatedLabel = dashboardLang === 'en' ? 'Updated' : '更新';
      const timeInfo = `<div class="tc-time">${createdLabel} ${createdDate}${updatedDate !== createdDate ? ' · ' + updatedLabel + ' ' + updatedDate : ''}</div>`;
      cards += `<div class="topic-card" data-id="${t.id}" onclick="document.getElementById('modal-${t.id}').classList.add('active');document.body.style.overflow='hidden'">
        <div class="tc-title">${esc(t.title || t.raw)}</div>
        <div class="tc-raw">「${esc(t.raw)}」</div>
        ${merged}
        <div class="tc-meta">
          ${(t.platform || '').split(',').map(p => p.trim()).filter(Boolean).map(p => `<span class="tag t-plat">${esc(p)}</span>`).join('')}
          ${t.format ? `<span class="tag t-fmt" data-format="${esc(t.format)}">${esc(t.format)}</span>` : ''}
          ${(t.valueTags || []).map(tag => `<span class="tag t-tag" data-tag="${esc(tag)}">${esc(tag)}</span>`).join('')}
        </div>
        ${miniScores}
        ${timeInfo}
        <div class="tc-bottom">
          <span class="tc-stage ${rd.cls}">${rd.icon} <span data-i18n="${rd.key}">${rd.text}</span></span>
          ${t.priority ? `<span class="tc-pri ${prClass}">${esc(t.priority)}</span>` : ''}
        </div>
      </div>`;
    }
    themeSections += `<div class="topic-group">
      <div class="topic-group-head"><div class="topic-group-num">${String(themeIdx).padStart(2, '0')}</div><div><div class="topic-group-title" data-theme-name="${esc(themeName)}">${esc(themeName)}</div></div><span class="topic-group-count">${themes[themeName].length}</span></div>
      <div class="topic-cards">${cards}</div>
    </div>`;
  }

  // 6. Roadmap with linked topics
  let roadmapHtml = milestones.map(m => {
    const unlocked = followerNum >= m.target;
    const cls = unlocked ? 'rm-done' : 'rm-locked';
    const items = m.items.map(item => {
      const linked = data.topics.filter(t => (t.title || '').includes(item.slice(0, 4)) || (t.raw || '').includes(item.slice(0, 4)));
      const linkedHtml = linked.length ? `<div class="rm-linked">${linked.map(t => `<span class="rm-linked-item" onclick="openDetail(${t.id})">#${t.id}</span>`).join('')}</div>` : '';
      return `<div class="rm-item ${linked.length ? 'rm-item-has' : ''}">${linked.length ? '☑' : '□'} ${esc(item)}${linkedHtml}</div>`;
    }).join('');
    return `<div class="rm-block ${cls}"><div class="rm-target">${unlocked ? '✅' : '🔒'} ${m.target.toLocaleString()} <span data-i18n="followerSuffix">粉</span></div>${items}</div>`;
  }).join('');

  // 7. Graveyard
  let graveyardHtml = '';
  if (graveyard.length) {
    graveyardHtml = graveyard.map(t => {
      const reasons = [];
      if ((t.competition || 0) > 70) reasons.push({key: 'graveyardHomogeneous', text: '同质化严重'});
      if ((t.viralScore || 50) < 40) reasons.push({key: 'graveyardLowViral', text: '爆款潜力低'});
      if (t.note && t.note.includes('需')) reasons.push({key: null, text: t.note});
      if (!reasons.length) reasons.push({key: 'graveyardLowScore', text: '综合评分不足'});
      return `<div class="gy-item" onclick="openDetail(${t.id})">
        <div class="gy-title">${esc(t.title || t.raw)}</div>
        <div class="gy-reason"${reasons[0].key ? ` data-i18n="${reasons[0].key}"` : ''}>${esc(reasons[0].text)}</div>
      </div>`;
    }).join('');
  } else {
    graveyardHtml = `<div class="gy-empty">
      <div class="gy-empty-title">🎯 <span data-i18n="emptyGraveyardTitle">当前所有选题均值得保留</span></div>
      <div class="gy-empty-desc" data-i18n="emptyGraveyardDesc">当出现以下情况时会进入此区域：</div>
      <div class="gy-empty-list">• <span data-i18n="graveyardHomogeneous">重复主题</span> &nbsp; • <span data-i18n="graveyardHighComp">竞争度过高</span> &nbsp; • <span data-i18n="graveyardNoCases">缺少案例支撑</span> &nbsp; • <span data-i18n="graveyardOffBrand">与账号定位不符</span></div>
    </div>`;
  }

  // Creator profile
  const profile = config?.creatorProfile || {};

  // Cumulative stats
  const cumStats = config?.stats || { totalInputs: 0, totalMerges: 0, totalSeries: 0 };
  const totalMerged = data.topics.filter(t => t.mergedFrom?.length).length;
  const totalSeriesCount = seriesList.length;

  // 8. Value map
  let mapDots = mapTopics.map(t => {
    const x = t.viralScore || 50; const y = t.brandScore || 50;
    const color = x > 70 && y > 70 ? 'var(--coral)' : x > 70 ? 'var(--purple)' : y > 70 ? 'var(--green)' : 'var(--text3)';
    return `<div class="map-dot" style="left:${x}%;bottom:${y}%;background:${color}" title="${esc(t.title || t.raw)}" onclick="openDetail(${t.id})"><span class="map-dot-label">${esc((t.title || '').slice(0, 6))}</span></div>`;
  }).join('');

  // 9. Modals
  let modals = '';
  for (const t of data.topics) {
    const rd = readiness(t);
    const sr = t.scoreReasons || {};

    // Build score detail blocks
    function scoreBlock(labelKey, score, reasons, color) {
      if (!score && !reasons?.length) return '';
      const items = (reasons || []).map(r => {
        const isPositive = r.startsWith('✓') || r.startsWith('优势') || !r.startsWith('✗');
        return `<div class="sr-item ${isPositive ? 'sr-pos' : 'sr-neg'}">${esc(r)}</div>`;
      }).join('');
      return `<div class="score-block"><div class="score-block-head"><span class="score-block-label" data-i18n="${labelKey}">${labelKey}</span><span class="score-block-num" style="color:${color}">${score || '-'}</span></div>${items ? `<div class="score-block-items">${items}</div>` : ''}</div>`;
    }

    const scoreDetails = [
      scoreBlock('modalScoreViral', t.viralScore, sr.viral, 'var(--coral)'),
      scoreBlock('modalScoreBrand', t.brandScore, sr.brand, 'var(--purple)'),
      scoreBlock('modalScoreBiz', t.bizScore, sr.biz, 'var(--green)'),
      scoreBlock('modalScoreComp', t.competition, sr.comp, 'var(--text3)')
    ].filter(Boolean).join('');

    const mergedInfo = t.mergedFrom?.length ? `<div class="modal-section"><div class="modal-label" data-i18n="modalMergedFrom">合并来源</div><div class="modal-raw">${t.mergedFrom.map(m => esc(m)).join('<br>')}</div></div>` : '';
    const createdDate = t.createdAt ? formatDate(t.createdAt) : '-';
    const updatedDate = t.updatedAt ? formatDate(t.updatedAt) : '-';

    modals += `<div class="modal" id="modal-${t.id}">
      <div class="modal-overlay" onclick="closeDetail(${t.id})"></div>
      <div class="modal-content">
        <button class="modal-close" onclick="document.getElementById('modal-${t.id}').classList.remove('active');document.body.style.overflow=''">×</button>
        <div class="modal-header"><div class="modal-num">#${t.id}</div><div class="modal-title">${esc(t.title || t.raw)}</div><span class="modal-badge ${rd.cls}">${rd.icon} <span data-i18n="${rd.key}">${rd.text}</span></span></div>
        <div class="modal-body">
          <div class="modal-section"><div class="modal-label" data-i18n="modalRaw">原始灵感</div><div class="modal-raw">${esc(t.raw)}</div></div>
          ${mergedInfo}
          ${t.theme ? `<div class="modal-section"><div class="modal-label" data-i18n="modalTheme">主题</div><div data-theme-name="${esc(t.theme)}">${esc(t.theme)}</div></div>` : ''}
          <div class="modal-grid">
            ${t.platform ? `<div class="modal-section"><div class="modal-label" data-i18n="modalPlatform">平台</div><div>${esc(t.platform)}</div></div>` : ''}
            ${t.format ? `<div class="modal-section"><div class="modal-label" data-i18n="modalFormat">形式</div><div data-format="${esc(t.format)}">${esc(t.format)}</div></div>` : ''}
            ${t.stage ? `<div class="modal-section"><div class="modal-label" data-i18n="modalStage">阶段</div><div>${esc(t.stage)}</div></div>` : ''}
            ${t.priority ? `<div class="modal-section"><div class="modal-label" data-i18n="modalPriority">优先级</div><div>${esc(t.priority)}</div></div>` : ''}
          </div>
          ${t.valueTags?.length ? `<div class="modal-section"><div class="modal-label" data-i18n="modalTags">价值标签</div><div class="modal-tags">${t.valueTags.map(tag => `<span class="tag t-tag" data-tag="${esc(tag)}">${esc(tag)}</span>`).join(' ')}</div></div>` : ''}
          ${t.note ? `<div class="modal-section"><div class="modal-label" data-i18n="modalNote">备注</div><div>${esc(t.note)}</div></div>` : ''}
          ${t.recommendTime ? `<div class="modal-section"><div class="modal-label" data-i18n="modalRecommend">推荐发布时间</div><div>${esc(t.recommendTime)}</div></div>` : ''}
          ${scoreDetails ? `<div class="modal-section"><div class="modal-label" data-i18n="modalScoreDetail">评分详情</div><div class="score-blocks">${scoreDetails}</div></div>` : ''}
          <div class="modal-section"><div class="modal-label" data-i18n="modalCreated">创建时间</div><div>${createdDate}</div></div>
          <div class="modal-section"><div class="modal-label" data-i18n="modalUpdated">最后更新</div><div>${updatedDate}</div></div>
          ${t.publishUrl ? `<div class="modal-section"><div class="modal-label" data-i18n="modalLink">链接</div><div><a href="${esc(t.publishUrl)}" target="_blank">${esc(t.publishUrl)}</a></div></div>` : ''}
        </div>
        <div class="modal-footer">${t.status !== 'published' ? `<button class="btn-publish" onclick="markPublished(${t.id})">✅ <span data-i18n="modalPublishBtn">标记为已发布</span></button>` : ''}</div>
      </div>
    </div>`;
  }

  // ===== Full HTML =====
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Creator OS</title>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#F5F3F0;--white:#FFFFFF;--purple:#8B3DFF;--purple-light:#B18AFF;--purple-dark:#6B1FD4;--yellow:#FFD400;--yellow-light:#FFE866;--yellow-dark:#E6C000;--text:#2D2D3F;--text2:#6B6B80;--text3:#9B9BB0;--shadow:0 4px 16px rgba(139,61,255,0.1);--shadow-lg:0 12px 32px rgba(139,61,255,0.15)}
body{font-family:'Nunito',-apple-system,sans-serif;background:var(--bg);color:var(--text);line-height:1.6;-webkit-font-smoothing:antialiased;position:relative;overflow-x:hidden}
/* Background decoration - subtle dots */
.bg-decoration{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;background-image:radial-gradient(circle at 20% 20%,rgba(139,61,255,0.04) 1px,transparent 1px),radial-gradient(circle at 80% 80%,rgba(255,212,0,0.04) 1px,transparent 1px),radial-gradient(circle at 50% 50%,rgba(139,61,255,0.02) 1px,transparent 1px);background-size:60px 60px,80px 80px,40px 40px}
.wrap{max-width:1200px;margin:0 auto;padding:32px 24px;position:relative;z-index:1}
.topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:40px}
.topbar .logo{font-size:1.3em;font-weight:800;display:flex;align-items:center;gap:10px;color:var(--purple)}
.topbar .right{display:flex;align-items:center;gap:12px}
.lang-switch{display:flex;background:var(--white);border-radius:20px;padding:3px;box-shadow:var(--shadow)}
.lang-btn{padding:6px 16px;font-size:0.8em;font-weight:600;cursor:pointer;border:none;background:transparent;color:var(--text3);transition:all 0.2s;font-family:inherit;border-radius:18px}
.lang-btn.active{background:var(--purple);color:var(--white)}
.lang-hint{font-size:0.7em;color:var(--text3)}
/* Hero - large purple card */
.hero{margin-bottom:40px;padding:48px;background:linear-gradient(135deg,var(--purple),var(--purple-dark));border-radius:28px;color:var(--white);position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;top:-60px;right:-60px;width:250px;height:250px;background:var(--yellow);border-radius:50%;opacity:0.15}
.hero::after{content:'';position:absolute;bottom:-40px;left:20%;width:180px;height:180px;background:rgba(255,255,255,0.1);border-radius:50%}
.hero-badge{display:inline-flex;align-items:center;gap:6px;padding:8px 20px;background:rgba(255,255,255,0.2);border-radius:100px;font-size:0.85em;font-weight:600;margin-bottom:24px;backdrop-filter:blur(10px)}
.hero h1{font-size:clamp(2.5em,5vw,3.5em);font-weight:800;line-height:1.1;margin-bottom:16px}
.hero-sub{font-size:1.15em;opacity:0.9;margin-bottom:28px}
.hero-cta{display:inline-flex;align-items:center;gap:10px;padding:16px 32px;background:var(--yellow);border-radius:16px;font-weight:700;font-size:1.05em;color:var(--text);cursor:pointer;transition:all 0.3s;text-decoration:none;border:none;font-family:inherit;box-shadow:0 4px 16px rgba(255,212,0,0.4)}
.hero-cta:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(255,212,0,0.5)}
/* Stats grid - yellow cards */
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:40px}
@media(max-width:800px){.stats-grid{grid-template-columns:repeat(2,1fr)}}
.stat-card{background:var(--yellow);border-radius:20px;padding:24px;text-align:center;transition:all 0.3s;cursor:pointer;color:var(--text)}
.stat-card:nth-child(2){background:var(--purple);color:var(--white)}
.stat-card:nth-child(4){background:var(--purple);color:var(--white)}
.stat-card:hover{transform:translateY(-4px);box-shadow:var(--shadow-lg)}
.stat-icon-wrapper{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px}
.stat-icon-purple{background:var(--purple)}
.stat-icon-yellow{background:var(--yellow)}
.stat-icon{font-size:1.4em}
.stat-num{font-size:2.2em;font-weight:800;color:var(--text)}
.stat-label{font-size:0.85em;color:var(--text);margin-top:4px;font-weight:600}
.sec-title{font-size:1.2em;font-weight:700;margin-bottom:16px;margin-top:48px;display:flex;align-items:center;gap:10px;color:var(--text)}
/* Picks - alternating purple/yellow cards */
.picks{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:16px}
@media(max-width:800px){.picks{grid-template-columns:1fr}}
.pick-card{background:var(--purple);border-radius:20px;padding:24px;cursor:pointer;transition:all 0.3s;color:var(--white);position:relative;overflow:hidden}
.pick-card::before{content:'';position:absolute;top:-30px;right:-30px;width:120px;height:120px;background:var(--yellow);border-radius:50%;opacity:0.15}
.pick-card:nth-child(2){background:var(--yellow);color:var(--text)}
.pick-card:nth-child(2):hover{background:var(--purple);color:var(--white)}
.pick-card:nth-child(3){background:linear-gradient(135deg,var(--purple),var(--purple-dark));color:var(--white)}
.pick-card:hover{transform:translateY(-4px);box-shadow:var(--shadow-lg);background:var(--yellow);color:var(--text)}
/* Score fill colors - default */
.pick-score-fill-yellow{background:var(--yellow)}
.pick-score-fill-purple{background:var(--purple)}
/* Score fill colors - hover (swap) */
.pick-card:hover .pick-score-fill-yellow{background:var(--purple)}
.pick-card:hover .pick-score-fill-purple{background:var(--yellow)}
.pick-card:nth-child(2):hover .pick-score-fill-yellow{background:var(--purple)}
.pick-card:nth-child(2):hover .pick-score-fill-purple{background:var(--yellow)}
.pick-rank{font-size:3em;font-weight:800;opacity:0.2;position:absolute;top:16px;right:20px}
.pick-title{font-weight:700;font-size:1em;margin-bottom:10px;line-height:1.4}
.pick-meta{font-size:0.8em;opacity:0.8;margin-bottom:14px}
.pick-scores{display:flex;flex-direction:column;gap:8px}
.score-item{display:flex;align-items:center;gap:10px}
.score-label{font-size:0.8em;opacity:0.8;width:50px;flex-shrink:0;font-weight:600}
.score-bar{flex:1;height:6px;background:rgba(255,255,255,0.2);border-radius:3px;overflow:hidden}
.score-fill{height:100%;border-radius:3px;background:rgba(255,255,255,0.8)}
.score-num{font-size:0.8em;font-weight:700;width:30px;text-align:right}
.pick-composite{font-size:3.5em;font-weight:800;opacity:0.15;position:absolute;bottom:16px;right:20px}
/* Eco - purple card */
.eco{background:var(--purple);border-radius:20px;padding:24px;margin-bottom:16px;color:var(--white)}
.eco-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.15)}
.eco-row:last-child{border-bottom:none}
.eco-name{font-size:0.9em;font-weight:600;width:120px;flex-shrink:0}
.eco-bar{flex:1;height:8px;background:rgba(255,255,255,0.2);border-radius:4px;overflow:hidden}
.eco-fill{height:100%;border-radius:4px;background:var(--yellow);min-width:8px}
.eco-pct{font-size:0.85em;font-weight:700;width:40px;text-align:right}
.eco-count{font-size:0.8em;opacity:0.7;width:35px;text-align:right}
.eco-advice{margin-top:16px;padding:16px;background:var(--yellow);border-radius:16px;color:var(--text)}
.eco-advice-title{font-weight:700;font-size:0.9em;margin-bottom:8px}
.eco-advice-item{font-size:0.85em;padding:4px 0}
.topics{margin-top:48px}
.topic-group{margin-bottom:32px}
.topic-group-head{display:flex;align-items:center;gap:12px;margin-bottom:16px}
.topic-group-num{font-size:2em;font-weight:800;color:var(--purple);opacity:0.3;line-height:1}
.topic-group-title{font-size:1.1em;font-weight:700}
.topic-group-count{font-size:0.75em;color:var(--white);background:var(--purple);padding:4px 12px;border-radius:100px;font-weight:600;margin-left:auto}
.topic-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
.topic-card{background:var(--yellow);border-radius:20px;padding:20px;transition:all 0.3s;cursor:pointer;color:var(--text);position:relative;z-index:10}
.topic-card:nth-child(even){background:var(--purple);color:var(--white)}
.topic-card:hover{transform:translateY(-4px);box-shadow:var(--shadow-lg)}
.topic-card.published{opacity:0.5}
.tc-title{font-weight:700;font-size:0.95em;margin-bottom:8px;line-height:1.4}
.tc-raw{font-size:0.8em;opacity:0.7;margin-bottom:12px;font-style:italic}
.tc-merged{font-size:0.75em;margin-bottom:10px;font-weight:600}
.tc-meta{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}
.tc-scores{display:flex;gap:12px;margin-bottom:10px}
.tc-score{font-size:0.8em;font-weight:700}
.tc-bottom{display:flex;align-items:center;justify-content:space-between;padding-top:10px;border-top:1px solid rgba(255,255,255,0.2)}
.tc-stage{font-size:0.8em;font-weight:600}
.tc-pri{font-size:0.75em;font-weight:700;padding:4px 10px;border-radius:100px}
.tag{display:inline-block;padding:4px 10px;border-radius:8px;font-size:0.75em;font-weight:600;white-space:nowrap}
.t-plat{background:rgba(255,255,255,0.25);color:inherit}.t-fmt{background:rgba(255,255,255,0.15);color:inherit}.t-tag{background:rgba(255,255,255,0.2);color:inherit;margin:2px}
.t-ready{color:var(--yellow)}.t-wait{color:var(--text3)}.t-published{color:var(--green)}
.t-high{background:var(--yellow);color:var(--text)}.t-mid{background:rgba(255,255,255,0.3);color:inherit}.t-low{background:rgba(255,255,255,0.15);color:inherit}
/* Map - yellow card */
.map-wrap{background:var(--yellow);border-radius:20px;padding:24px;margin-bottom:16px;color:var(--text)}
.map{position:relative;height:280px;border-left:3px solid var(--text);border-bottom:3px solid var(--text);margin:20px 0 0 40px}
.map-dot{position:absolute;width:14px;height:14px;border-radius:50%;cursor:pointer;transition:all 0.2s;z-index:2;background:var(--purple)}
.map-dot:hover{transform:scale(1.8);z-index:10;box-shadow:var(--shadow)}
.map-dot-label{position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);font-size:0.7em;color:var(--text2);white-space:nowrap;pointer-events:none;font-weight:600}
.map-axis-x{position:absolute;bottom:-30px;right:0;font-size:0.75em;color:var(--text2);font-weight:600}
.map-axis-y{position:absolute;top:-30px;left:-45px;font-size:0.75em;color:var(--text2);writing-mode:vertical-lr;font-weight:600}
.map-quadrant{position:absolute;font-size:0.75em;color:var(--text2);font-weight:600}
.map-q1{top:10px;right:10px}.map-q2{top:10px;left:10px}.map-q3{bottom:10px;left:10px}.map-q4{bottom:10px;right:10px}
.footer{text-align:center;padding:48px 20px;color:var(--text3);font-size:0.8em}
.director-notes{display:flex;flex-direction:column;gap:16px}
.dn-item{padding:18px;border-radius:16px;font-size:0.95em;line-height:1.6}
.dn-warn{background:var(--yellow);color:var(--text)}
.dn-pick{background:var(--purple);color:var(--white)}
.dn-gap{background:rgba(139,61,255,0.15);color:var(--purple)}
.dn-ok{background:var(--purple);color:var(--white)}
.dn-reason{font-size:0.88em;margin-top:8px;opacity:0.9}
.update-best{margin-top:20px;padding:24px;background:var(--purple);border-radius:20px;color:var(--white)}
.update-best-label{font-size:0.8em;font-weight:600;margin-bottom:10px;opacity:0.9}
.update-best-title{font-weight:700;font-size:1.1em;cursor:pointer}
.update-best-title:hover{opacity:0.9}
.update-best-reason{font-size:0.85em;margin-top:8px;opacity:0.9}
.tc-time{font-size:0.75em;opacity:0.6;margin-bottom:10px}
.rs-ready{color:var(--yellow)}.rs-warn{color:#FF6B6B}.rs-draft{color:var(--text3)}.rs-published{color:var(--green)}
.graveyard{display:flex;flex-direction:column;gap:12px}
.gy-item{display:flex;align-items:center;gap:16px;padding:14px 18px;background:var(--yellow);border-radius:16px;cursor:pointer;transition:all 0.15s;color:var(--text)}
.gy-item:nth-child(even){background:var(--purple);color:var(--white)}
.gy-item:hover{transform:translateY(-2px);box-shadow:var(--shadow)}
.gy-title{flex:1;font-weight:600;font-size:0.95em}
.gy-reason{font-size:0.8em;opacity:0.7;flex-shrink:0}
.inbox{display:flex;flex-direction:column;gap:8px}
.inbox-item{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:12px;cursor:pointer;transition:all 0.15s;font-size:0.95em}
.inbox-item:hover{background:var(--yellow);color:var(--text)}
.inbox-dot{color:var(--yellow);flex-shrink:0;font-size:1.2em}
.inbox-text{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.inbox-date{font-size:0.8em;opacity:0.6;flex-shrink:0}
.inbox-summary{margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.2);font-size:0.85em;opacity:0.8}
.series-block{margin-bottom:20px}
.series-block:last-child{margin-bottom:0}
.series-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.series-name{font-weight:700;font-size:1em}
.series-progress{font-size:0.85em;font-weight:700}
.series-bar{height:6px;background:rgba(255,255,255,0.2);border-radius:3px;overflow:hidden;margin-bottom:14px}
.series-fill{height:100%;background:var(--yellow);border-radius:3px}
.series-items{display:flex;flex-direction:column;gap:6px}
.series-item{font-size:0.9em;padding:8px 12px;border-radius:10px;cursor:pointer;transition:all 0.15s;opacity:0.9}
.series-item:hover{background:rgba(255,255,255,0.15)}
.series-done{color:var(--yellow);text-decoration:line-through;opacity:0.6}
.progress-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:16px;text-align:center}
@media(max-width:700px){.progress-grid{grid-template-columns:repeat(3,1fr)}}
.pg-item{padding:12px 0}
.pg-num{font-size:1.8em;font-weight:800}
.pg-green{color:var(--yellow)}.pg-purple{color:var(--white)}.pg-coral{color:var(--yellow)}.pg-gray{color:rgba(255,255,255,0.6)}
.pg-label{font-size:0.8em;margin-top:4px;font-weight:600;opacity:0.8}
.series-suggest{padding:18px;background:var(--yellow);border-radius:16px;margin-top:14px;color:var(--text)}
.series-suggest-tag{font-size:0.8em;background:var(--purple);padding:6px 14px;border-radius:100px;color:var(--white);font-weight:600}
.series-suggest-title{font-weight:700;font-size:0.95em;margin-bottom:8px}
.series-suggest-desc{font-size:0.85em;margin-bottom:12px}
.series-suggest-items{display:flex;flex-wrap:wrap;gap:10px}
.series-suggest-tag{font-size:0.8em;background:var(--purple);padding:6px 14px;border-radius:100px;color:var(--white);font-weight:600}
.gy-empty{text-align:center;padding:24px 0}
.gy-empty-title{font-weight:700;font-size:1em;margin-bottom:12px}
.gy-empty-desc{font-size:0.9em;opacity:0.8;margin-bottom:10px}
.gy-empty-list{font-size:0.85em;opacity:0.6}
.assets-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;text-align:center}
@media(max-width:600px){.assets-grid{grid-template-columns:repeat(2,1fr)}}
.asset-item{padding:12px 0}
.asset-num{font-size:1.8em;font-weight:800}
.asset-label{font-size:0.8em;margin-top:4px;font-weight:600;opacity:0.8}
.profile-grid{display:flex;flex-direction:column;gap:14px}
.profile-item{display:flex;align-items:center;gap:16px;padding:14px 18px;background:var(--yellow);border-radius:14px;color:var(--text)}
.profile-item:nth-child(even){background:var(--purple);color:var(--white)}
.profile-label{font-size:0.85em;width:80px;flex-shrink:0;font-weight:600;opacity:0.8}
.profile-value{font-size:0.95em;font-weight:700}
.score-blocks{display:flex;flex-direction:column;gap:16px}
.score-block{padding:18px;background:var(--yellow);border-radius:16px;color:var(--text)}
.score-block:nth-child(even){background:var(--purple);color:var(--white)}
.score-block-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.score-block-label{font-weight:700;font-size:0.9em}
.score-block-num{font-size:1.5em;font-weight:800}
.score-block-items{display:flex;flex-direction:column;gap:6px}
.sr-item{font-size:0.85em;padding:4px 0}
.sr-pos{color:var(--yellow)}
.sr-neg{opacity:0.6}
.modal{display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;align-items:center;justify-content:center}
.modal.active{display:flex}
.modal-overlay{position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.4);backdrop-filter:blur(12px)}
.modal-content{position:relative;background:var(--white);border-radius:24px;max-width:520px;width:90%;max-height:80vh;overflow-y:auto;padding:32px;box-shadow:0 24px 48px rgba(0,0,0,0.2)}
.modal-close{position:absolute;top:16px;right:16px;width:36px;height:36px;border-radius:50%;border:none;background:var(--purple);font-size:1.2em;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--white)}
.modal-close:hover{background:var(--purple-dark)}
.modal-header{display:flex;align-items:center;gap:12px;margin-bottom:24px;flex-wrap:wrap}
.modal-num{font-size:1.4em;font-weight:800;color:var(--purple)}
.modal-title{font-size:1.15em;font-weight:700;flex:1}
.modal-badge{font-size:0.75em;font-weight:700;padding:4px 12px;border-radius:100px}
.modal-badge.published{background:var(--purple);color:var(--white)}.modal-badge.draft{background:var(--yellow);color:var(--text)}
.modal-scores{display:flex;gap:16px;padding:16px;background:var(--yellow);border-radius:14px;margin-bottom:20px;font-size:0.85em;font-weight:700}
.modal-section{margin-bottom:16px}
.modal-label{font-size:0.75em;font-weight:700;color:var(--purple);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px}
.modal-raw{font-size:0.92em;font-style:italic;padding:14px 16px;background:var(--yellow);border-radius:12px;line-height:1.6}
.modal-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.modal-tags{display:flex;flex-wrap:wrap;gap:8px}
.modal-footer{display:flex;gap:14px;padding-top:16px;border-top:1px solid #f0f0f0}
.btn-publish{padding:12px 24px;border-radius:14px;border:none;background:var(--purple);color:var(--white);font-weight:700;font-size:0.9em;cursor:pointer;font-family:inherit;transition:all 0.3s;box-shadow:0 4px 12px rgba(139,61,255,0.3)}
.btn-publish:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(139,61,255,0.4)}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.anim{animation:fadeUp 0.5s ease both}
</style>
</head>
<body>
<!-- Background decoration -->
<div class="bg-decoration"></div>
<script>
var currentLang='zh';

const UI={
  heroBadge:{zh:'创作者工作台',en:'Creator Studio'},
  heroTitle:{zh:'Creator OS',en:'Creator OS'},
  heroSub:{zh:'今天，你有 {n} 个值得创作的想法',en:'You have {n} ideas worth creating today'},
  heroCta:{zh:'今日推荐：',en:"Today's Pick: "},
  statTopics:{zh:'选题',en:'Topics'},
  statReady:{zh:'可发布',en:'Ready'},
  statPublished:{zh:'已发布',en:'Published'},
  statSeries:{zh:'系列',en:'Series'},
  secInbox:{zh:'灵感收件箱',en:'Idea Inbox'},
  secDirector:{zh:'AI 内容总监',en:'AI Director'},
  secTopPicks:{zh:'近期最值得发',en:'Top Picks'},
  secEcosystem:{zh:'内容生态分析',en:'Content Ecosystem'},
  secTopics:{zh:'选题库',en:'Topic Library'},
  secSeries:{zh:'内容系列',en:'Content Series'},
  secProgress:{zh:'创作进度',en:'Creator Progress'},
  secAssets:{zh:'创作资产',en:'Creator Assets'},
  secProfile:{zh:'创作者画像',en:'Creator Profile'},
  secGraveyard:{zh:'暂不推荐',en:'Not Recommended'},
  secValueMap:{zh:'选题价值地图',en:'Value Map'},
  labelTotal:{zh:'总选题',en:'Total'},
  labelReady:{zh:'准备完成',en:'Ready'},
  labelPublished:{zh:'已发布',en:'Published'},
  labelNeedCases:{zh:'待补充案例',en:'Needs Cases'},
  labelDraft:{zh:'想法阶段',en:'Draft'},
  labelAbandoned:{zh:'已放弃',en:'Abandoned'},
  assetInputs:{zh:'累计灵感',en:'Total Ideas'},
  assetTopics:{zh:'形成选题',en:'Topics'},
  assetMerged:{zh:'合并重复',en:'Merged'},
  assetSeries:{zh:'内容系列',en:'Series'},
  profilePersona:{zh:'人设',en:'Persona'},
  profileNiche:{zh:'赛道',en:'Niche'},
  profileGoal:{zh:'目标',en:'Goal'},
  profilePlatforms:{zh:'主平台',en:'Platforms'},
  profileStage:{zh:'当前阶段',en:'Stage'},
  followerSuffix:{zh:'粉',en:' followers'},
  noTopics:{zh:'暂无选题',en:'No topics yet'},
  langHint:{zh:'界面语言仅影响看板文案，内容默认保留原文。',en:'Dashboard language only changes UI labels. Content stays in its original language by default.'},
  mapHighHigh:{zh:'高流量·高人设',en:'High Viral · High Brand'},
  mapLowHigh:{zh:'低流量·高人设',en:'Low Viral · High Brand'},
  mapMemo:{zh:'备忘录',en:'Memo'},
  mapHighLow:{zh:'高流量·低人设',en:'High Viral · Low Brand'},
  mapAxisViral:{zh:'流量价值 ↑',en:'Viral Value ↑'},
  mapAxisBrand:{zh:'人设价值 ↑',en:'Brand Value ↑'},
  emptyInbox:{zh:'还没有灵感记录',en:'No ideas yet'},
  emptyGraveyardTitle:{zh:'当前所有选题均值得保留',en:'All topics are worth keeping'},
  emptyGraveyardDesc:{zh:'当出现以下情况时会进入此区域：',en:'Topics appear here when:'},
  graveyardHomogeneous:{zh:'同质化严重',en:'Too similar to existing'},
  graveyardLowViral:{zh:'爆款潜力低',en:'Low viral potential'},
  graveyardLowScore:{zh:'综合评分不足',en:'Low composite score'},
  scoreViral:{zh:'爆款',en:'Viral'},
  scoreBrand:{zh:'人设',en:'Brand'},
  scoreComp:{zh:'竞争',en:'Competition'},
  levelLow:{zh:'低',en:'Low'},
  levelMid:{zh:'中',en:'Mid'},
  levelHigh:{zh:'高',en:'High'},
  modalRaw:{zh:'原始灵感',en:'Original Idea'},
  modalTheme:{zh:'主题',en:'Theme'},
  modalPlatform:{zh:'平台',en:'Platform'},
  modalFormat:{zh:'形式',en:'Format'},
  modalStage:{zh:'阶段',en:'Stage'},
  modalPriority:{zh:'优先级',en:'Priority'},
  modalTags:{zh:'价值标签',en:'Tags'},
  modalNote:{zh:'备注',en:'Note'},
  modalRecommend:{zh:'推荐发布时间',en:'Recommend'},
  modalScoreDetail:{zh:'评分详情',en:'Score Details'},
  modalCreated:{zh:'创建时间',en:'Created'},
  modalUpdated:{zh:'最后更新',en:'Updated'},
  modalLink:{zh:'链接',en:'Link'},
  modalMergedFrom:{zh:'合并来源',en:'Merged From'},
  modalScoreViral:{zh:'爆款指数',en:'Viral Score'},
  modalScoreBrand:{zh:'人设价值',en:'Brand Score'},
  modalScoreBiz:{zh:'商业价值',en:'Business Value'},
  modalScoreComp:{zh:'竞争度',en:'Competition'},
  modalPublishBtn:{zh:'标记为已发布',en:'Mark as Published'},
  readinessPublished:{zh:'已发布',en:'Published'},
  readinessReady:{zh:'准备完成',en:'Ready'},
  readinessHighPotential:{zh:'高潜力',en:'High Potential'},
  readinessNeedsCases:{zh:'需要补充',en:'Needs Cases'},
  readinessDraft:{zh:'想法阶段',en:'Idea Stage'},
  inboxSummary:{zh:'本次新增 {n} 条灵感',en:'{n} new ideas this time'},
  updateBestLabel:{zh:'本次最佳发现',en:'Best Discovery'},
  updateMerged:{zh:'合并了 {n} 条相似想法',en:'Merged {n} similar ideas'},
  directorNext:{zh:'建议下一篇发：',en:'Suggest next:'},
  directorGap:{zh:'内容不足，建议补充。',en:'Content gap — consider adding more.'},
  directorOk:{zh:'内容分布健康，继续保持当前节奏。',en:'Content distribution is healthy. Keep going!'},
  ecoUnbalanced:{zh:'内容生态不均衡',en:'Unbalanced ecosystem'},
  unitArticles:{zh:'篇',en:''},
  seriesSuggestPrefix:{zh:'建议补充：',en:'Suggest:'},
  seriesEmpty:{zh:'继续输入灵感，系统会自动识别可形成系列的内容',en:'Keep adding ideas — the system will auto-detect series'},
  seriesSuggest:{zh:'还差 {n} 个选题即可形成系列',en:'{n} more topics to form a series'},
  directorOverprod:{zh:'你最近在过度生产「{theme}」内容。过去 {n} 个选题中，它占了 {pct}%。',en:'Overproducing "{theme}" content — {pct}% of your last {n} topics.'},
  directorIsHighest:{zh:'是当前最高的。',en:'is the highest right now.'},
  directorSuggestTime:{zh:'建议{time}发布。',en:'Suggest publishing {time}.'},
  graveyardHighComp:{zh:'竞争度过高',en:'High competition'},
  graveyardNoCases:{zh:'缺少案例支撑',en:'Lacks case studies'},
  graveyardOffBrand:{zh:'与账号定位不符',en:'Off-brand'},
  ecoSuggest:{zh:'仅占 {pct}%，建议补充',en:'Only {pct}% — consider adding more'},
  themeNameMap:{
    'AI工具测评':'AI Tools Review',
    'AI工具与效率':'AI Tools & Efficiency',
    'AI工作流':'AI Workflow',
    '运营成长':'Career Growth',
    '职业成长路径':'Career Growth Path',
    '个人品牌':'Personal Brand',
    '个人品牌与增长':'Personal Brand & Growth',
    '行业洞察':'Industry Insight',
    'AI生活升级':'AI Life Upgrade',
    '海外运营':'Overseas Marketing',
    '其他':'Other'
  },
  formatMap:{
    '长文':'Long-form Article',
    '图文':'Image + Text',
    '短视频':'Short Video',
    '长视频':'Long Video',
    '直播':'Livestream',
    '图文轮播':'Carousel',
    'Thread':'Thread',
    '视频':'Video'
  },
  tagMap:{
    '爆款':'Viral',
    '实用':'Practical',
    '干货':'Actionable',
    '故事':'Story',
    '热点':'Trending',
    '教程':'Tutorial',
    '对比':'Comparison',
    '测评':'Review',
    '案例':'Case Study',
    '方法论':'Methodology',
    '工具':'Tools',
    '资源':'Resources',
    '人设':'Personal Brand'
  }
};

// Define switchLang after UI
window.switchLang = function(lang){
  console.log('switchLang called with:', lang);
  // Update button states
  document.querySelectorAll('.lang-btn').forEach(function(b){b.classList.remove('active')});
  var btn=document.querySelector('[data-lang-btn="'+lang+'"]');
  if(btn)btn.classList.add('active');
  // Update all i18n elements
  document.querySelectorAll('[data-i18n]').forEach(function(el){
    var key=el.getAttribute('data-i18n');
    if(UI[key]){
      var val=UI[key][lang]||UI[key].zh||'';
      var args=el.getAttribute('data-i18n-args');
      if(args){try{var o=JSON.parse(args);Object.keys(o).forEach(function(k){val=val.replace(new RegExp('{'+k+'}','g'),o[k])})}catch(e){}}
      if(el.tagName==='INPUT'||el.tagName==='TEXTAREA'){el.placeholder=val}else{el.innerHTML=val}
    }
  });
  // Update theme names
  document.querySelectorAll('[data-theme-name]').forEach(function(el){
    var zhName=el.getAttribute('data-theme-name');
    el.textContent=(UI.themeNameMap[zhName]&&lang==='en')?UI.themeNameMap[zhName]:zhName;
  });
  // Update formats
  document.querySelectorAll('[data-format]').forEach(function(el){
    var zhFmt=el.getAttribute('data-format');
    el.textContent=(UI.formatMap[zhFmt]&&lang==='en')?UI.formatMap[zhFmt]:zhFmt;
  });
  // Update tags
  document.querySelectorAll('[data-tag]').forEach(function(el){
    var zhTag=el.getAttribute('data-tag');
    el.textContent=(UI.tagMap[zhTag]&&lang==='en')?UI.tagMap[zhTag]:zhTag;
  });
  // Save to localStorage
  try{localStorage.setItem('cos-lang',lang)}catch(e){}
};
</script>
<div class="wrap">
  <div class="topbar anim">
    <div class="logo">✨ <span>Creator OS</span></div>
    <div class="right">
      <div class="lang-switch">
        <button class="lang-btn active" data-lang-btn="zh" onclick="switchLang('zh')">中文</button>
        <button class="lang-btn" data-lang-btn="en" onclick="switchLang('en')">EN</button>
      </div>
      <div class="lang-hint" data-i18n="langHint">界面语言仅影响看板文案，内容默认保留原文。</div>
    </div>
  </div>

  <div class="hero anim">
    <div class="hero-badge">✨ <span data-i18n="heroBadge">创作者工作台</span></div>
    <h1 data-i18n="heroTitle">Creator OS</h1>
    <p class="hero-sub" data-i18n="heroSub" data-i18n-args='${JSON.stringify({n: data.topics.length})}'>今天，你有 ${data.topics.length} 个值得创作的想法</p>
    ${topPicks[0] ? `<button class="hero-cta" onclick="openDetail(${topPicks[0].id})">🔥 <span data-i18n="heroCta">今日推荐：</span>${esc(topPicks[0].title || topPicks[0].raw)}</button>` : ''}
  </div>

  <div class="stats-grid anim">
    <div class="stat-card">
      <div class="stat-icon-wrapper stat-icon-purple"><div class="stat-icon">💡</div></div>
      <div class="stat-num">${data.topics.length}</div>
      <div class="stat-label" data-i18n="statTopics">选题</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon-wrapper stat-icon-yellow"><div class="stat-icon">⚡</div></div>
      <div class="stat-num">${ready}</div>
      <div class="stat-label" data-i18n="statReady">可发布</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon-wrapper stat-icon-purple"><div class="stat-icon">🎯</div></div>
      <div class="stat-num">${published}</div>
      <div class="stat-label" data-i18n="statPublished">已发布</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon-wrapper stat-icon-yellow"><div class="stat-icon">📖</div></div>
      <div class="stat-num">${totalSeriesCount}</div>
      <div class="stat-label" data-i18n="statSeries">系列</div>
    </div>
  </div>

  <!-- 0. 灵感收件箱 -->
  <div class="sec-title anim">✍️ <span data-i18n="secInbox">灵感收件箱</span></div>
  <div class="eco anim"><div class="inbox">${inboxHtml}</div><div class="inbox-summary"><span data-i18n="inboxSummary" data-i18n-args='${JSON.stringify({n: recentInbox.length})}'>本次新增 ${recentInbox.length} 条灵感</span></div></div>

  <!-- 1. AI内容总监 -->
  <div class="sec-title">🤖 <span data-i18n="secDirector">AI 内容总监</span></div>
  <div class="eco"><div class="director-notes">${directorHtml}</div></div>

  <!-- 2. 近期最值得发 -->
  <div class="sec-title">🔥 <span data-i18n="secTopPicks">近期最值得发</span></div>
  <div class="picks">${topPicksHtml || `<div style="color:var(--text3)" data-i18n="noTopics">暂无选题</div>`}</div>

  <!-- 4. 内容生态分析 -->
  <div class="sec-title">📊 <span data-i18n="secEcosystem">内容生态分析</span></div>
  <div class="eco">${ecoHtml}${ecoAdvice}</div>

  <!-- 5. 选题库 -->
  <div class="sec-title">📋 <span data-i18n="secTopics">选题库</span></div>
  <div class="topics">${themeSections}</div>

  <!-- 6. 创作进度 -->
  <div class="sec-title">📈 <span data-i18n="secProgress">创作进度</span></div>
  <div class="eco">
    <div class="progress-grid">
      <div class="pg-item"><div class="pg-num">${data.topics.length}</div><div class="pg-label" data-i18n="labelTotal">总选题</div></div>
      <div class="pg-item"><div class="pg-num pg-green">${ready}</div><div class="pg-label" data-i18n="labelReady">准备完成</div></div>
      <div class="pg-item"><div class="pg-num pg-purple">${published}</div><div class="pg-label" data-i18n="labelPublished">已发布</div></div>
      <div class="pg-item"><div class="pg-num pg-coral">${needCases}</div><div class="pg-label" data-i18n="labelNeedCases">待补充案例</div></div>
      <div class="pg-item"><div class="pg-num pg-gray">${draftCount}</div><div class="pg-label" data-i18n="labelDraft">想法阶段</div></div>
      <div class="pg-item"><div class="pg-num pg-gray">${abandoned}</div><div class="pg-label" data-i18n="labelAbandoned">已放弃</div></div>
    </div>
  </div>

  <!-- 7b. 创作资产 -->
  <div class="sec-title">💎 <span data-i18n="secAssets">创作资产</span></div>
  <div class="eco">
    <div class="assets-grid">
      <div class="asset-item"><div class="asset-num">${data.topics.length + published}</div><div class="asset-label" data-i18n="assetInputs">累计灵感</div></div>
      <div class="asset-item"><div class="asset-num">${data.topics.length}</div><div class="asset-label" data-i18n="assetTopics">形成选题</div></div>
      <div class="asset-item"><div class="asset-num">${totalMerged}</div><div class="asset-label" data-i18n="assetMerged">合并重复</div></div>
      <div class="asset-item"><div class="asset-num">${totalSeriesCount}</div><div class="asset-label" data-i18n="assetSeries">内容系列</div></div>
    </div>
  </div>

  <!-- 7c. 创作者画像 -->
  <div class="sec-title">👤 <span data-i18n="secProfile">创作者画像</span></div>
  <div class="eco">
    <div class="profile-grid">
      <div class="profile-item"><div class="profile-label" data-i18n="profilePersona">人设</div><div class="profile-value">${esc(profile.persona || config?.persona || (dashboardLang === 'en' ? 'Not set' : '未设置'))}</div></div>
      <div class="profile-item"><div class="profile-label" data-i18n="profileNiche">赛道</div><div class="profile-value">${esc(profile.niche || 'AI + 职场成长')}</div></div>
      <div class="profile-item"><div class="profile-label" data-i18n="profileGoal">目标</div><div class="profile-value">${esc(profile.goal || '影响更多的人')}</div></div>
      <div class="profile-item"><div class="profile-label" data-i18n="profilePlatforms">主平台</div><div class="profile-value">${esc(profile.platforms?.join(', ') || '小红书')}</div></div>
      <div class="profile-item"><div class="profile-label" data-i18n="profileStage">当前阶段</div><div class="profile-value">${followerNum.toLocaleString()} <span data-i18n="followerSuffix">粉</span></div></div>
    </div>
  </div>

  <!-- 8. 选题墓地 -->
  <div class="sec-title">🪦 <span data-i18n="secGraveyard">暂不推荐</span></div>
  <div class="eco"><div class="graveyard">${graveyardHtml}</div></div>

  <!-- 9. 价值地图 -->
  <div class="sec-title">🎯 <span data-i18n="secValueMap">选题价值地图</span></div>
  <div class="map-wrap">
    <div class="map">
      <div class="map-quadrant map-q1">🔥<span data-i18n="mapHighHigh">高流量·高人设</span></div>
      <div class="map-quadrant map-q2">👤<span data-i18n="mapLowHigh">低流量·高人设</span></div>
      <div class="map-quadrant map-q3"><span data-i18n="mapMemo">备忘录</span></div>
      <div class="map-quadrant map-q4">🔥<span data-i18n="mapHighLow">高流量·低人设</span></div>
      ${mapDots}
      <div class="map-axis-x"><span data-i18n="mapAxisViral">流量价值 ↑</span></div>
      <div class="map-axis-y"><span data-i18n="mapAxisBrand">人设价值 ↑</span></div>
    </div>
  </div>

  <div class="footer">Creator OS · Built ${today()} · ${data.topics.length} topics</div>
</div>

${modals}

<script>
var currentLang='zh';

const UI={
  heroBadge:{zh:'创作者工作台',en:'Creator Studio'},
  heroTitle:{zh:'Creator OS',en:'Creator OS'},
  heroSub:{zh:'今天，你有 {n} 个值得创作的想法',en:'You have {n} ideas worth creating today'},
  heroCta:{zh:'今日推荐：',en:"Today's Pick: "},
  statTopics:{zh:'选题',en:'Topics'},
  statReady:{zh:'可发布',en:'Ready'},
  statPublished:{zh:'已发布',en:'Published'},
  statSeries:{zh:'系列',en:'Series'},
  secInbox:{zh:'灵感收件箱',en:'Idea Inbox'},
  secDirector:{zh:'AI 内容总监',en:'AI Director'},
  secTopPicks:{zh:'近期最值得发',en:'Top Picks'},
  secEcosystem:{zh:'内容生态分析',en:'Content Ecosystem'},
  secTopics:{zh:'选题库',en:'Topic Library'},
  secSeries:{zh:'内容系列',en:'Content Series'},
  secProgress:{zh:'创作进度',en:'Creator Progress'},
  secAssets:{zh:'创作资产',en:'Creator Assets'},
  secProfile:{zh:'创作者画像',en:'Creator Profile'},
  secGraveyard:{zh:'暂不推荐',en:'Not Recommended'},
  secValueMap:{zh:'选题价值地图',en:'Value Map'},
  labelTotal:{zh:'总选题',en:'Total'},
  labelReady:{zh:'准备完成',en:'Ready'},
  labelPublished:{zh:'已发布',en:'Published'},
  labelNeedCases:{zh:'待补充案例',en:'Needs Cases'},
  labelDraft:{zh:'想法阶段',en:'Draft'},
  labelAbandoned:{zh:'已放弃',en:'Abandoned'},
  assetInputs:{zh:'累计灵感',en:'Total Ideas'},
  assetTopics:{zh:'形成选题',en:'Topics'},
  assetMerged:{zh:'合并重复',en:'Merged'},
  assetSeries:{zh:'内容系列',en:'Series'},
  profilePersona:{zh:'人设',en:'Persona'},
  profileNiche:{zh:'赛道',en:'Niche'},
  profileGoal:{zh:'目标',en:'Goal'},
  profilePlatforms:{zh:'主平台',en:'Platforms'},
  profileStage:{zh:'当前阶段',en:'Stage'},
  followerSuffix:{zh:'粉',en:' followers'},
  noTopics:{zh:'暂无选题',en:'No topics yet'},
  langHint:{zh:'界面语言仅影响看板文案，内容默认保留原文。',en:'Dashboard language only changes UI labels. Content stays in its original language by default.'},
  mapHighHigh:{zh:'高流量·高人设',en:'High Viral · High Brand'},
  mapLowHigh:{zh:'低流量·高人设',en:'Low Viral · High Brand'},
  mapMemo:{zh:'备忘录',en:'Memo'},
  mapHighLow:{zh:'高流量·低人设',en:'High Viral · Low Brand'},
  mapAxisViral:{zh:'流量价值 ↑',en:'Viral Value ↑'},
  mapAxisBrand:{zh:'人设价值 ↑',en:'Brand Value ↑'},
  emptyInbox:{zh:'还没有灵感记录',en:'No ideas yet'},
  emptyGraveyardTitle:{zh:'当前所有选题均值得保留',en:'All topics are worth keeping'},
  emptyGraveyardDesc:{zh:'当出现以下情况时会进入此区域：',en:'Topics appear here when:'},
  graveyardHomogeneous:{zh:'同质化严重',en:'Too similar to existing'},
  graveyardLowViral:{zh:'爆款潜力低',en:'Low viral potential'},
  graveyardLowScore:{zh:'综合评分不足',en:'Low composite score'},
  scoreViral:{zh:'爆款',en:'Viral'},
  scoreBrand:{zh:'人设',en:'Brand'},
  scoreComp:{zh:'竞争',en:'Competition'},
  levelLow:{zh:'低',en:'Low'},
  levelMid:{zh:'中',en:'Mid'},
  levelHigh:{zh:'高',en:'High'},
  modalRaw:{zh:'原始灵感',en:'Original Idea'},
  modalTheme:{zh:'主题',en:'Theme'},
  modalPlatform:{zh:'平台',en:'Platform'},
  modalFormat:{zh:'形式',en:'Format'},
  modalStage:{zh:'阶段',en:'Stage'},
  modalPriority:{zh:'优先级',en:'Priority'},
  modalTags:{zh:'价值标签',en:'Tags'},
  modalNote:{zh:'备注',en:'Note'},
  modalRecommend:{zh:'推荐发布时间',en:'Recommend'},
  modalScoreDetail:{zh:'评分详情',en:'Score Details'},
  modalCreated:{zh:'创建时间',en:'Created'},
  modalUpdated:{zh:'最后更新',en:'Updated'},
  modalLink:{zh:'链接',en:'Link'},
  modalMergedFrom:{zh:'合并来源',en:'Merged From'},
  modalScoreViral:{zh:'爆款指数',en:'Viral Score'},
  modalScoreBrand:{zh:'人设价值',en:'Brand Score'},
  modalScoreBiz:{zh:'商业价值',en:'Business Value'},
  modalScoreComp:{zh:'竞争度',en:'Competition'},
  modalPublishBtn:{zh:'标记为已发布',en:'Mark as Published'},
  readinessPublished:{zh:'已发布',en:'Published'},
  readinessReady:{zh:'准备完成',en:'Ready'},
  readinessHighPotential:{zh:'高潜力',en:'High Potential'},
  readinessNeedsCases:{zh:'需要补充',en:'Needs Cases'},
  readinessDraft:{zh:'想法阶段',en:'Idea Stage'},
  inboxSummary:{zh:'本次新增 {n} 条灵感',en:'{n} new ideas this time'},
  updateBestLabel:{zh:'本次最佳发现',en:'Best Discovery'},
  updateMerged:{zh:'合并了 {n} 条相似想法',en:'Merged {n} similar ideas'},
  directorNext:{zh:'建议下一篇发：',en:'Suggest next:'},
  directorGap:{zh:'内容不足，建议补充。',en:'Content gap — consider adding more.'},
  directorOk:{zh:'内容分布健康，继续保持当前节奏。',en:'Content distribution is healthy. Keep going!'},
  ecoUnbalanced:{zh:'内容生态不均衡',en:'Unbalanced ecosystem'},
  unitArticles:{zh:'篇',en:''},
  seriesSuggestPrefix:{zh:'建议补充：',en:'Suggest:'},
  seriesEmpty:{zh:'继续输入灵感，系统会自动识别可形成系列的内容',en:'Keep adding ideas — the system will auto-detect series'},
  seriesSuggest:{zh:'还差 {n} 个选题即可形成系列',en:'{n} more topics to form a series'},
  directorOverprod:{zh:'你最近在过度生产「{theme}」内容。过去 {n} 个选题中，它占了 {pct}%。',en:'Overproducing "{theme}" content — {pct}% of your last {n} topics.'},
  directorIsHighest:{zh:'是当前最高的。',en:'is the highest right now.'},
  directorSuggestTime:{zh:'建议{time}发布。',en:'Suggest publishing {time}.'},
  graveyardHighComp:{zh:'竞争度过高',en:'High competition'},
  graveyardNoCases:{zh:'缺少案例支撑',en:'Lacks case studies'},
  graveyardOffBrand:{zh:'与账号定位不符',en:'Off-brand'},
  ecoSuggest:{zh:'仅占 {pct}%，建议补充',en:'Only {pct}% — consider adding more'},
  // Theme name translations (for Topic Library group headers)
  themeNameMap:{
    'AI工具测评':'AI Tools Review',
    'AI工作流':'AI Workflow',
    '运营成长':'Career Growth',
    '海外运营':'Overseas Marketing',
    '理工转运营':'Tech to Marketing',
    '个人品牌':'Personal Brand',
    '行业洞察':'Industry Insight',
    'AI生活升级':'AI Life Upgrade',
    '其他':'Other'
  },
  // Format translations
  formatMap:{
    '长文':'Long-form Article',
    '图文':'Image + Text',
    '短视频':'Short Video',
    '长视频':'Long Video',
    '直播':'Livestream',
    '图文轮播':'Carousel',
    'Thread':'Thread',
    '视频':'Video'
  },
  // Value tags translations
  tagMap:{
    '爆款':'Viral',
    '实用':'Practical',
    '干货':'Actionable',
    '故事':'Story',
    '热点':'Trending',
    '教程':'Tutorial',
    '对比':'Comparison',
    '测评':'Review',
    '案例':'Case Study',
    '方法论':'Methodology',
    '工具':'Tools',
    '资源':'Resources'
  }
};

// Initialize language from localStorage
switchLang(localStorage.getItem('cos-lang')||'zh');
  });
  try{localStorage.setItem('cos-lang',lang)}catch(e){}
}
setLang(currentLang);
// Open modal - global function
window.openDetail=function(id){
  var m=document.getElementById('modal-'+id);
  if(m){m.className='modal active';document.body.style.overflow='hidden';}
};

// Close modal - global function
window.closeDetail=function(id){
  var m=document.getElementById('modal-'+id);
  if(m){m.className='modal';document.body.style.overflow='';}
};

// Close modal on Escape key
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){
    document.querySelectorAll('.modal.active').forEach(function(m){m.className='modal';});
    document.body.style.overflow='';
  }
});

// Mark published function - improved UX
window.markPublished=function(id){
  var url=prompt('Enter publish URL (optional):','');
  var cmd='node topic.js publish '+id+(url?' --url "'+url+'"':'');
  if(confirm('Copy this command and run it in terminal?\n\n'+cmd)){
    // Try to copy to clipboard
    if(navigator.clipboard){
      navigator.clipboard.writeText(cmd).then(function(){
        alert('Command copied to clipboard!\n\nPaste and run in your terminal, then refresh this page.');
      }).catch(function(){
        alert('Run this command in your terminal:\n\n'+cmd+'\n\nThen refresh this page.');
      });
    }else{
      alert('Run this command in your terminal:\n\n'+cmd+'\n\nThen refresh this page.');
    }
  }
};
</script>
</body>
</html>`;

  writeFileSync(join(__dirname, '..', 'preview.html'), html, 'utf-8');
  console.log(`✅ Creator OS built — ${themeOrder.length} themes, ${data.topics.length} topics`);
}

// ========== Main ==========
const [cmd, ...rest] = process.argv.slice(2);
switch (cmd) {
  case 'init': cmdInit(); break;
  case 'ingest': cmdIngest(rest.join(' ')); break;
  case 'save': cmdSave(rest); break;
  case 'merge': cmdMerge(rest[0], rest[1]); break;
  case 'list': cmdList(); break;
  case 'get': cmdGet(rest[0]); break;
  case 'update': cmdUpdate(rest[0], rest.slice(1)); break;
  case 'delete': cmdDelete(rest[0]); break;
  case 'publish': { const ui = rest.indexOf('--url'); cmdPublish(rest[0], ui >= 0 ? rest[ui + 1] : null); break; }
  case 'history': cmdHistory(); break;
  case 'config': cmdConfig(); break;
  case 'set-config': cmdSetConfig(rest[0], rest[1]); break;
  case 'set-profile': cmdSetProfile(rest); break;
  case 'build': cmdBuild(); break;
  case 'batch': cmdBatch(rest.join(' ')); break;
  default: console.log(`Creator OS CLI

Commands:
  init                    Initialize
  ingest "notes"          Process new ideas (dedup + merge + classify)
  batch '{"topics":[...]}' Batch save + merge + build (JSON input)
  save --title "..."      Save a topic
  merge <target> <source> Merge duplicate topics
  list                    List all topics
  get <id>                View detail
  update <id> --key val   Update
  delete <id>             Delete
  publish <id> [--url]    Mark published
  build                   Generate dashboard
  history                 View inbox log
  config / set-config     Configuration
  set-profile             Set creator profile (--niche --persona --goal --platforms)`);
}
