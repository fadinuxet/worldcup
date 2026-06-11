(async function () {
  UI.renderChrome();
  document.getElementById('today-date').textContent = WC.todayLabel() + ' · ' + WC.tzAbbr();
  const list = document.getElementById('list');
  UI.loading(list);

  let matches = [];
  try { matches = await WC.getMatches(); } catch { list.innerHTML = '<p class="text-error">Could not load matches.</p>'; return; }

  // "today" = the viewer's local calendar day
  const today = matches.filter(m => WC.isToday(m.date)).sort((a, b) => new Date(a.date) - new Date(b.date));

  if (today.length) {
    // live first, then by kickoff
    today.sort((a, b) => (a.status === 'in' ? -1 : 0) - (b.status === 'in' ? -1 : 0));
    list.innerHTML = `<div class="grid gap-3 md:grid-cols-2">${today.map(Cmp.matchCard).join('')}</div>`;
  } else {
    const next = matches.find(m => m.status === 'pre');
    list.innerHTML = `
      <div class="bg-surface-container rounded-xl border border-dashed border-outline-variant/40 p-8 text-center mb-6">
        <span class="material-symbols-outlined text-4xl text-primary-fixed-dim">event_available</span>
        <p class="font-headline-md text-lg font-bold mt-2">No matches today</p>
        <p class="font-body-md text-on-surface-variant mt-1">There are no World Cup matches on your calendar today.</p>
      </div>
      ${next ? `<h2 class="font-label-match text-xs tracking-widest text-on-surface-variant mb-3">NEXT MATCH · ${WC.esc(WC.dayKey(next.date))}</h2>
        <div class="grid gap-3 md:grid-cols-2">${Cmp.matchCard(next)}</div>` : ''}`;
  }

  Live.start();
})();
