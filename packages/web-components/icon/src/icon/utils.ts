export async function createCacheFetch(name: string) {
  let cache: any;
  try {
    cache = await window.caches.open(name);
  } catch (e) {
    console.warn('window.caches access not allowed');
  }
  return async function (url: string) {
    const request = new Request(url);
    let response: Response;
    if (cache) response = await cache.match(request);
    // @ts-ignore
    if (response) {
      return await response.text();
    }
    response = await fetch(request.url, {
      method: 'GET',
      mode:
        new URL(request.url).origin == window.location.origin
          ? 'no-cors'
          : 'cors',
      credentials:
        new URL(request.url).origin == window.location.origin
          ? 'same-origin'
          : 'omit',
    });
    const result: string = await response.text();
    if (cache && response.status === 200) {
      await cache.put(request, new Response(result));
    }
    return result;
  };
}
