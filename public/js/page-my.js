(async function () {
  UI.renderChrome();
  const teamsEl = document.getElementById('my-teams');
  const matchesEl = document.getElementById('my-matches');

  let teams = [], matches = [];
  try { [teams, matches] = await Promise.all([WC.getTeams(), WC.getMatches()]); }
  catch { teamsEl.innerHTML = '<p class="text-error">Could not load your data.</p>'; return; }
  const byId = Object.fromEntries(teams.map(t => [t.id, t]));

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

    if (!mine.length) {
      teamsEl.innerHTML = emptyState();
      matchesEl.innerHTML = '';
      return;
    }
    teamsEl.innerHTML = `<div class="flex flex-wrap gap-2">${mine.map(t => `
      <div class="flex items-center gap-2 bg-surface-container rounded-full pl-1 pr-2 py-1 border border-outline-variant/20">
        ${WC.flag(t, 'w-7 h-7')}<span class="font-body-md text-sm">${WC.esc(t.name)}</span>${Follow.starButton(t)}
      </div>`).join('')}</div>`;

    const mineMatches = matches.filter(m => ids.has(m.home.id) || ids.has(m.away.id));
    const upcomingLive = mineMatches.filter(m => m.status !== 'post');
    const finished = mineMatches.filter(m => m.status === 'post');
    const ordered = [...upcomingLive, ...finished.reverse()];
    matchesEl.innerHTML = ordered.length
      ? ordered.map(Cmp.matchCard).join('')
      : '<p class="font-body-md text-on-surface-variant">No matches scheduled yet for your teams.</p>';
  }

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
