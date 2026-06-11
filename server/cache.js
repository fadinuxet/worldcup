// In-memory store + two pollers. The SERVER polls ESPN; clients only ever hit our /api/*.
// Never throws to the caller; serves last-good data and reports staleness via /api/health.

const espn = require('./espn');
const { buildTeams, normalizeMatch } = require('./normalize');
const { computeStandings } = require('./standings');
const { GROUPS, LETTERS, validate } = require('./config/groups');

const TOURNAMENT_START = '2026-06-11';
const TOURNAMENT_END = '2026-07-19';
const FULL_INTERVAL_MS = 10 * 60 * 1000;   // 10 min
const LIVE_INTERVAL_MS = 25 * 1000;        // 25 s
const SANITY_MIN_EVENTS = 90;              // accept a full refresh only if it looks complete

const state = {
  teams: [],
  teamsById: {},
  matchesById: {},
  lastFullRefresh: 0,
  lastLiveRefresh: 0,
  ready: false,
};

let liveChangeCb = null;
const onLiveChange = (cb) => { liveChangeCb = cb; };

// ---- date helpers (UTC) ----
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;

function tournamentDates() {
  const out = [];
  const d = new Date(TOURNAMENT_START + 'T00:00:00Z');
  const end = new Date(TOURNAMENT_END + 'T00:00:00Z');
  while (d <= end) { out.push(ymd(d)); d.setUTCDate(d.getUTCDate() + 1); }
  return out;
}

async function mapLimit(items, limit, fn) {
  const results = [];
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx]).catch(() => null);
    }
  });
  await Promise.all(workers);
  return results;
}

// ---- full refresh: teams + all fixtures across the tournament ----
async function refreshFull() {
  try {
    if (!state.teams.length) {
      const teamsJson = await espn.fetchTeams();
      const teams = buildTeams(teamsJson);
      if (teams.length) {
        state.teams = teams;
        state.teamsById = Object.fromEntries(teams.map(t => [t.id, t]));
        const problems = validate(teams.map(t => t.id));
        if (problems.length) console.warn('[groups] validation issues:\n  ' + problems.join('\n  '));
      }
    }

    const dates = tournamentDates();
    const pages = await mapLimit(dates, 4, espn.fetchScoreboard);
    const fresh = {};
    for (const page of pages) {
      for (const ev of (page?.events || [])) {
        const m = normalizeMatch(ev);
        fresh[m.id] = m;                       // de-dupe by event id (handles UTC rollover overlap)
      }
    }

    const count = Object.keys(fresh).length;
    if (count >= SANITY_MIN_EVENTS) {
      state.matchesById = fresh;               // atomic swap
      state.ready = true;
      state.lastFullRefresh = Date.now();
      console.log(`[full] refreshed: ${count} matches, ${state.teams.length} teams`);
    } else {
      console.warn(`[full] only ${count} events (< ${SANITY_MIN_EVENTS}) — keeping last-good`);
      if (count && !state.ready) { state.matchesById = fresh; state.ready = true; state.lastFullRefresh = Date.now(); }
    }
  } catch (err) {
    console.warn('[full] refresh failed, keeping last-good:', err.message);
  }
}

// ---- live refresh: today (+ yesterday for UTC boundary); merge in place, emit diffs ----
async function refreshLive() {
  try {
    const now = new Date();
    const yest = new Date(now.getTime() - 24 * 3600 * 1000);
    let events = [];
    if (process.env.LIVE_FEED === 'all') {
      const page = await espn.fetchLiveScoreboard();          // today's all-soccer (verification mode)
      events = page?.events || [];
    } else {
      const [a, b] = await Promise.all([
        espn.fetchLiveScoreboard(ymd(now)).catch(() => null),
        espn.fetchLiveScoreboard(ymd(yest)).catch(() => null),
      ]);
      events = [...(a?.events || []), ...(b?.events || [])];
    }

    const changes = [];
    for (const ev of events) {
      const next = normalizeMatch(ev);
      const prev = state.matchesById[next.id];
      if (prev && (prev.status !== next.status || prev.home.score !== next.home.score || prev.away.score !== next.away.score)) {
        changes.push({ prev, next });
      }
      state.matchesById[next.id] = next;                      // upsert
    }
    state.lastLiveRefresh = Date.now();
    if (changes.length && liveChangeCb) { try { liveChangeCb(changes); } catch (e) { console.warn('[live] cb error', e.message); } }
  } catch (err) {
    console.warn('[live] refresh failed, keeping last-good:', err.message);
  }
}

// ---- public getters ----
const allMatches = () => Object.values(state.matchesById).sort((a, b) => new Date(a.date) - new Date(b.date));

function getGroups() {
  const standings = computeStandings(allMatches());
  return LETTERS.map(letter => ({
    letter,
    teams: GROUPS[letter].map(id => state.teamsById[id]).filter(Boolean),
    standings: (standings[letter] || []).map(r => ({ ...r, team: state.teamsById[r.teamId] || null })),
  }));
}

function getHealth() {
  return {
    ok: true,
    ready: state.ready,
    stale: Date.now() - state.lastFullRefresh > 15 * 60 * 1000,
    teams: state.teams.length,
    matches: Object.keys(state.matchesById).length,
    lastFullRefresh: state.lastFullRefresh,
    lastLiveRefresh: state.lastLiveRefresh,
    liveFeed: process.env.LIVE_FEED === 'all' ? 'all-soccer (verification)' : 'fifa.world',
  };
}

async function init() {
  await refreshFull();
  await refreshLive();
}

function startPollers() {
  setInterval(refreshFull, FULL_INTERVAL_MS);
  setInterval(refreshLive, LIVE_INTERVAL_MS);
}

module.exports = {
  init, startPollers, onLiveChange,
  getTeams: () => state.teams,
  getGroups,
  getMatches: allMatches,
  getLive: () => allMatches().filter(m => m.status === 'in'),
  getHealth,
  _state: state,
};
