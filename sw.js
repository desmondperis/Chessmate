const C='gambit-v3';
const CORE=['./','./index.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.hostname.includes('jsdelivr.net')){
    e.respondWith(caches.open(C).then(async c=>{const hit=await c.match(e.request);if(hit)return hit;try{const r=await fetch(e.request);c.put(e.request,r.clone());return r;}catch(err){return hit||Response.error();}}));
    return;
  }
  if(u.origin===location.origin){
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>caches.open(C).then(c=>{c.put(e.request,res.clone());return res;})).catch(()=>caches.match('./index.html'))));
  }
});