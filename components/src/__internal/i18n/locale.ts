/**
 * Resolves the locale a component formats with: its own `locale` property, else the `lang` of the
 * nearest ancestor (crossing shadow roots), else the document's `lang`, else the browser language.
 */
export function resolveLocale(locale?: string, element?: Element): string {
  if (locale) return locale;
  const lang = element ? closestLang(element) : '';
  if (lang) return lang;
  if (typeof document !== 'undefined' && document.documentElement.lang) {
    return document.documentElement.lang;
  }
  return typeof navigator !== 'undefined' ? navigator.language : 'en-US';
}

/** The `lang` of the element or its nearest ancestor, walking out of shadow roots. */
function closestLang(element: Element): string {
  let node: Element | null = element;
  while (node) {
    const lang = node.getAttribute('lang');
    if (lang) return lang;
    if (node.parentElement) {
      node = node.parentElement;
    } else {
      const root = node.getRootNode();
      node = root instanceof ShadowRoot ? root.host : null;
    }
  }
  return '';
}

/** Whether the element lays out right to left, from the computed `direction`. */
export function isRtl(element: Element): boolean {
  if (typeof getComputedStyle === 'undefined') return false;
  return getComputedStyle(element).direction === 'rtl';
}
