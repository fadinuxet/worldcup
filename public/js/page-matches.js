(async function () {
  UI.renderChrome();
  const list = document.getElementById('list');
  const filterBar = document.getElementById('filters');
  UI.loading(list);

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'in', label: 'Live' },
    { key: 'pre', label: 'Upcoming' },
    { key: 'post', label: 'Finished' },
    { key: 'group-stage', label: 'Groups', stage: true },
    { key: 'knockout', label: 'Knockouts', stage: true },
  ];
  let active = 'all';
  let matches = [];
  try { matches = await WC.getMatches(); } catch { list.innerHTML = '<p class="text-error">Could not load matches.</p>'; return; }

  function chip(f) {
    const on = active === f.key;
    return `<button data-filter="${f.key}" class="filter-chip whitespace-nowrap font-label-match text-xs tracking-widest px-4 py-2 rounded-xl border transition
      ${on ? 'bg-primary-container text-on-primary-container border-primary-container' : 'bg-surface-container text-on-surface-variant border-outline-variant/30 hover:text-on-surface'}">${f.label}</button>`;
  }
  function renderFilters() { filterBar.innerHTML = FILTERS.map(chip).join(''); }

  function apply() {
    let out = matches;
    if (active === 'in' || active === 'pre' || active === 'post') out = out.filter(m => m.status === active);
    else if (active === 'group-stage') out = out.filter(m => m.stage === 'group-stage');
    else if (active === 'knockout') out = out.filter(m => m.stage && m.stage !== 'group-stage');
    list.innerHTML = Cmp.matchList(out);
  }

  filterBar.addEventListener('click', e => {
    const b = e.target.closest('.filter-chip');
    if (!b) return;
    active = b.dataset.filter;
    renderFilters(); apply();
  });

  renderFilters();
  apply();
  Live.start();
})();
