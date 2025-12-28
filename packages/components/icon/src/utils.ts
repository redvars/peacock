export async function createCacheFetch(
  name: string,
  defaults?: { forceRefresh?: boolean },
) {
  const defaultForce = defaults?.forceRefresh ?? false;
  let cachePromise: Promise<Cache | null> | null = null;

  if ('caches' in window) {
    try {
      cachePromise = window.caches.open(name).catch(() => null);
    } catch {
      cachePromise = Promise.resolve(null);
    }
  } else {
    cachePromise = Promise.resolve(null);
  }

  return async (url: string, opts?: { forceRefresh?: boolean }) => {
    const force = opts?.forceRefresh ?? defaultForce;
    const resolvedUrl = new URL(url, window.location.href).href;
    const sameOrigin = new URL(resolvedUrl).origin === window.location.origin;
    const request = new Request(resolvedUrl, {
      method: 'GET',
      mode: sameOrigin ? 'same-origin' : 'cors',
      credentials: sameOrigin ? 'same-origin' : 'omit',
    });

    const cache = cachePromise ? await cachePromise : null;

    // Return cached value if present and not forcing refresh
    if (!force && cache) {
      try {
        const cached = await cache.match(request);
        if (cached) return await cached.text();
      } catch {
        // ignore cache read errors and continue to fetch
      }
    }

    // Fetch from network and update cache if possible
    try {
      const response = await fetch(request);
      if (!response.ok) {
        if (response.status === 404) {
          console.error(`Icon ${url} not found`);
          return '';
        }
        // On non-ok response, try to return cached result if available
        if (cache) {
          const cached = await cache.match(request);
          if (cached) return await cached.text();
        }
        throw new Error(
          `Fetch failed: ${response.status} ${response.statusText}`,
        );
      }

      const text = await response.text();

      if (cache && response.status === 200) {
        // Preserve response headers (e.g. content-type) when storing
        const headers = new Headers();
        response.headers.forEach((v, k) => headers.set(k, v));
        try {
          await cache.put(
            request,
            new Response(text, { status: 200, headers }),
          );
        } catch {
          // ignore cache put failures
        }
      }

      return text;
    } catch (err) {
      console.error('Fetch error', err);
      // On fetch error, fallback to cache if available
      if (cache) {
        try {
          const cached = await cache.match(request);
          if (cached) return await cached.text();
        } catch {
          // ignore cache read errors
        }
      }
      return '';
    }
  };
}

// Basic sanitization: remove <script>, <foreignObject>, event handler attributes (on*), and iframes
export function sanitizeSvg(rawSvg: string) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawSvg, 'image/svg+xml');

    // remove script tags
    const scripts = Array.from(doc.querySelectorAll('script'));
    scripts.forEach(n => n.remove());

    // remove foreignObject and iframe-like elements
    const foreigns = Array.from(doc.querySelectorAll('foreignObject, iframe'));
    foreigns.forEach(n => n.remove());

    // remove event handler attributes like onload, onclick, etc.
    const all = Array.from(doc.querySelectorAll('*'));
    all.forEach(el => {
      const attrs = Array.from(el.attributes).filter(a => /^on/i.test(a.name));
      attrs.forEach(a => el.removeAttribute(a.name));
    });

    const el = doc.documentElement;
    if (!el) return '';

    // serialize back to string
    const serializer = new XMLSerializer();
    return serializer.serializeToString(el);
  } catch (e) {
    // parsing failed; fall back to empty content to avoid injecting unsafe content
    return '';
  }
}
