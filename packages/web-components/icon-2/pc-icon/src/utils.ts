export async function createCacheFetch(name: string) {
  let cache: any;
  try {
    cache = await window.caches.open(name);
  } catch (e) {
    console.error('window.caches access not allowed');
  }
  return async (url: string) => {
    const request = new Request(url);
    let response: Response | null = null;
    if (cache) response = await cache.match(request);
    let result: string;
    if (response) {
      result = await response.text();
    }
    response = await fetch(request.url, {
      method: 'GET',
      mode:
        new URL(request.url).origin === window.location.origin
          ? 'no-cors'
          : 'cors',
      credentials:
        new URL(request.url).origin === window.location.origin
          ? 'same-origin'
          : 'omit',
    });
    result = await response.text();
    if (cache && response.status === 200) {
      await cache.put(request, new Response(result));
    }
    if (response.status === 404) {
      console.error(`Icon ${url} not found`);
      return '';
    }
    return result;
  };
}
