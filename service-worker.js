/* Service worker "red primero": siempre intenta traer la versión más reciente
   y solo usa la copia guardada cuando no hay internet. Al activarse borra
   todas las cachés anteriores. */
const CACHE = "asistencia5e-20261014-5";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || !req.url.startsWith(self.location.origin)) return;
  event.respondWith((async () => {
    try {
      const fresh = await fetch(req, { cache: "no-store" });
      const copy = fresh.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return fresh;
    } catch (e) {
      const cached = await caches.match(req);
      if (cached) return cached;
      throw e;
    }
  })());
});
