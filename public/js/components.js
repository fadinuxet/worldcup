/* Shared renderers. Exposes window.Cmp. */
window.Cmp = (function () {
  function statusBadge(m) {
    if (m.status === 'in') {
      return `<span class="bg-primary-container text-on-primary-container font-label-data text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 bg-on-primary-container rounded-full live-pulse"></span>LIVE ${m.clock ? WC.esc(m.clock) : ''}</span>`;
    }
    if (m.status === 'post') {
      return `<span class="bg-surface-container-highest text-on-surface-variant font-label-data text-[11px] px-2.5 py-1 rounded-full">FT</span>`;
    }
    return `<span class="bg-surface-container-highest text-on-surface-variant font-label-data text-[11px] px-2.5 py-1 rounded-full">${WC.kickoffTime(m.date)}</span>`;
  }

  function side(team, align, showStar) {
    const star = showStar ? Follow.starButton(team, 'shrink-0') : '';
    const name = `<span class="font-body-md text-sm truncate min-w-0">${WC.esc(team.name)}</span>`;
    const flag = WC.flag(team, 'w-7 h-7 shrink-0');
    return align === 'right'
      ? `<div class="flex items-center gap-2 justify-end min-w-0">${star}${name}${flag}</div>`
      : `<div class="flex items-center gap-2 min-w-0">${flag}${name}${star}</div>`;
  }

  function center(m) {
    if (m.status === 'pre') return `<span class="font-label-match text-on-surface-variant text-xs px-2">VS</span>`;
    const h = m.home.score ?? '0', a = m.away.score ?? '0';
    return `<span class="font-label-match text-2xl md:text-3xl font-bold tabular-nums px-2 ${m.status === 'in' ? 'text-primary-fixed-dim' : 'text-on-surface'}">${WC.esc(h)}<span class="text-on-surface-variant mx-1">–</span>${WC.esc(a)}</span>`;
  }

  function matchCard(m) {
    const showStar = !m.isPlaceholder;
    return `<div class="match-card fade-in bg-surface-container rounded-xl border border-outline-variant/20 p-4 ${m.status === 'in' ? 'card-live' : ''}" data-match-id="${WC.esc(m.id)}">
      <div class="flex items-center justify-between mb-3">
        <span class="font-label-data text-[11px] text-on-surface-variant truncate pr-2">${WC.esc(m.stageLabel)}${m.venue ? ' · ' + WC.esc(m.venue) : ''}</span>
        ${statusBadge(m)}
      </div>
      <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        ${side(m.home, 'left', showStar)}
        ${center(m)}
        ${side(m.away, 'right', showStar)}
      </div>
    </div>`;
  }

  // Day-grouped list of match cards
  function matchList(matches) {
    if (!matches.length) return `<p class="text-on-surface-variant font-body-md py-8 text-center">No matches.</p>`;
    return WC.groupByDay(matches).map(({ day, matches }) => `
      <section class="mb-6">
        <h3 class="font-label-match text-xs tracking-widest text-on-surface-variant mb-3 sticky top-16 bg-surface-container-lowest/90 py-1 z-10">
          ${WC.esc(day)} <span class="text-outline">· ${matches.length}</span></h3>
        <div class="grid gap-3">${matches.map(matchCard).join('')}</div>
      </section>`).join('');
  }

  return { matchCard, matchList, statusBadge };
})();
