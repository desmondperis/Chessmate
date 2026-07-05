const C='chessmate-v8';
const CORE=['./','./index.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  // Stockfish engine from CDN: cache-first (files are versioned + immutable)
  if(u.hostname.includes('jsdelivr.net')){
    e.respondWith(caches.open(C).then(async c=>{const hit=await c.match(e.request);if(hit)return hit;try{const r=await fetch(e.request);c.put(e.request,r.clone());return r;}catch(err){return hit||Response.error();}}));
    return;
  }
  // App shell (index.html + navigations): NETWORK-FIRST so new deploys appear immediately;
  // fall back to the cached copy only when offline.
  if(u.origin===location.origin){
    e.respondWith((async()=>{
      try{
        const r=await fetch(e.request);
        const c=await caches.open(C); c.put(e.request,r.clone());
        return r;
      }catch(err){
        const cached=await caches.match(e.request);
        return cached||caches.match('./index.html');
      }
    })());
  }
});