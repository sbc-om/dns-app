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
                :root {
                  color-scheme: light dark;
                  --bg: #f5f5f5;
                  --card: #ffffff;
                  --text: #171717;
                  --muted: #525252;
                  --border: #e5e5e5;
                  --shadow: rgba(0, 0, 0, 0.06);
                }
                @media (prefers-color-scheme: dark) {
                  :root {
                    --bg: #000000;
                    --card: #1a1a1a;
                    --text: #ffffff;
                    --muted: #a3a3a3;
                    --border: #0a0a0a;
                    --shadow: rgba(0, 0, 0, 0.35);
                  }
                }
                * { box-sizing: border-box; }
                body {
                  font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  margin: 0;
                  background: var(--bg);
                  color: var(--text);
                  text-align: center;
                  padding: 24px;
                }
                .container {
                  width: 100%;
                  max-width: 420px;
                }
                .card {
                  background: var(--card);
                  border: 2px solid var(--border);
                  border-radius: 16px;
                  padding: 24px;
                  box-shadow: 0 20px 40px var(--shadow);
                }
                .icon {
                  width: 56px;
                  height: 56px;
                  border-radius: 14px;
                  display: grid;
                  place-items: center;
                  margin: 0 auto 12px;
                  border: 2px solid var(--border);
                  background: rgba(0, 0, 0, 0.04);
                }
                @media (prefers-color-scheme: dark) {
                  .icon { background: rgba(255, 255, 255, 0.06); }
                }
                h1 {
                  font-size: 1.5rem;
                  margin: 0 0 8px;
                  letter-spacing: -0.02em;
                }
                p {
                  margin: 0;
                  font-size: 1rem;
                  color: var(--muted);
                  line-height: 1.5;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="card">
                  <div class="icon" aria-hidden="true">📡</div>
                  <h1>You're Offline</h1>
                  <p>Please check your internet connection and try again.</p>
                </div>
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
