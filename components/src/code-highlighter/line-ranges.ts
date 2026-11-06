export type LineVariant = 'highlighted' | 'added' | 'removed';

/**
 * Parses a line range list such as `"1, 3-5"` into 1-based line numbers.
 * Blank or malformed parts are skipped; a reversed range such as `"5-3"` is read as `3-5`.
 */
export function parseLineRanges(value: string | null | undefined): Set<number> {
  const lines = new Set<number>();
  if (!value) return lines;

  for (const part of value.split(',')) {
    const match = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (match) {
      const start = Number(match[1]);
      const end = match[2] === undefined ? start : Number(match[2]);
      const from = Math.max(1, Math.min(start, end));
      const to = Math.max(start, end);
      for (let line = from; line <= to; line += 1) lines.add(line);
    }
  }
  return lines;
}

/**
 * Maps 1-based line numbers to their variant. Where ranges overlap,
 * `removed` wins over `added`, and `added` wins over `highlighted`.
 */
export function buildLineVariants(ranges: {
  highlighted?: string | null;
  added?: string | null;
  removed?: string | null;
}): Map<number, LineVariant> {
  const variants = new Map<number, LineVariant>();
  const order: LineVariant[] = ['highlighted', 'added', 'removed'];
  for (const variant of order) {
    for (const line of parseLineRanges(ranges[variant])) {
      variants.set(line, variant);
    }
  }
  return variants;
}

/**
 * Removes leading and trailing blank lines and the indentation common to
 * every non-blank line, so indented markup reads as written.
 */
export function dedent(source: string): string {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  while (lines.length && lines[0].trim() === '') lines.shift();
  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();

  let indent = Infinity;
  for (const line of lines) {
    if (line.trim() !== '') {
      const leading = line.match(/^[ \t]*/)?.[0].length ?? 0;
      indent = Math.min(indent, leading);
    }
  }
  if (!Number.isFinite(indent) || indent === 0) return lines.join('\n');
  return lines.map(line => line.slice(indent)).join('\n');
}

/** Decodes the entities `innerHTML` produces for text, ending with `&amp;`. */
export function decodeEntities(source: string): string {
  return source
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

/** Splits code into display lines, ignoring one trailing newline. */
export function splitLines(code: string): string[] {
  const normalized = code.replace(/\r\n?/g, '\n');
  const trimmed = normalized.endsWith('\n')
    ? normalized.slice(0, -1)
    : normalized;
  return trimmed.split('\n');
}
