import { EventEmitter } from '@stencil/core';
import { STANDARD_COLORS } from './constants';

/**
 * Event types that trigger "drags".
 */
export const DRAG_EVENT_TYPES = new Set(['mousemove', 'touchmove']);

/**
 * Event types that trigger a "drag" to stop.
 */
export const DRAG_STOP_EVENT_TYPES = new Set([
  'mouseup',
  'touchend',
  'touchcancel',
]);

export const getComponentIndex = (() => {
  let counter = 1;
  return function () {
    return `${counter++}`;
  };
})();

export function isOutOfViewport(bounding: DOMRect) {
  // Check if it's out of the viewport on each side
  const out: any = {};
  out.top = bounding.top < 0;
  out.left = bounding.left < 0;
  out.bottom =
    bounding.bottom >
    (window.innerHeight || document.documentElement.clientHeight);
  out.right =
    bounding.right >
    (window.innerWidth || document.documentElement.clientWidth);
  out.any = out.top || out.left || out.bottom || out.right;
  out.all = out.top && out.left && out.bottom && out.right;
  return out;
}

export function isInViewport(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top !== 0 || rect.left !== 0 || rect.bottom !== 0 || rect.right !== 0
  );
}

export const observeThemeChange = (() => {
  let callbacks = [];
  const elem = document.documentElement;
  let lastClassName = elem.getAttribute('data-theme');
  window.setInterval(function () {
    let className = elem.getAttribute('data-theme');
    if (className !== lastClassName) {
      callbacks.forEach(callback => callback());
      lastClassName = className;
    }
  }, 10);
  return function (callback) {
    callbacks.push(callback);
  };
})();

export const isDarkMode = () => {
  return document.documentElement.getAttribute('data-theme') == 'dark';
};

export enum ElementSize {
  SMALL = 'sm',
  MEDIUM = 'md',
  LARGE = 'lg',
  X_LARGE = 'xl',
  XX_LARGE = 'xxl',
  XXX_LARGE = 'xxxl',
}

export function isEventTriggerByElement(event, element) {
  const path = event.composedPath();
  for (const elm of path) {
    if (elm === element) return true;
  }
  return false;
}

export function isEventNotTriggerByElement(event, element) {
  const path = event.composedPath();
  for (const elm of path) {
    if (elm !== element) return true;
  }
  return false;
}

export function throttle(
  func: Function,
  delay: number,
  options = { leading: true, trailing: true },
) {
  let timerId: any;
  let lastExec = 0;

  return function (...args: any[]) {
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

export const debounceEvent = (
  event: EventEmitter,
  wait: number,
): EventEmitter => {
  const original = (event as any)._original || event;
  return {
    _original: event,
    emit: debounce(original.emit.bind(original), wait),
  } as EventEmitter;
};

export const debounce = (func: (...args: any[]) => void, wait = 0) => {
  let timer: any;
  return (...args: any[]): any => {
    clearTimeout(timer);
    timer = setTimeout(func, wait, ...args);
  };
};

export async function loadScriptModule(src) {
  return new Promise(resolve => {
    import(src)
      .then(module => {
        resolve(module);
      })
      .catch(error => {
        console.error('Module loading failed:', error);
      });
  });
}

export async function loadScript(src) {
  return new Promise(resolve => {
    const script = document.createElement('script');
    script.src = src;
    script.addEventListener('load', () => {
      resolve(true);
    });
    document.head.appendChild(script);
  });
}

export const getFromObject = (obj, path, defaultValue = undefined) => {
  const travel = regexp =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce(
        (res, key) => (res !== null && res !== undefined ? res[key] : res),
        obj,
      );
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
};

const memoize = fn => {
  let cache = {};
  return (...args) => {
    let n = args[0];
    if (n in cache) {
      return cache[n];
    } else {
      let result = fn(n);
      cache[n] = result;
      return result;
    }
  };
};

export const isLightOrDark = memoize(color => {
  color = STANDARD_COLORS[color] || color;

  // Variables for red, green, blue values
  let r, g, b, hsp;

  // Check the format of the color, HEX or RGB?
  if (color.match(/^rgb/)) {
    // If HEX --> store the red, green, blue values in separate variables
    color = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

    r = color[1];
    g = color[2];
    b = color[3];
  } else {
    // If RGB --> Convert it to HEX: http://gist.github.com/983661
    color = +('0x' + color.slice(1).replace(color.length < 5 && /./g, '$&$&'));

    r = color >> 16;
    g = (color >> 8) & 255;
    b = color & 255;
  }

  // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
  hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

  // Using the HSP value, determine whether the color is light or dark
  if (hsp > 127.5) {
    return 'light';
  } else {
    return 'dark';
  }
});

export function getNextLayer(layer?: 'background' | '01' | '02') {
  if (!layer || layer == 'background') return '01';
  if (layer == '01') return '02';
  if (layer == '02') return 'background';
}

export function convertToDomSVG(svg: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, 'image/svg+xml');
  return doc.documentElement;
}

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
    if (
      cache &&
      response.status === 200 &&
      process.env.THIRD_PARTY_ASSETS == 'REMOTE'
    ) {
      await cache.put(request, new Response(result));
    }
    return result;
  };
}

export const hasSlot = (el: HTMLElement, name?: string) => {
  // Look for a named slot
  if (name) {
    return el.querySelector(`:scope > [slot="${name}"]`) !== null;
  }

  // Look for a default slot
  const nodeList = Array.from(el.childNodes);
  return nodeList.some(node => {
    if (node.nodeType === node.TEXT_NODE && node.textContent!.trim() !== '') {
      return true;
    }

    if (node.nodeType === node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (!el.hasAttribute('slot')) {
        return true;
      }
    }

    return false;
  });
};

export function getSVGHTMLElement(svgXml: string): HTMLElement {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgXml, 'image/svg+xml');
    if (doc.documentElement.tagName === 'svg') {
      // @ts-ignore
      return doc.documentElement;
    }
  } catch (e) {
    console.error(e);
    throw new Error(`Error parsing SVG: ${e}`);
  }
}

export function getSVGHTMLString(svgXml: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgXml, 'image/svg+xml');
    if (doc.documentElement.tagName === 'svg') {
      // @ts-ignore
      return doc.documentElement.outerHTML;
    }
  } catch (e) {
    console.error(e);
    throw new Error(`Error parsing SVG: ${e}`);
  }
}

export async function waitUntil(condition: any, timeout = 300) {
  return await new Promise(resolve => {
    const interval = setInterval(() => {
      if (condition()) {
        resolve(1);
        clearInterval(interval);
      }
    }, timeout);
  });
}

export function remToPx(rem: number | string): number {
  if (typeof rem === 'number')
    return (
      rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
    );
  else if (typeof rem === 'string' && rem.endsWith('rem'))
    return (
      parseFloat(rem) *
      parseFloat(getComputedStyle(document.documentElement).fontSize)
    );
}
