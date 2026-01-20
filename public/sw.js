// 🔥 SEMPRE QUE ATUALIZAR O APP, MUDE ESTE NÚMERO AQUI!
const CACHE_NAME = "conexao-cachu=v1.0"; // Ou v2.7 - <--- MUDAR ISSO AQUI SEMPRE QUE MUDAR OS ARQUIVOS

const ASSETS = [
  "/",
  "/index.html",
  "/form.html",
  "/ajuda.html",
  "/termos.html",
  "/app.js",  // O navegador vai pegar a versão nova se você mudou no HTML
  "/form.js",
  "/carona.js",
  "/manifest.json",
  "/favicon.ico",
  "/img/conexao-cachu.png",
  "/img/conexao-cachu-192-pwa.png",
  "/img/conexao-cachu-512-pwa.png"
];

// 1. Instalação: Cacheia tudo e assume o controle IMEDIATO
self.addEventListener("install", (e) => {
  // Força o SW novo a entrar em ação sem esperar o antigo desligar
  self.skipWaiting();

  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// 2. Ativação: Limpa os caches velhos (Faxina)
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          // Se o cache não for o "v2.5" atual, apaga ele!
          if (key !== CACHE_NAME) {
            console.log('🧹 Limpando cache antigo:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  // Garante que o SW controle todas as abas abertas imediatamente
  self.clients.claim();
});

// 3. Interceptar Requisições (Network First para API, Stale-While-Revalidate para o resto)
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // APIs: Sempre tenta a rede primeiro
  if (url.pathname.startsWith("/rides") || url.pathname.startsWith("/partners")) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // Arquivos: Tenta cache, mas atualiza em segundo plano (Stale-While-Revalidate)
  // Isso garante velocidade E atualização na próxima visita
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      const networkFetch = fetch(e.request).then((response) => {
        // Atualiza o cache com a versão nova da rede
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, response.clone());
        });
        return response;
      });

      // Retorna o cache se tiver, senão espera a rede
      return cachedResponse || networkFetch;
    })
  );
});