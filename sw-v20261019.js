/* Service worker de limpieza (reemplaza al de la versión anterior).
   Borra todos los cachés, se desregistra y recarga la página para que cargue el index.html nuevo.
   No toca localStorage (exámenes, registro, asistencia). */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const ks = await caches.keys();
    await Promise.all(ks.map(k => caches.delete(k)));
    await self.registration.unregister();
    const cs = await self.clients.matchAll({ type: 'window' });
    cs.forEach(c => { try { c.navigate(c.url); } catch (e) {} });
  })());
});
self.addEventListener('fetch', () => {}); // sin caché: todo va a la red
