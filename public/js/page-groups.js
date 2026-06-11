(async function () {
  UI.renderChrome();
  const wrap = document.getElementById('groups');
  UI.loading(wrap);

  let groups = [];
  try { groups = await WC.getGroups(); } catch { wrap.innerHTML = '<p class="text-error">Could not load groups.</p>'; return; }

  function row(r) {
    const t = r.team || { name: '—', abbr: '—', logo: null };
    const qual = r.rank <= 2 ? 'qual-bar' : '';
    return `<tr class="${qual} border-t border-outline-variant/10">
      <td class="py-2 pl-3 pr-1 font-headline-md font-black text-on-surface-variant w-6">${r.rank}</td>
      <td class="py-2 pr-2"><div class="flex items-center gap-2 min-w-0">${WC.flag(t, 'w-6 h-6')}<span class="font-body-md text-sm truncate">${WC.esc(t.abbr)}</span></div></td>
      <td class="text-center font-label-data text-on-surface-variant">${r.P}</td>
      <td class="text-center font-label-data text-on-surface-variant hidden sm:table-cell">${r.W}</td>
      <td class="text-center font-label-data text-on-surface-variant hidden sm:table-cell">${r.D}</td>
      <td class="text-center font-label-data text-on-surface-variant hidden sm:table-cell">${r.L}</td>
      <td class="text-center font-label-data text-on-surface-variant">${r.GD > 0 ? '+' : ''}${r.GD}</td>
      <td class="text-center font-label-match font-bold text-primary-fixed-dim pr-3">${r.Pts}</td>
    </tr>`;
  }

  wrap.innerHTML = groups.map(g => `
    <section class="bg-surface-container rounded-xl border border-outline-variant/20 overflow-hidden">
      <h2 class="font-headline-md text-lg font-bold px-3 py-3 border-b border-outline-variant/20">Group <span class="text-primary-fixed-dim">${g.letter}</span></h2>
      <table class="w-full">
        <thead><tr class="font-label-data text-[10px] tracking-widest text-outline">
          <th class="text-left pl-3 py-2">#</th><th class="text-left py-2">TEAM</th>
          <th class="py-2">P</th><th class="py-2 hidden sm:table-cell">W</th><th class="py-2 hidden sm:table-cell">D</th><th class="py-2 hidden sm:table-cell">L</th>
          <th class="py-2">GD</th><th class="py-2 pr-3">PTS</th></tr></thead>
        <tbody>${g.standings.map(row).join('')}</tbody>
      </table>
    </section>`).join('');
})();
