(async function () {
  UI.renderChrome();
  const listEl = document.getElementById('list');
  const scopeEl = document.getElementById('scope');
  const daysEl = document.getElementById('days');
  const dayLabel = document.getElementById('day-label');
  UI.loading(listEl);

  let matches = [];
  try { matches = await WC.getMatches(); } catch { listEl.innerHTML = '<p class="text-error">Could not load matches.</p>'; return; }

  const SKEY = 'wc26.scope';
  let scope = localStorage.getItem(SKEY) || 'all';   // 'all' | 'my'
  let day = 0;                                        // 0 = today, 1 = tomorrow

  const opt = (active, label, attr, val) =>
    `<button ${attr}="${val}" class="opt whitespace-nowrap font-label-match text-xs tracking-widest px-4 py-2 rounded-xl border transition ${active ? 'bg-primary-container text-on-primary-container border-primary-container' : 'bg-surface-container text-on-surface-variant border-outline-variant/30 hover:text-on-surface'}">${label}</button>`;

  function chrome() {
    scopeEl.innerHTML = opt(scope === 'all', 'ALL', 'data-scope', 'all') + opt(scope === 'my', 'MY TEAMS', 'data-scope', 'my');
    daysEl.innerHTML = opt(day === 0, 'TODAY', 'data-day', '0') + opt(day === 1, 'TOMORROW', 'data-day', '1');
    dayLabel.textContent = WC.dayOffsetLabel(day) + ' · ' + WC.tzAbbr();
  }

  function followPrompt() {
    return `<div class="bg-surface-container rounded-xl border border-dashed border-outline-variant/40 p-8 text-center">
      <span class="material-symbols-outlined text-4xl text-primary-fixed-dim">star</span>
      <p class="font-headline-md text-lg font-bold mt-2">No teams followed yet</p>
      <p class="font-body-md text-on-surface-variant mt-1 mb-4">Follow teams to see only their matches here.</p>
      <a href="/teams.html" class="inline-block font-label-match text-xs tracking-widest px-5 py-3 rounded-xl bg-primary-container text-on-primary-container">BROWSE TEAMS</a></div>`;
  }

  function render() {
    const ids = new Set(Follow.list());
    if (scope === 'my' && ids.size === 0) { listEl.innerHTML = followPrompt(); return; }

    const base = scope === 'my' ? matches.filter(m => ids.has(m.home.id) || ids.has(m.away.id)) : matches;
    const dayMatches = base
      .filter(m => WC.isLocalDay(m.date, day))
      .sort((a, b) => (b.status === 'in') - (a.status === 'in') || new Date(a.date) - new Date(b.date));

    listEl.innerHTML = dayMatches.length
      ? `<div class="grid gap-3 md:grid-cols-2">${dayMatches.map(Cmp.matchCard).join('')}</div>`
      : `<div class="bg-surface-container rounded-xl border border-dashed border-outline-variant/40 p-8 text-center">
          <span class="material-symbols-outlined text-3xl text-primary-fixed-dim">event_available</span>
          <p class="font-headline-md text-base font-bold mt-1">No matches ${day === 0 ? 'today' : 'tomorrow'}${scope === 'my' ? ' for your teams' : ''}</p>
          <p class="font-body-md text-on-surface-variant mt-1">See <a href="/matches.html" class="text-primary-fixed-dim underline">all matches</a> for the full schedule.</p></div>`;
  }

  scopeEl.addEventListener('click', e => { const b = e.target.closest('[data-scope]'); if (!b) return; scope = b.dataset.scope; localStorage.setItem(SKEY, scope); chrome(); render(); });
  daysEl.addEventListener('click', e => { const b = e.target.closest('[data-day]'); if (!b) return; day = +b.dataset.day; chrome(); render(); });

  chrome();
  render();
  Follow.onChange(render);
  Live.start();
})();
