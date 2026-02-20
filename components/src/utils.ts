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
          return cachedResponse.text();
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

export function throttle(
  func: Function,
  delay: number,
  options = { leading: true, trailing: true },
) {
  let timerId: any;
  let lastExec = 0;

  return function (...args: any[]) {
    // @ts-ignore
    const context = this;
    const now = Date.now();

    const shouldCallNow = options.leading && now - lastExec >= delay;

    if (shouldCallNow) {
      func.apply(context, args);
      lastExec = now;
    } else if (options.trailing && !timerId) {
      timerId = setTimeout(() => {
        func.apply(context, args);
        lastExec = Date.now();
        timerId = null;
      }, delay);
    }
  };
}

/**
 * Dispatches a click event to the given element that triggers a native action,
 * but is not composed and therefore is not seen outside the element.
 *
 * This is useful for responding to an external click event on the host element
 * that should trigger an internal action like a button click.
 *
 * Note, a helper is provided because setting this up correctly is a bit tricky.
 * In particular, calling `click` on an element creates a composed event, which
 * is not desirable, and a manually dispatched event must specifically be a
 * `MouseEvent` to trigger a native action.
 *
 * @example
 * hostClickListener = (event: MouseEvent) {
 *   if (isActivationClick(event)) {
 *     this.dispatchActivationClick(this.buttonElement);
 *   }
 * }
 *
 */
export function dispatchActivationClick(element: HTMLElement) {
  const event = new MouseEvent('click', { bubbles: true });
  element.dispatchEvent(event);
  return event;
}

// Ignore events for one microtask only.
let isSquelchingEvents = false;
async function __squelchEventsForMicrotask() {
  isSquelchingEvents = true;
  // Need to pause for just one microtask.
  // tslint:disable-next-line
  await null;
  isSquelchingEvents = false;
}

// TODO(https://bugzilla.mozilla.org/show_bug.cgi?id=1804576)
//  Remove when Firefox bug is addressed.
function __squelchEvent(event: Event) {
  const squelched = isSquelchingEvents;
  if (squelched) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
  __squelchEventsForMicrotask();
  return squelched;
}

/**
 * Returns true if the click event should trigger an activation behavior. The
 * behavior is defined by the element and is whatever it should do when
 * clicked.
 *
 * Typically when an element needs to handle a click, the click is generated
 * from within the element and an event listener within the element implements
 * the needed behavior; however, it's possible to fire a click directly
 * at the element that the element should handle. This method helps
 * distinguish these "external" clicks.
 *
 * An "external" click can be triggered in a number of ways: via a click
 * on an associated label for a form  associated element, calling
 * `element.click()`, or calling
 * `element.dispatchEvent(new MouseEvent('click', ...))`.
 *
 * Also works around Firefox issue
 * https://bugzilla.mozilla.org/show_bug.cgi?id=1804576 by squelching
 * events for a microtask after called.
 *
 * @example
 * hostClickListener = (event: MouseEvent) {
 *   if (isActivationClick(event)) {
 *     this.dispatchActivationClick(this.buttonElement);
 *   }
 * }
 *
 */
export function isActivationClick(event: Event) {
  // Event must start at the event target.
  if (event.currentTarget !== event.target) {
    return false;
  }
  // Event must not be retargeted from shadowRoot.
  if (event.composedPath()[0] !== event.target) {
    return false;
  }
  // Target must not be disabled; this should only occur for a synthetically
  // dispatched click.
  if ((event.target as EventTarget & { disabled: boolean }).disabled) {
    return false;
  }
  // This is an activation if the event should not be squelched.
  return !__squelchEvent(event);
}

/**
 * Re-dispatches an event from the provided element.
 *
 * This function is useful for forwarding non-composed events, such as `change`
 * events.
 *
 * @example
 * class MyInput extends LitElement {
 *   render() {
 *     return html`<input @change=${this.redispatchEvent}>`;
 *   }
 *
 *   protected redispatchEvent(event: Event) {
 *     redispatchEvent(this, event);
 *   }
 * }
 *
 * @param element The element to dispatch the event from.
 * @param event The event to re-dispatch.
 * @return Whether or not the event was dispatched (if cancelable).
 */
export function redispatchEvent(element: Element, event: Event) {
  // For bubbling events in SSR light DOM (or composed), stop their propagation
  // and dispatch the copy.
  if (event.bubbles && (!element.shadowRoot || event.composed)) {
    event.stopPropagation();
  }

  const copy = Reflect.construct(event.constructor, [event.type, event]);
  const dispatched = element.dispatchEvent(copy);
  if (!dispatched) {
    event.preventDefault();
  }

  return dispatched;
}
