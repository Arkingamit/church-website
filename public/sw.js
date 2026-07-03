// Service Worker for Grace Connect push notifications
// This file runs in the browser background and handles push events.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Map notification types to URL paths for click navigation
const TYPE_TO_PATH = {
  new_event: '/events',
  new_announcement: '/notifications',
  new_note: '/broadcasts',
  new_prayer: '/prayer-wall',
  new_sermon: '/#sermons',
  new_worship_video: '/#worship-videos',
  recurring_announcement: '/notifications',
  event_reminder: '/events',
  system: '/notifications',
};

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: 'Grace Connect', body: event.data.text() };
  }

  const title = data.title || 'Grace Connect';
  const options = {
    body: data.body || data.message || '',
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [200, 100, 200],
    tag: data.tag || `gc-${Date.now()}`,
    renotify: true,
    data: {
      url: data.url || TYPE_TO_PATH[data.type] || '/',
      type: data.type || 'system',
    },
    actions: [
      { action: 'open', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      // Otherwise open a new window
      return self.clients.openWindow(targetUrl);
    })
  );
});
