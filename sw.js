// Service Worker for Mestre das Rochas
const CACHE_NAME = 'mestre-das-rochas-v1.0.0';
const STATIC_CACHE_NAME = 'mestre-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'mestre-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/index.html',
    '/src/styles.css',
    '/src/game.js',
    '/manifest.json',
    // External CDN resources
    'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/particles.js/2.0.0/particles.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js'
];

// Dynamic files that can be cached on demand
const DYNAMIC_FILES = [
    '/assets/',
    'https://fonts.gstatic.com/',
    'https://cdnjs.cloudflare.com/'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Static files cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Error caching static files', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated successfully');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle different types of requests
    if (STATIC_FILES.includes(request.url) || request.url.includes('index.html')) {
        // Static files - cache first strategy
        event.respondWith(cacheFirst(request));
    } else if (url.origin === location.origin) {
        // Same origin - network first for dynamic content
        event.respondWith(networkFirst(request));
    } else if (url.hostname.includes('fonts.googleapis.com') || 
               url.hostname.includes('cdnjs.cloudflare.com') ||
               url.hostname.includes('fonts.gstatic.com')) {
        // External resources - cache first with long expiry
        event.respondWith(cacheFirstWithFallback(request));
    } else {
        // Other external requests - network only
        event.respondWith(fetch(request));
    }
});

// Cache first strategy
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Cache first strategy failed:', error);
        return new Response('Offline - Content not available', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Network first strategy
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache:', error);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return caches.match('/index.html');
        }
        
        return new Response('Offline - Content not available', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Cache first with fallback for external resources
async function cacheFirstWithFallback(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            // Cache external resources for longer
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('External resource failed:', error);
        // For fonts and CSS, return a minimal fallback
        if (request.url.includes('.css')) {
            return new Response('/* Fallback CSS */', {
                headers: { 'Content-Type': 'text/css' }
            });
        }
        if (request.url.includes('.js')) {
            return new Response('// Fallback JS', {
                headers: { 'Content-Type': 'application/javascript' }
            });
        }
        return new Response('Resource not available offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Background sync for game state
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync-game-state') {
        event.waitUntil(syncGameState());
    }
});

async function syncGameState() {
    try {
        // Sync game state when back online
        console.log('Service Worker: Syncing game state...');
        
        // Get stored game state from IndexedDB
        const gameState = await getStoredGameState();
        if (gameState) {
            // Send to server or cloud storage
            await fetch('/api/sync-game-state', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gameState)
            });
        }
    } catch (error) {
        console.error('Service Worker: Failed to sync game state', error);
    }
}

// Placeholder for IndexedDB operations
async function getStoredGameState() {
    // Implementation would use IndexedDB to get stored game state
    return null;
}

// Push notifications (for future features)
self.addEventListener('push', (event) => {
    if (!event.data) return;
    
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/assets/icon-192x192.png',
        badge: '/assets/badge-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/'
        },
        actions: [
            {
                action: 'open',
                title: 'Abrir Jogo',
                icon: '/assets/action-open.png'
            },
            {
                action: 'close',
                title: 'Fechar',
                icon: '/assets/action-close.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow(event.notification.data.url || '/')
        );
    }
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
    
    if (event.data && event.data.type === 'CACHE_GAME_STATE') {
        // Cache game state for offline play
        cacheGameState(event.data.gameState);
    }
});

async function cacheGameState(gameState) {
    try {
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        const response = new Response(JSON.stringify(gameState), {
            headers: { 'Content-Type': 'application/json' }
        });
        await cache.put('/game-state', response);
        console.log('Service Worker: Game state cached');
    } catch (error) {
        console.error('Service Worker: Failed to cache game state', error);
    }
}

// Error handler
self.addEventListener('error', (event) => {
    console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker unhandled rejection:', event.reason);
});
