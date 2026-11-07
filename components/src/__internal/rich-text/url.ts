/**
 * Whether a link or image address is safe to follow: http(s), mailto, tel, or relative. Returns the
 * trimmed address, or `undefined` for anything else, such as `javascript:` or `data:`.
 */
export function safeUrl(href: string | null | undefined): string | undefined {
  const url = (href ?? '').trim();
  if (!url) return undefined;
  if (/^(https?:|mailto:|tel:)/i.test(url) || url.startsWith('//')) return url;
  // Relative: no scheme before the first `/`, `?` or `#`.
  const scheme = /^([^/?#]*?):/.exec(url);
  return scheme ? undefined : url;
}

/**
 * The address someone typed into a link field, made followable: `example.com/a` gets `https://`,
 * an email address gets `mailto:`. Returns `undefined` when the address is not safe.
 */
export function linkFromInput(input: string): string | undefined {
  const text = input.trim();
  if (!text) return undefined;
  if (/^[^\s@/:]+@[^\s@/:]+\.[^\s@/:]+$/.test(text)) return `mailto:${text}`;
  if (/^(www\.)?[\w-]+(\.[\w-]+)+(:\d+)?([/?#]|$)/i.test(text)) {
    return safeUrl(`https://${text}`);
  }
  return safeUrl(text);
}
