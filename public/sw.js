// Service Worker for Push Notifications
const CACHE_NAME = 'dna-app-v4';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  // Skip precaching - we'll cache on-demand
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Parse URL safely and skip non-http(s) schemes
  let url;
  try {
    url = new URL(request.url);
  } catch (e) {
    return; // Invalid URL
  }

  // Skip caching for:
  // - Non-GET requests
  // - API routes
  // - Chrome extensions and other browser schemes
  // - Non-http(s) protocols
  if (
    request.method !== 'GET' ||
    url.protocol === 'chrome-extension:' ||
    url.protocol === 'chrome:' ||
    url.protocol === 'moz-extension:' ||
    url.protocol === 'safari-extension:' ||
    url.protocol === 'edge:' ||
    url.protocol === 'about:' ||
    url.protocol === 'data:' ||
    url.protocol === 'blob:' ||
    (!url.protocol.startsWith('http')) ||
    url.pathname.startsWith('/api/')
  ) {
    return; // Let browser handle these
  }

  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            // Cache in background (don't wait)
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              })
              .catch(() => {
                // Silently ignore cache errors
              });

            return response;
          });
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (request.destination === 'document') {
          return caches.match('/offline').catch(() => {
            // Return a simple offline HTML page
            return new Response(`
              <!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Offline</title>
                <style>
                  body {
                    font-family: system-ui, -apple-system, sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    margin: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-align: center;
                    padding: 20px;
                  }
                  .container {
                    max-width: 400px;
                  }
                  h1 {
                    font-size: 3rem;
                    margin: 0 0 1rem;
                  }
                  p {
                    font-size: 1.25rem;
                    opacity: 0.9;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>📡</h1>
                  <h1>You're Offline</h1>
                  <p>Please check your internet connection and try again.</p>
                </div>
              </body>
              </html>
            `, { 
              status: 503, 
              statusText: 'Service Unavailable',
              headers: new Headers({ 'Content-Type': 'text/html; charset=utf-8' })
            });
          });
        }
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  let data = {
    title: 'DNA App',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    tag: 'notification',
    requireInteraction: false,
    data: {
      url: '/',
    }
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    requireInteraction: data.requireInteraction,
    data: data.data,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'open',
        title: 'Open',
      },
      {
        action: 'close',
        title: 'Close',
      }
    ],
    sound: '/notification.mp3',
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync for sending messages when back online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

async function syncMessages() {
  // This would sync any pending messages
  console.log('Syncing messages...');
}
