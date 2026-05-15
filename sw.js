const CACHE_NAME = "v3";
const cache_assets = [
    "/",
];

self.addEventListener("install", event => {
    event.waitUntil(
        fetch("/resources_manifest.json")
            .then(response => response.json())
            .then(manifestFiles => {
                const all_assets = cache_assets.concat(manifestFiles);
                return caches.open(CACHE_NAME).then(cache => cache.addAll(all_assets));
            }).catch(error => {
                console.log("No manifest found, caching only core assets:", error);
                return caches.open(CACHE_NAME).then(cache => cache.addAll(cache_assets));
            })
    );
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(caches.keys().then(cacheNames => {
        return Promise.all(cacheNames.map(cacheName => {
            if (cacheWhitelist.indexOf(cacheName) === -1) return caches.delete(cacheName);
        }));
    }));
    self.clients.claim();
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request, { ignoreSearch: true }).then(response => {
            if (response) return response;
            return fetch(event.request).then(networkResponse => {
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });
                return networkResponse;
            });
        }).catch(() => {
            console.log("Offline and no cache");
        })
    );
});