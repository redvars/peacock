import { e } from './directive-ZPhl09Yt.js';
import { e as e$1 } from './unsafe-html-Ct0N2_UU.js';

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class t extends e$1{}t.directiveName="unsafeSVG",t.resultType=2;const o=e(t);

// Basic sanitization: remove <script>, <foreignObject>, event handler attributes (on*), and iframes
function sanitizeSvg(rawSvg) {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(rawSvg, 'image/svg+xml');
        const scripts = Array.from(doc.querySelectorAll('script'));
        scripts.forEach(n => n.remove());
        const foreigns = Array.from(doc.querySelectorAll('foreignObject, iframe'));
        foreigns.forEach(n => n.remove());
        const all = Array.from(doc.querySelectorAll('*'));
        all.forEach(el => {
            const attrs = Array.from(el.attributes).filter(a => /^on/i.test(a.name));
            attrs.forEach(a => el.removeAttribute(a.name));
        });
        const el = doc.documentElement;
        if (!el)
            return '';
        const serializer = new XMLSerializer();
        return serializer.serializeToString(el);
    }
    catch (e) {
        return '';
    }
}

async function createCacheFetch(name) {
    let cache = null;
    // This map tracks requests currently being processed
    const inFlightRequests = new Map();
    try {
        cache = await window.caches.open(name);
    }
    catch (e) {
        console.warn('window.caches access not allowed');
    }
    return async (url) => {
        if (inFlightRequests.has(url)) {
            return inFlightRequests.get(url);
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
                await cache.put(request, new Response(result, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                }));
            }
            return result;
        })();
        inFlightRequests.set(url, fetchPromise);
        try {
            return await fetchPromise;
        }
        finally {
            inFlightRequests.delete(url);
        }
    };
}

const PROVIDERS = {
    'material-symbols': (name) => `https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@0.40.1/outlined/${name}.svg`,
    carbon: (name) => `https://cdn.jsdelivr.net/npm/@carbon/icons@11.41.0/svg/32/${name}.svg`,
};
const cacheFetch = await createCacheFetch('svg-cache');
async function fetchSVG(url) {
    if (!url)
        return '';
    return cacheFetch(url);
}
async function fetchIcon(name, provider = 'material-symbols') {
    if (!name)
        return '';
    if (!PROVIDERS[provider]) {
        throw new Error(`Provider '${provider}' not found`);
    }
    return fetchSVG(PROVIDERS[provider](name));
}

export { fetchIcon as a, fetchSVG as f, o, sanitizeSvg as s };
//# sourceMappingURL=datasource-B2eRh6Or.js.map
