// Service Worker — Asistencia 5.° "E"
const CACHE_VERSION = "v4";
const CACHE_NAME = "asistencia5e-" + CACHE_VERSION;

const CORE_ASSETS = [
  "./",
  "./ASISTENCIA_5E_v2.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./favicon-32.png"
];

const EXTERNAL_ASSETS = [
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(CORE_ASSETS);
      await Promise.all(
        EXTERNAL_ASSETS.map((url) =>
          fetch(url, { mode: "no-cors" }).then((res) => cache.put(url, res)).catch(() => {})
        )
      );
      self.skipWaiting();
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone)).catch(() => {});
          return res;
        })
        .catch(() => {
          if (req.mode === "navigate") return caches.match("./ASISTENCIA_5E_v2.html");
        });
    })
  );
});
