// Basic sanitization: remove <script>, <foreignObject>, event handler attributes (on*), and iframes
export function sanitizeSvg(rawSvg: string) {
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
    if (!el) return '';

    const serializer = new XMLSerializer();
    return serializer.serializeToString(el);
  } catch (e) {
    return '';
  }
}