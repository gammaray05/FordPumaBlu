self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  const data = event.data.json();
  const title = data.title || 'Ford Puma Blu';
  const options = {
    body: data.body || 'Hai un nuovo messaggio.',
    icon: '/img/icon.png',
    badge: '/img/icon.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();

  event.waitUntil(
    clients.openWindow('https://fordpumablu.pages.dev')
  );
});
