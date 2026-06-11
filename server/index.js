const path = require('path');
const express = require('express');
const compression = require('compression');

const cache = require('./cache');
const push = require('./push');
const espn = require('./espn');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

app.use(compression());
app.use(express.json({ limit: '64kb' }));

// ---------- API ----------
app.get('/api/health', (_req, res) => res.json({ ...cache.getHealth(), pushEnabled: push.enabled, pushSubs: push.count() }));
app.get('/api/teams', (_req, res) => res.json(cache.getTeams()));
app.get('/api/groups', (_req, res) => res.json(cache.getGroups()));
app.get('/api/live', (_req, res) => res.json(cache.getLive()));

app.get('/api/matches', (req, res) => {
  let matches = cache.getMatches();
  const { team, status, date, stage } = req.query;
  if (team) {
    const ids = String(team).split(',').map(s => s.trim().toUpperCase());
    matches = matches.filter(m =>
      ids.includes(m.home.id) || ids.includes(m.away.id) ||
      ids.includes((m.home.abbr || '').toUpperCase()) || ids.includes((m.away.abbr || '').toUpperCase()));
  }
  if (status) matches = matches.filter(m => m.status === status);
  if (stage) matches = matches.filter(m => m.stage === stage);
  if (date) {
    matches = matches.filter(m => {
      const d = new Date(m.date);
      const ymd = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
      return ymd === String(date);
    });
  }
  res.json(matches);
});

// Optional news feed (small on-demand cache)
let newsCache = { at: 0, data: [] };
app.get('/api/news', async (_req, res) => {
  if (Date.now() - newsCache.at > 5 * 60 * 1000) {
    try {
      const j = await espn.fetchNews();
      newsCache = {
        at: Date.now(),
        data: (j.articles || []).slice(0, 12).map(a => ({
          headline: a.headline,
          description: a.description,
          published: a.published,
          image: a.images?.[0]?.url || null,
          link: a.links?.web?.href || null,
        })),
      };
    } catch { /* keep last-good */ }
  }
  res.json(newsCache.data);
});

// ---------- Push ----------
app.get('/api/push/key', (_req, res) => res.json({ publicKey: push.getPublicKey() }));
app.post('/api/push/subscribe', (req, res) => {
  const ok = push.subscribe(req.body?.subscription, req.body?.teams);
  res.status(ok ? 200 : 400).json({ ok });
});
app.post('/api/push/unsubscribe', (req, res) => {
  push.unsubscribe(req.body?.endpoint);
  res.json({ ok: true });
});

// ---------- Static (PWA) ----------
app.use(express.static(PUBLIC_DIR, { extensions: ['html'] }));
app.get('/', (_req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));

// ---------- Boot (listen immediately, then warm the cache) ----------
app.listen(PORT, () => console.log(`🌍 worldcup app listening on :${PORT} (push ${push.enabled ? 'on' : 'off'})`));
cache.onLiveChange(push.handleLiveChanges);
cache.init().then(() => { cache.startPollers(); console.log('✅ cache warmed; pollers started'); });
