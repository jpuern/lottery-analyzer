const CACHE_NAME = 'loterias-pro-v1';

// Arquivos para cache (funciona offline)
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/src/css/main.css',
    '/src/js/main.js',
    '/src/assets/icons/icon-192x192.png',
    '/src/assets/icons/icon-512x512.png',
    '/manifest.json'
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
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('🗑️ Service Worker: Limpando cache antigo');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    
    return self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
    // Ignorar requisições de API (sempre buscar online)
    if (event.request.url.includes('/api/') || 
        event.request.url.includes('loteriascaixa-api')) {
        return event.respondWith(fetch(event.request));
    }
    
    // Estratégia: Cache First, Network Fallback
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Cachear novos recursos
                        if (networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseClone);
                                });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // Fallback para página offline
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});
