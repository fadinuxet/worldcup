/* Live score auto-refresh: poll /api/live every 25s (only while tab visible),
   patch any on-page match cards in place. Exposes window.Live. */
window.Live = (function () {
  let timer = null;
  const INTERVAL = 25000;

  async function tick() {
    if (document.visibilityState !== 'visible') return;
    let live;
    try { live = await WC.getLive(); } catch { return; }
    for (const m of live) {
      const el = document.querySelector(`[data-match-id="${CSS.escape(m.id)}"]`);
      if (el) el.outerHTML = Cmp.matchCard(m);
    }
    // surface a tiny "LIVE now" hint if a live ticker target exists
    const banner = document.getElementById('live-count');
    if (banner) banner.textContent = live.length ? `${live.length} live now` : '';
  }

  function start() {
    if (timer) return;
    tick();
    timer = setInterval(tick, INTERVAL);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') tick(); });
  }

  return { start, tick };
})();
