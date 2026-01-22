const CACHE_NAME = 'conexao-cachu-v10-FINAL'; // Versão nova
const ASSETS_CRITICOS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png'
  // Tirei o resto. Se o resto falhar, o site carrega igual pela rede.
];

// 1. INSTALAÇÃO (Garantida)
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Força assumir o controle AGORA
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('🔵 SW v10: Instalando versão leve...');
      return cache.addAll(ASSETS_CRITICOS);
    })
  );
});

// 2. ATIVAÇÃO (O Grande Expurgo)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          // Apaga QUALQUER cache que não seja o v10 atual
          if (key !== CACHE_NAME) {
            console.log('🧹 SW: Deletando cache velho:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim(); // Controla as abas abertas imediatamente
});

// 3. INTERCEPTAÇÃO (Estratégia: Network First para HTML)
self.addEventListener('fetch', (event) => {
  // Se não for GET ou for API, ignora
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/rides')) return;
  if (event.request.url.includes('/partners')) return;

  const isHTML = event.request.headers.get('accept').includes('text/html');

  event.respondWith(
    // Tenta a REDE primeiro para tudo que é página
    fetch(event.request)
      .then((networkResponse) => {
        // Se deu certo, clona e atualiza o cache (para o futuro)
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Se a rede falhar (offline), aí sim usa o cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          // Se não tiver nada no cache, retorna a home (fallback)
          if (isHTML) return caches.match('/');
        });
      })
  );
});