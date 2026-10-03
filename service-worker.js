// ============================================================
// Service Worker（純靜態、無後端、無第三方 API）
// ============================================================

const CACHE_NAME = 'timetable-demo-v5.5.0';

const PRECACHE = [
    './',
    './index.html',
    './manifest.json',
    './data/demo-data.js',
    './styles/main.css',
    './styles/icons.css',
    './styles/themes/dark.css',
    './styles/themes/light.css',
    './styles/components/cards.css',
    './styles/components/buttons.css',
    './styles/components/animations.css',
    './styles/pages/menu.css',
    './styles/pages/schedule.css',
    './styles/pages/realtime.css',
    './styles/pages/settings.css',
    './scripts/utils/storage.js',
    './scripts/utils/icons.js',
    './scripts/utils/db.js',
    './scripts/config/app-config.js',
    './scripts/modules/theme/theme.js',
    './scripts/modules/theme/theme.css',
    './scripts/modules/weekly/weekly.js',
    './scripts/modules/weekly/weekly.css',
    './scripts/modules/holidays/holidays.js',
    './scripts/modules/holidays/holidays.css',
    './scripts/modules/animations/animations.js',
    './scripts/modules/expand/expand.js',
    './scripts/modules/expand/expand.css',
    './scripts/modules/calendar/calendar.js',
    './scripts/modules/calendar/calendar.css',
    './scripts/modules/search/search.css',
    './scripts/modules/profile/profile-content.js',
    './scripts/modules/profile/profile.js',
    './scripts/modules/profile/profile.css',
    './scripts/modules/auth/auth-mock.js',
    './scripts/modules/auth/auth.css',
    './scripts/modules/overtime/overtime.js',
    './scripts/modules/overtime/overtime.css',
    './scripts/modules/liquidglass/liquidglass.js',
    './scripts/modules/liquidglass/liquidglass.css',
    './scripts/main.js',
    './assets/images/app-logo.svg',
    './assets/images/developers/ray-cheung.webp',
    './assets/images/developers/chan-hong-tang.webp',
    './assets/icons/icon-192.png',
    './assets/icons/icon-512.png',
    './assets/icons/icon-maskable-512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== location.origin) return;

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
                    return response;
                })
                .catch(() => caches.match('./index.html', { ignoreSearch: true }))
        );
        return;
    }

    event.respondWith(
        caches.match(request, { ignoreSearch: true }).then(cached => cached || fetch(request).then(response => {
            if (response && response.ok) {
                const copy = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
            }
            return response;
        }))
    );
});
