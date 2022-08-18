self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open("svg-cache")
    )
})
async function fetchSVG(request) {
    if (request.url.endsWith('svg')) {
        const cachedSVG = await caches.match(request)
        if (cachedSVG) {
            return cachedSVG
        } else {
            const svg = await fetch(request)
            const cache = await caches.open("svg-cache")
            cache.put(request, svg.clone())
            return svg
        }
    } else {
        return fetch(request)
    }
}
self.addEventListener("fetch", async (event) => {
    event.respondWith(fetchSVG(event.request))
})