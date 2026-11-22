
const CACHE_NAME = "absensi-long-potato-v1";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json"
];

// Install
self.addEventListener("install", event => {

    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});

// Activate
self.addEventListener("activate", event => {

    event.waitUntil(
        caches.keys().then(keys => {

            return Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );

        })
    );

    self.clients.claim();
});

// Fetch
self.addEventListener("fetch", event => {

    const request = event.request;

    // Hanya cache halaman aplikasi sendiri.
    // Jangan cache Google Apps Script atau request absensi.

    if (
        request.method !== "GET" ||
        new URL(request.url).origin !== self.location.origin
    ) {
        return;
    }

    event.respondWith(

        fetch(request)
            .then(response => {

                if (response.ok) {

                    const copy = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(request, copy));
                }

                return response;
            })

            .catch(() => caches.match(request))
    );
});
