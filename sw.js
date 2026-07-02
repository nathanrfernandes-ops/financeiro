const CACHE_NAME = 'financeiro-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
];

// Instala e faz cache dos arquivos essenciais
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Remove caches antigos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estratégia: Network first, fallback para cache
// Para a API do Google Sheets → sempre tenta a rede
// Para os arquivos do app → cache primeiro
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Requisições para a API do Google → sempre rede
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('google.com')) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({ error: 'Sem conexão. Verifique sua internet.' }),
          { headers: { 'Content-Type': 'application/json' } })
      )
    );
    return;
  }

  // Arquivos do app → cache first, atualiza em background
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(resp => {
        if (resp.ok) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return resp;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
