// Thin ESPN public-API client. No key required. Timeout + retries; throws on final failure.

const DEFAULT_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world';
// LIVE_FEED=all points the LIVE poller at the all-soccer scoreboard (has live games year-round)
// so we can verify live rendering before the WC starts. Default uses the WC feed.
const LIVE_BASE = process.env.LIVE_FEED === 'all'
  ? 'https://site.api.espn.com/apis/site/v2/sports/soccer/all'
  : (process.env.ESPN_BASE || DEFAULT_BASE);
const BASE = process.env.ESPN_BASE || DEFAULT_BASE;

const TIMEOUT_MS = 8000;
const RETRIES = 2;

async function getJson(url) {
  let lastErr;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: { 'User-Agent': 'worldcup-app/1.0 (+https://github.com/fadinuxet/worldcup)' },
      });
      clearTimeout(t);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.json();
    } catch (err) {
      clearTimeout(t);
      lastErr = err;
      if (attempt < RETRIES) await new Promise(r => setTimeout(r, 500 + attempt * 1000));
    }
  }
  throw lastErr;
}

const fetchTeams = () => getJson(`${BASE}/teams`);
const fetchScoreboard = (dateStr) => getJson(`${BASE}/scoreboard?dates=${dateStr}`);
const fetchLiveScoreboard = (dateStr) => getJson(`${LIVE_BASE}/scoreboard${dateStr ? `?dates=${dateStr}` : ''}`);
const fetchNews = () => getJson(`${BASE}/news`);

module.exports = { BASE, LIVE_BASE, fetchTeams, fetchScoreboard, fetchLiveScoreboard, fetchNews };
