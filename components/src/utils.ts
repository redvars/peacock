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
    // 1. Check if we are already fetching this URL
    if (inFlightRequests.has(url)) {
      // Return the existing promise instead of starting a new one
      return inFlightRequests.get(url)!;
    }

    // 2. Create the main logic as a promise
    const fetchPromise = (async () => {
      const request = new Request(url);

      // Check Cache first
      if (cache) {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return await cachedResponse.text();
        }
      }

      // Prepare network request
      const urlObj = new URL(request.url);
      const isSameOrigin = urlObj.origin === window.location.origin;

      const response = await fetch(request.url, {
        method: 'GET',
        mode: isSameOrigin ? 'no-cors' : 'cors',
        credentials: isSameOrigin ? 'same-origin' : 'omit',
      });

      // --- Handle 404 ---
      if (response.status === 404) {
        console.error(`[Fetch Error] Resource not found (404): ${url}`);
        return ''; // Return empty string as requested
      }

      const result = await response.text();

      // Update Cache if applicable
      if (cache && response.status === 200) {
        // We clone the response logic by creating a new Response with the text body
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

    // 3. Store the promise in the map
    inFlightRequests.set(url, fetchPromise);

    try {
      // 4. Wait for the result
      return await fetchPromise;
    } finally {
      // 5. Clean up: Remove the promise from the map when done
      // This ensures subsequent calls (after this one finishes) can start fresh
      inFlightRequests.delete(url);
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

function __hasMeaningfulContent(slotElement: any) {
  const nodes = slotElement.assignedNodes({ flatten: true });

  for (const node of nodes) {
    // If it's an element node, it has content
    if (node.nodeType === Node.ELEMENT_NODE) {
      return true;
    }
    // If it's a text node and contains non-whitespace characters, it has content
    if (
      node.nodeType === Node.TEXT_NODE &&
      node.textContent.trim().length > 0
    ) {
      return true;
    }
  }

  // No meaningful content found
  return false;
}

export function observerSlotChangesWithCallback(
  slot: HTMLSlotElement | null,
  callback: (hasContent: boolean) => void,
) {
  const observer = new MutationObserver(() => {
    callback(__hasMeaningfulContent(slot));
  });

  // Observe the elements currently assigned to the slot
  const assignedNodes = slot?.assignedNodes({ flatten: true }) || [];
  assignedNodes.forEach(node => {
    observer.observe(node, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
    });
  });

  callback(__hasMeaningfulContent(slot));
}
