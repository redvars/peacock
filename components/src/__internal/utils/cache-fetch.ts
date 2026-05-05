export async function createCacheFetch(name: string) {
  let cache: Cache | null = null;
  // This map tracks requests currently being processed
  const inFlightRequests = new Map<string, Promise<string>>();

  try {
    cache = await window.caches.open(name);
  } catch (e) {
    console.warn('window.caches access not allowed');
  }

  return async (url: string): Promise<string> => {
    if (inFlightRequests.has(url)) {
      return inFlightRequests.get(url)!;
    }

    const fetchPromise = (async () => {
      const request = new Request(url);

      if (cache) {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse.text();
        }
      }

      const urlObj = new URL(request.url);
      const isSameOrigin = urlObj.origin === window.location.origin;

      const response = await fetch(request.url, {
        method: 'GET',
        mode: isSameOrigin ? 'no-cors' : 'cors',
        credentials: isSameOrigin ? 'same-origin' : 'omit',
      });

      if (response.status === 404) {
        console.error(`[Fetch Error] Resource not found (404): ${url}`);
        return '';
      }

      const result = await response.text();

      if (cache && response.status === 200) {
        await cache.put(
          request,
          new Response(result, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          }),
        );
      }

      return result;
    })();

    inFlightRequests.set(url, fetchPromise);

    try {
      return await fetchPromise;
    } finally {
      inFlightRequests.delete(url);
    }
  };
}