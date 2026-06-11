/* Shared chrome: top nav + mobile bottom tab bar + toast. Exposes window.UI. */
window.UI = (function () {
  const NAV = [
    { href: '/', label: 'Home', icon: 'home' },
    { href: '/today.html', label: 'Today', icon: 'today' },
    { href: '/matches.html', label: 'Matches', icon: 'sports_soccer' },
    { href: '/groups.html', label: 'Groups', icon: 'leaderboard' },
    { href: '/teams.html', label: 'Teams', icon: 'flag' },
    { href: '/my.html', label: 'My World Cup', icon: 'star' },
  ];
  const here = location.pathname.replace(/index\.html$/, '/') || '/';
  const isActive = href => (href === '/' ? here === '/' : here.startsWith(href));

  function renderChrome() {
    const top = document.getElementById('top-nav');
    if (top) {
      top.innerHTML = `
      <header class="glass-panel bg-surface/80 fixed top-0 inset-x-0 z-50 border-b border-outline-variant/20
                     flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop">
        <div class="flex items-center gap-8">
          <a href="/" class="font-headline-md text-headline-md font-black tracking-tighter text-primary-fixed-dim">WC<span class="text-on-surface">26</span></a>
          <nav class="hidden md:flex gap-6 items-center">
            ${NAV.map(n => `<a href="${n.href}" class="font-label-match text-[14px] tracking-widest ${isActive(n.href) ? 'text-primary-fixed-dim font-bold' : 'text-on-surface-variant hover:text-secondary-container'} transition-colors">${n.label}</a>`).join('')}
          </nav>
        </div>
        <a href="/my.html" class="flex items-center gap-2 text-on-surface-variant hover:text-primary-fixed-dim transition-colors">
          <span class="material-symbols-outlined">account_circle</span>
        </a>
      </header>`;
    }
    // mobile bottom bar
    const bar = document.createElement('nav');
    bar.className = 'md:hidden glass-panel bg-surface/90 fixed bottom-0 inset-x-0 z-50 border-t border-outline-variant/20 grid grid-cols-6 h-16';
    bar.innerHTML = NAV.map(n => `
      <a href="${n.href}" class="flex flex-col items-center justify-center gap-0.5 ${isActive(n.href) ? 'text-primary-fixed-dim' : 'text-on-surface-variant'}">
        <span class="material-symbols-outlined text-[22px]">${n.icon}</span>
        <span class="font-label-data text-[10px] leading-none">${n.label.split(' ')[0]}</span>
      </a>`).join('');
    document.body.appendChild(bar);
  }

  let toastTimer;
  function toast(msg) {
    let el = document.getElementById('wc-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'wc-toast';
      el.className = 'fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-primary-container text-on-primary-container font-label-match text-[13px] px-4 py-2 rounded-xl shadow-lg';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.style.opacity = '0'; }, 2200);
  }

  function loading(target) {
    target.innerHTML = `<div class="flex items-center gap-3 text-on-surface-variant font-label-data py-16 justify-center">
      <span class="material-symbols-outlined animate-spin">progress_activity</span> Loading World Cup data…</div>`;
  }

  return { renderChrome, toast, loading, NAV };
})();
