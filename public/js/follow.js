/* Follow state — per-browser via localStorage. Exposes window.Follow. */
window.Follow = (function () {
  const KEY = 'wc26.follows';
  const listeners = new Set();

  function get() {
    try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]').map(String)); }
    catch { return new Set(); }
  }
  function save(set) {
    localStorage.setItem(KEY, JSON.stringify([...set]));
    listeners.forEach(fn => { try { fn([...set]); } catch (e) {} });
  }
  const has = id => get().has(String(id));
  const list = () => [...get()];
  function toggle(id) {
    const set = get();
    id = String(id);
    set.has(id) ? set.delete(id) : set.add(id);
    save(set);
    return set.has(id);
  }
  function clear() { save(new Set()); }
  const onChange = fn => { listeners.add(fn); return () => listeners.delete(fn); };

  // A ⭐ toggle button for a team
  function starButton(team, extra = '') {
    const on = has(team.id);
    return `<button class="follow-star material-symbols-outlined text-[20px] ${on ? 'star-on' : 'star-off'} ${extra}"
              data-team-id="${WC.esc(team.id)}" title="${on ? 'Following' : 'Follow'}"
              aria-pressed="${on}">${on ? 'star' : 'star_border'}</button>`;
  }

  // Delegate clicks on any .follow-star; re-render handled by listeners
  document.addEventListener('click', e => {
    const btn = e.target.closest('.follow-star');
    if (!btn) return;
    e.preventDefault();
    const nowOn = toggle(btn.dataset.teamId);
    btn.classList.toggle('star-on', nowOn);
    btn.classList.toggle('star-off', !nowOn);
    btn.textContent = nowOn ? 'star' : 'star_border';
    btn.setAttribute('aria-pressed', String(nowOn));
  });

  return { has, list, toggle, clear, onChange, starButton };
})();
