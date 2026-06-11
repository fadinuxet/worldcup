/* Shared API client + render helpers. Exposes window.WC. */
window.WC = (function () {
  const cache = {};
  async function fetchJSON(path) {
    const res = await fetch(path, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(path + ' -> ' + res.status);
    return res.json();
  }
  const memo = (key, fn) => (cache[key] ||= fn());

  const getTeams = () => memo('teams', () => fetchJSON('/api/teams'));
  const getGroups = () => memo('groups', () => fetchJSON('/api/groups'));
  const getMatches = () => memo('matches', () => fetchJSON('/api/matches'));
  const getLive = () => fetchJSON('/api/live');
  const getHealth = () => fetchJSON('/api/health');

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // local-timezone formatting
  function kickoffTime(iso) {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  function dayKey(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  }
  // local calendar-day helpers (viewer's timezone, not UTC). offset: 0=today, 1=tomorrow…
  const localYMD = d => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  function isLocalDay(iso, offset = 0) { const t = new Date(); t.setDate(t.getDate() + offset); return localYMD(new Date(iso)) === localYMD(t); }
  const isToday = iso => isLocalDay(iso, 0);
  function dayOffsetLabel(offset = 0) { const t = new Date(); t.setDate(t.getDate() + offset); return t.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }); }
  const todayLabel = () => dayOffsetLabel(0);
  function tzAbbr() {
    return new Date().toLocaleTimeString([], { timeZoneName: 'short' }).split(' ').pop();
  }

  function flag(team, size = 'w-8 h-8') {
    const src = team.logo || '';
    return `<img class="flag rounded-full object-cover ${size}" loading="lazy" alt="${esc(team.name)}" src="${esc(src)}"
              onerror="this.style.visibility='hidden'">`;
  }

  // group matches by local day, preserving chronological order
  function groupByDay(matches) {
    const out = [];
    const idx = {};
    for (const m of matches) {
      const k = dayKey(m.date);
      if (idx[k] === undefined) { idx[k] = out.length; out.push({ day: k, matches: [] }); }
      out[idx[k]].matches.push(m);
    }
    return out;
  }

  return { fetchJSON, getTeams, getGroups, getMatches, getLive, getHealth, esc, kickoffTime, dayKey, tzAbbr, flag, groupByDay,
           isToday, isLocalDay, dayOffsetLabel, todayLabel,
           clearCache: () => { for (const k in cache) delete cache[k]; } };
})();
