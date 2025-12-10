// Service Worker for Push Notifications ONLY - NO CACHING
const CACHE_NAME = 'dna-app-no-cache-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing - NO CACHING MODE');
  self.skipWaiting();
});

// Activate event - Clear ALL caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated - CLEARING ALL CACHES');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - NO CACHING AT ALL - Just pass through
self.addEventListener('fetch', (event) => {
  // Simply fetch from network, no caching whatsoever
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        // Return offline page for navigation requests only
        if (event.request.destination === 'document') {
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
        }
        // For other failed requests, reject
        return Promise.reject('fetch failed');
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
