(async function () {
  UI.renderChrome();
  const teamsEl = document.getElementById('my-teams');
  const matchesEl = document.getElementById('my-matches');

  let teams = [], matches = [];
  try { [teams, matches] = await Promise.all([WC.getTeams(), WC.getMatches()]); }
  catch { teamsEl.innerHTML = '<p class="text-error">Could not load your data.</p>'; return; }

  let selected = null; // team id to filter to; null = all my teams

  function emptyState() {
    return `<div class="bg-surface-container rounded-xl border border-dashed border-outline-variant/40 p-8 text-center">
      <span class="material-symbols-outlined text-4xl text-primary-fixed-dim">star</span>
      <p class="font-headline-md text-lg font-bold mt-2">No teams yet</p>
      <p class="font-body-md text-on-surface-variant mt-1 mb-4">Tap the ⭐ on any team to follow them. Their matches and alerts show up here.</p>
      <a href="/teams.html" class="inline-block font-label-match text-xs tracking-widest px-5 py-3 rounded-xl bg-primary-container text-on-primary-container">BROWSE TEAMS</a>
    </div>`;
  }

  function render() {
    const ids = new Set(Follow.list());
    const mine = teams.filter(t => ids.has(t.id));

    if (!mine.length) { teamsEl.innerHTML = emptyState(); matchesEl.innerHTML = ''; return; }
    if (selected && !ids.has(selected)) selected = null; // selected team was unfollowed

    // My Teams chips (⭐ unfollows)
    teamsEl.innerHTML = `<div class="flex flex-wrap gap-2">${mine.map(t => `
      <div class="flex items-center gap-2 bg-surface-container rounded-full pl-1 pr-2 py-1 border border-outline-variant/20">
        ${WC.flag(t, 'w-7 h-7')}<span class="font-body-md text-sm">${WC.esc(t.name)}</span>${Follow.starButton(t)}
      </div>`).join('')}</div>`;

    // filter pills: All + each followed team (tap to see that team only)
    const pill = (key, label, active, logo = '') =>
      `<button data-team="${key}" class="tg whitespace-nowrap inline-flex items-center gap-1.5 font-label-match text-xs tracking-widest px-3 py-2 rounded-xl border transition ${active ? 'bg-primary-container text-on-primary-container border-primary-container' : 'bg-surface-container text-on-surface-variant border-outline-variant/30'}">${logo}${label}</button>`;
    const pills = `<div id="team-pills" class="flex gap-2 overflow-x-auto pb-1 mb-4">
        ${pill('all', 'ALL', !selected)}
        ${mine.map(t => pill(t.id, WC.esc(t.abbr), selected === t.id, WC.flag(t, 'w-4 h-4'))).join('')}
      </div>`;

    // upcoming + live matches for the selected team (or all my teams), grouped by day (shows dates)
    const relevant = selected ? new Set([selected]) : ids;
    const list = matches
      .filter(m => (relevant.has(m.home.id) || relevant.has(m.away.id)) && m.status !== 'post')
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    matchesEl.innerHTML = pills + (list.length
      ? Cmp.matchList(list)
      : `<p class="font-body-md text-on-surface-variant">No upcoming matches for ${selected ? 'this team' : 'your teams'}.</p>`);
  }

  // pill clicks (delegated; pills re-render each time)
  matchesEl.addEventListener('click', e => {
    const b = e.target.closest('#team-pills .tg');
    if (!b) return;
    selected = b.dataset.team === 'all' ? null : b.dataset.team;
    render();
  });

  render();
  Follow.onChange(() => { render(); WCPush.syncTeams().catch(() => {}); });
  Live.start();

  // ---- Alerts (web push) ----
  const alertsBox = document.getElementById('alerts');
  const btn = document.getElementById('alerts-btn');
  const desc = document.getElementById('alerts-desc');
  const info = await WCPush.init();
  if (info.available) {
    alertsBox.hidden = false;
    async function refresh() {
      const st = await WCPush.status();
      if (st === 'on') { btn.textContent = 'ON'; btn.className = btn.className.replace('bg-primary-container text-on-primary-container', 'bg-surface-container-highest text-primary-fixed-dim border border-primary-container/40'); desc.textContent = 'Alerts are on for your followed teams.'; }
      else if (st === 'denied') { btn.textContent = 'BLOCKED'; btn.disabled = true; desc.textContent = 'Notifications are blocked in your browser settings.'; }
      else { btn.textContent = 'ENABLE'; desc.textContent = 'Get a push when your teams kick off, score, or finish.'; }
    }
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try {
        const st = await WCPush.status();
        if (st === 'on') await WCPush.disable(); else await WCPush.enable();
      } catch (e) { UI.toast('Could not update alerts'); }
      btn.disabled = false;
      refresh();
    });
    refresh();
  }
})();
