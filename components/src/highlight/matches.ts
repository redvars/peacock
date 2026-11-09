/** A run of marked text: `[start, end)` in UTF-16 code units of the original text. */
export type HighlightRange = [start: number, end: number];

/**
 * Folds text for matching: lower case in the locale, accents and other combining marks removed.
 * Returns the folded text and, for each of its code units, the original text's range it came from,
 * so a match in the folded text maps back to the original even when folding changes lengths.
 */
function fold(text: string, locale: string) {
  let folded = '';
  const starts: number[] = [];
  const ends: number[] = [];
  let offset = 0;
  for (const char of text) {
    const piece = char
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLocaleLowerCase(locale);
    for (let i = 0; i < piece.length; i += 1) {
      starts.push(offset);
      ends.push(offset + char.length);
    }
    // A mark that folds away, such as a combining accent, belongs to the letter before it.
    if (!piece && ends.length) ends[ends.length - 1] = offset + char.length;
    folded += piece;
    offset += char.length;
  }
  return { folded, starts, ends };
}

/**
 * The words of a query to look for, longest first so a longer word wins where two overlap.
 * One-letter words are left out when the query has longer ones, so "reset a password" does not
 * mark every "a".
 */
function queryWords(query: string, locale: string): string[] {
  const words = Array.from(
    new Set(
      fold(query, locale)
        .folded.split(/[\s\p{P}]+/u)
        .filter(Boolean),
    ),
  );
  const long = words.filter(word => [...word].length > 1);
  return (long.length ? long : words).sort((a, b) => b.length - a.length);
}

/** Sorts ranges and merges the ones that touch or overlap. */
export function mergeRanges(ranges: readonly HighlightRange[], length: number) {
  const sorted = ranges
    .map(
      ([start, end]): HighlightRange => [
        Math.max(0, Math.min(start, length)),
        Math.max(0, Math.min(end, length)),
      ],
    )
    .filter(([start, end]) => end > start)
    .sort((a, b) => a[0] - b[0]);
  const merged: HighlightRange[] = [];
  for (const range of sorted) {
    const last = merged[merged.length - 1];
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push([range[0], range[1]]);
  }
  return merged;
}

/**
 * Where the words of `query` occur in `text`, each word on its own, ignoring case and accents.
 * Ranges are sorted and do not overlap.
 */
export function findMatches(
  text: string,
  query: string,
  locale = 'en',
): HighlightRange[] {
  const words = queryWords(query, locale);
  if (!text || !words.length) return [];
  const { folded, starts, ends } = fold(text, locale);
  const taken = new Array<boolean>(folded.length).fill(false);
  const ranges: HighlightRange[] = [];
  for (const word of words) {
    let from = folded.indexOf(word);
    while (from !== -1) {
      const to = from + word.length;
      if (!taken.slice(from, to).some(Boolean)) {
        taken.fill(true, from, to);
        ranges.push([starts[from], ends[to - 1]]);
      }
      from = folded.indexOf(word, to);
    }
  }
  return mergeRanges(ranges, text.length);
}
