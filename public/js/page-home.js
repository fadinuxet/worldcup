(async function () {
  UI.renderChrome();
  document.getElementById('tz').textContent = WC.tzAbbr();
  const feed = document.getElementById('feed');
  UI.loading(feed);

  let matches = [];
  try { matches = await WC.getMatches(); } catch { feed.innerHTML = '<p class="text-error">Could not load matches.</p>'; return; }

  function renderFeed() {
    const live = matches.filter(m => m.status === 'in');
    const upcoming = matches.filter(m => m.status === 'pre').slice(0, 6);
    const title = document.getElementById('feed-title');
    const show = live.length ? live : upcoming;
    title.textContent = live.length ? 'Live Now' : 'Upcoming';
    feed.innerHTML = show.map(Cmp.matchCard).join('') || '<p class="text-on-surface-variant">No upcoming matches.</p>';
  }
  renderFeed();

  // Following teaser
  function renderFollowing() {
    const ids = new Set(Follow.list());
    const teaser = document.getElementById('following-teaser');
    if (!ids.size) { teaser.hidden = true; return; }
    teaser.hidden = false;
    WC.getTeams().then(teams => {
      const mine = teams.filter(t => ids.has(t.id));
      document.getElementById('following-strip').innerHTML = mine.map(t =>
        `<a href="/my.html" class="flex items-center gap-2 bg-surface-container rounded-full pl-1 pr-3 py-1 border border-outline-variant/20">
           ${WC.flag(t, 'w-6 h-6')}<span class="font-label-match text-xs">${WC.esc(t.abbr)}</span></a>`).join('');
    });
  }
  renderFollowing();
  Follow.onChange(renderFollowing);

  Live.start();
})();
