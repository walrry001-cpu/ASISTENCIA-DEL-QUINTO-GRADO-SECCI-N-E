/* Service worker — Evaluador Formativo, versión 20261019b.
   Al activarse borra TODOS los cachés anteriores. Estrategia "red primero":
   si hay internet siempre carga la versión más nueva; sin internet usa lo guardado.
   Los datos del docente (exámenes, registro) están en localStorage y NO se tocan. */
const CACHE = 'evaluador-formativo-20261019b';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const ks = await caches.keys();
    await Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith((async () => {
    try {
      const res = await fetch(e.request, { cache: 'no-store' });
      if (res && (res.ok || res.type === 'opaque')) {
        const c = await caches.open(CACHE);
        c.put(e.request, res.clone()).catch(() => {});
      }
      return res;
    } catch (err) {
      const hit = await caches.match(e.request, { ignoreSearch: true });
      if (hit) return hit;
      if (e.request.mode === 'navigate') {
        const home = (await caches.match('./index.html')) || (await caches.match('./'));
        if (home) return home;
      }
      throw err;
    }
  })());
});
