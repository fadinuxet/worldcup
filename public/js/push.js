/* Web Push opt-in client. Exposes window.WCPush. */
window.WCPush = (function () {
  let publicKey = null;
  let reg = null;

  const supported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

  function urlB64ToUint8Array(b64) {
    const pad = '='.repeat((4 - (b64.length % 4)) % 4);
    const base64 = (b64 + pad).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
  }

  async function init() {
    if (!supported()) return { available: false, reason: 'unsupported' };
    try {
      const { publicKey: k } = await WC.fetchJSON('/api/push/key');
      if (!k) return { available: false, reason: 'server-disabled' };
      publicKey = k;
      reg = await navigator.serviceWorker.register('/sw.js');
      return { available: true };
    } catch (e) { return { available: false, reason: e.message }; }
  }

  async function currentSub() {
    if (!reg) reg = await navigator.serviceWorker.ready;
    return reg.pushManager.getSubscription();
  }

  async function status() {
    if (!supported() || !publicKey) return 'unavailable';
    const sub = await currentSub();
    if (Notification.permission === 'denied') return 'denied';
    return sub ? 'on' : 'off';
  }

  async function enable() {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return 'denied';
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8Array(publicKey),
    });
    await postSubscribe(sub);
    return 'on';
  }

  async function disable() {
    const sub = await currentSub();
    if (sub) {
      await fetch('/api/push/unsubscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }) });
      await sub.unsubscribe();
    }
    return 'off';
  }

  async function postSubscribe(sub) {
    await fetch('/api/push/subscribe', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub, teams: Follow.list() }),
    });
  }

  // keep the server's team list in sync when follows change (only if subscribed)
  async function syncTeams() {
    const sub = await currentSub();
    if (sub) await postSubscribe(sub);
  }

  return { supported, init, status, enable, disable, syncTeams };
})();
