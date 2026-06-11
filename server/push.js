// Web Push (Phase 2). Free via VAPID. Stores subscriptions as JSON on a (Railway) volume so
// notifications survive restarts. Disabled gracefully if VAPID keys aren't configured.

const fs = require('fs');
const path = require('path');
const webpush = require('web-push');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const STORE = path.join(DATA_DIR, 'subscriptions.json');

const PUBLIC = process.env.VAPID_PUBLIC_KEY || '';
const PRIVATE = process.env.VAPID_PRIVATE_KEY || '';
const SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';
const enabled = Boolean(PUBLIC && PRIVATE);

if (enabled) webpush.setVapidDetails(SUBJECT, PUBLIC, PRIVATE);

// ---- store ----
let subs = [];
function load() {
  try { subs = JSON.parse(fs.readFileSync(STORE, 'utf8')); if (!Array.isArray(subs)) subs = []; }
  catch { subs = []; }
}
function save() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(STORE + '.tmp', JSON.stringify(subs));
    fs.renameSync(STORE + '.tmp', STORE);
  } catch (e) { console.warn('[push] save failed:', e.message); }
}
load();

function subscribe(subscription, teams) {
  if (!subscription?.endpoint) return false;
  const teamIds = (teams || []).map(String);
  const existing = subs.find(s => s.subscription.endpoint === subscription.endpoint);
  if (existing) { existing.subscription = subscription; existing.teams = teamIds; }
  else subs.push({ subscription, teams: teamIds, lastSent: {} });
  save();
  return true;
}
function unsubscribe(endpoint) {
  const before = subs.length;
  subs = subs.filter(s => s.subscription.endpoint !== endpoint);
  if (subs.length !== before) save();
}
function remove(endpoint) { subs = subs.filter(s => s.subscription.endpoint !== endpoint); save(); }

// ---- delivery ----
async function send(entry, payload, dedupKey) {
  if (entry.lastSent[dedupKey]) return;                  // already notified
  entry.lastSent[dedupKey] = Date.now();
  try {
    await webpush.sendNotification(entry.subscription, JSON.stringify(payload));
  } catch (err) {
    if (err.statusCode === 404 || err.statusCode === 410) remove(entry.subscription.endpoint);
    else console.warn('[push] send error', err.statusCode || err.message);
  }
}

function eventsFor(change) {
  const { prev, next } = change;
  const out = [];
  const hs = parseInt(next.home.score, 10), as = parseInt(next.away.score, 10);
  const phs = parseInt(prev.home.score, 10), pas = parseInt(prev.away.score, 10);
  const line = `${next.home.name} ${Number.isNaN(hs) ? 0 : hs}–${Number.isNaN(as) ? 0 : as} ${next.away.name}`;

  if (prev.status === 'pre' && next.status === 'in')
    out.push({ key: `${next.id}:ko`, title: '⚽ Kick-off', body: `${next.home.name} vs ${next.away.name} is starting now` });
  if (next.status === 'in' && (hs > phs || as > pas))
    out.push({ key: `${next.id}:goal:${hs}-${as}`, title: '⚽ GOAL!', body: `${line}${next.clock ? ` (${next.clock})` : ''}` });
  if (prev.status === 'in' && next.status === 'post')
    out.push({ key: `${next.id}:ft`, title: 'Full time', body: `FT — ${line}` });
  return out;
}

// Called by cache.onLiveChange with [{prev, next}]
async function handleLiveChanges(changes) {
  if (!enabled || !subs.length) return;
  for (const change of changes) {
    const evts = eventsFor(change);
    if (!evts.length) continue;
    const teamIds = [change.next.home.id, change.next.away.id];
    const interested = subs.filter(s => s.teams.some(id => teamIds.includes(id)));
    for (const entry of interested) {
      for (const e of evts) {
        await send(entry, { title: e.title, body: e.body, matchId: change.next.id, url: '/my.html' }, e.key);
      }
    }
  }
}

module.exports = {
  enabled,
  getPublicKey: () => (enabled ? PUBLIC : null),
  subscribe, unsubscribe, handleLiveChanges,
  count: () => subs.length,
  _eventsFor: eventsFor,   // exposed for tests
};
