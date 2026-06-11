(async function () {
  UI.renderChrome();
  const wrap = document.getElementById('groups');
  UI.loading(wrap);

  let groups = [];
  try { groups = await WC.getGroups(); } catch { wrap.innerHTML = '<p class="text-error">Could not load teams.</p>'; return; }

  function teamCard(t) {
    return `<div class="flex items-center gap-3 bg-surface-container rounded-xl p-3 border border-outline-variant/20" data-team-id="${WC.esc(t.id)}">
      <div class="w-10 h-10 rounded-full border border-outline-variant p-0.5 shrink-0">${WC.flag(t, 'w-full h-full')}</div>
      <div class="min-w-0 flex-1">
        <p class="font-body-md text-sm truncate">${WC.esc(t.name)}</p>
        <p class="font-label-data text-[11px] text-on-surface-variant">${WC.esc(t.abbr)}</p>
      </div>
      ${Follow.starButton(t)}
    </div>`;
  }

  function render() {
    wrap.innerHTML = groups.map(g => `
      <section class="mb-8">
        <h2 class="font-headline-md text-lg font-bold mb-3"><span class="text-primary-fixed-dim">Group ${g.letter}</span></h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">${g.teams.map(teamCard).join('')}</div>
      </section>`).join('');
    document.getElementById('follow-count').textContent = Follow.list().length;
  }
  render();
  Follow.onChange(() => { document.getElementById('follow-count').textContent = Follow.list().length; });
})();
