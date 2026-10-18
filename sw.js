// Altere a versão a cada deploy que mude arquivos estáticos
const CACHE_NAME = 'loterias-pro-v3';

// Arquivos para cache (funciona offline)
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/src/css/main.css',
    '/src/js/app.js',
    '/src/assets/icon-192x192.png',
    '/src/assets/icon-512x512.png'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
    console.log('📦 Service Worker: Instalando...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Service Worker: Cacheando arquivos');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker: Ativado');

    // Limpar caches antigos
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => Promise.all(
                cacheNames
                    .filter((cache) => cache !== CACHE_NAME)
                    .map((cache) => {
                        console.log('🗑️ Service Worker: Limpando cache antigo');
                        return caches.delete(cache);
                    })
            ))
            .then(() => self.clients.claim())
    );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Ignorar requisições de API e de outros domínios (sempre buscar online)
    if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
        return;
    }

    // Estratégia: Network First, Cache Fallback
    // Assim os usuários sempre recebem a versão mais nova quando estão online
    event.respondWith(
        fetch(request)
            .then((networkResponse) => {
                if (networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => cache.put(request, responseClone));
                }
                return networkResponse;
            })
            .catch(() => caches.match(request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // Fallback para página offline
                    if (request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }
                    return Response.error();
                }))
    );
});
