/** Most cuts tried before giving up on a prefix. */
const MAX_ATTEMPTS = 40;

interface Scan {
  /** Open `{` and `[`, innermost last. */
  stack: string[];
  /** The text ends inside a string. */
  inString: boolean;
  /** Places where the text can be cut and still be the start of valid JSON. */
  cuts: number[];
}

function scan(text: string): Scan {
  const stack: string[] = [];
  const cuts: number[] = [];
  let inString = false;
  let escaped = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
    } else if (char === '"') inString = true;
    else if (char === '{' || char === '[') {
      stack.push(char);
      cuts.push(i + 1);
    } else if (char === '}' || char === ']') {
      stack.pop();
      cuts.push(i + 1);
    } else if (char === ',') cuts.push(i);
  }
  return { stack, inString, cuts };
}

/** Closes what `text` leaves open: a string, then its arrays and objects. */
function close(text: string): string {
  const { stack, inString } = scan(text);
  let result = text;
  if (inString) {
    // A lone backslash would escape the closing quote.
    if (/(^|[^\\])(\\\\)*\\$/.test(result)) result = result.slice(0, -1);
    result += '"';
  }
  result = result.replace(/[\s,:]+$/, '');
  for (let i = stack.length - 1; i >= 0; i -= 1)
    result += stack[i] === '{' ? '}' : ']';
  return result;
}

/**
 * Parses JSON that may be cut off, as it is while a model streams it: open strings, arrays and
 * objects are closed, and an unfinished key or value is dropped. Returns `undefined` when nothing
 * usable has arrived yet.
 */
export function parsePartialJson(text: string): unknown {
  // Trailing space may be inside a string that is still arriving, so keep it.
  const source = text.trimStart();
  if (!source.trim()) return undefined;
  try {
    return JSON.parse(source);
  } catch {
    // Cut off; repair it below.
  }
  // Try the whole text, then cut back to each earlier place where a value starts or ends.
  const { cuts } = scan(source);
  const ends = [source.length, ...cuts.filter(cut => cut > 0).reverse()];
  for (const end of ends.slice(0, MAX_ATTEMPTS)) {
    try {
      return JSON.parse(close(source.slice(0, end)));
    } catch {
      // Cut further back.
    }
  }
  return undefined;
}
