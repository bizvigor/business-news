addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  return new Response("Service Worker Status: OPERATIONAL", {
    status: 200,
    headers: { "Content-Type": "text/plain" }
  });
}
