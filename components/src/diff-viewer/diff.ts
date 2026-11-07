/**
 * Line and word diff for wc-diff-viewer: Myers' O(ND) algorithm on lines, after trimming the
 * common prefix and suffix, then the same algorithm on the words of each changed line pair.
 */

/** One edit step: keep a line of both sides, delete one of the old side or insert one of the new. */
export type EditOp = 'equal' | 'delete' | 'insert';

/** A run of a changed line's text, marked when it differs from the paired line. */
export interface DiffSegment {
  text: string;
  changed: boolean;
}

/** One line of a unified diff. */
export interface DiffLine {
  type: 'equal' | 'added' | 'removed';
  /** 1-based line number in the old text (equal and removed lines). */
  oldNumber?: number;
  /** 1-based line number in the new text (equal and added lines). */
  newNumber?: number;
  text: string;
  /** Word-level runs, set on a changed line paired with a similar line of the other side. */
  segments?: DiffSegment[];
  /** The side's last line, when it has no line break and the other side's text does. */
  noNewline?: boolean;
}

/** The line ending a text uses. */
export type LineEnding = 'LF' | 'CRLF' | 'CR' | 'mixed';

export interface DiffResult {
  lines: DiffLine[];
  additions: number;
  deletions: number;
  /** The texts were too different or too large for Myers: the changed middle is replace-all. */
  approximate: boolean;
  /** The sides' line endings, when they differ (lines are compared without them). */
  lineEndings: { old: LineEnding; new: LineEnding } | null;
}

export interface DiffOptions {
  /** Most line edits Myers looks for before falling back to replace-all. Default 2000. */
  maxEdits?: number;
  /** Most `(old + new lines) × edits` work before falling back. Default 50 million. */
  maxWork?: number;
}

const DEFAULT_MAX_EDITS = 2000;
const DEFAULT_MAX_WORK = 50_000_000;

/** Word diffs are skipped on lines with more tokens than this, and above this many edits. */
const MAX_WORD_TOKENS = 1000;
const MAX_WORD_EDITS = 200;

/** Below this share of unchanged characters, a line pair is shown as a whole-line change. */
const MIN_WORD_SIMILARITY = 0.3;

/** Walks the Myers trace back from the end into the edit script. */
function backtrack(trace: Int32Array[], n: number, m: number): EditOp[] {
  const ops: EditOp[] = [];
  let x = n;
  let y = m;
  for (let d = trace.length - 1; d > 0; d -= 1) {
    const previous = trace[d - 1];
    // `previous` holds k from -(d - 1) to d - 1.
    const at = (k: number) => previous[k + d - 1];
    const k = x - y;
    const down = k === -d || (k !== d && at(k - 1) < at(k + 1));
    const previousK = down ? k + 1 : k - 1;
    const previousX = at(previousK);
    const previousY = previousX - previousK;
    while (x > previousX && y > previousY) {
      ops.push('equal');
      x -= 1;
      y -= 1;
    }
    ops.push(down ? 'insert' : 'delete');
    x = previousX;
    y = previousY;
  }
  while (x > 0 && y > 0) {
    ops.push('equal');
    x -= 1;
    y -= 1;
  }
  return ops.reverse();
}

/**
 * Myers' shortest edit script between `a` and `b`, or `null` when it needs more than `maxD`
 * edits. Space is O(D²) for the trace, time O((N + M) · D).
 */
export function editScript(
  a: ArrayLike<number>,
  b: ArrayLike<number>,
  maxD: number,
): EditOp[] | null {
  const n = a.length;
  const m = b.length;
  const max = Math.min(n + m, maxD);
  const offset = max + 1;
  const v = new Int32Array(2 * max + 3);
  const trace: Int32Array[] = [];

  for (let d = 0; d <= max; d += 1) {
    for (let k = -d; k <= d; k += 2) {
      let x =
        k === -d || (k !== d && v[offset + k - 1] < v[offset + k + 1])
          ? v[offset + k + 1]
          : v[offset + k - 1] + 1;
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) {
        x += 1;
        y += 1;
      }
      v[offset + k] = x;
      if (x >= n && y >= m) {
        trace.push(v.slice(offset - d, offset + d + 1));
        return backtrack(trace, n, m);
      }
    }
    trace.push(v.slice(offset - d, offset + d + 1));
  }
  return null;
}

interface SplitText {
  lines: string[];
  /** Whether the text ends with a line break. */
  finalNewline: boolean;
  ending: LineEnding | null;
}

/** Splits on CRLF, LF and CR; a final line break does not start an empty last line. */
export function splitText(text: string): SplitText {
  if (text === '') return { lines: [], finalNewline: false, ending: null };
  const lines = text.split(/\r\n|\r|\n/);
  const finalNewline = /[\r\n]$/.test(text);
  if (finalNewline) lines.pop();

  const crlf = (text.match(/\r\n/g) ?? []).length;
  const lf = (text.match(/\n/g) ?? []).length - crlf;
  const cr = (text.match(/\r/g) ?? []).length - crlf;
  const kinds = [crlf > 0, lf > 0, cr > 0].filter(Boolean).length;
  let ending: LineEnding | null = null;
  if (kinds > 1) ending = 'mixed';
  else if (crlf > 0) ending = 'CRLF';
  else if (lf > 0) ending = 'LF';
  else if (cr > 0) ending = 'CR';
  return { lines, finalNewline, ending };
}

/** Words, runs of white space and single other characters. */
function tokenize(line: string): string[] {
  return line.match(/[\p{L}\p{N}_]+|\s+|[^\p{L}\p{N}_\s]/gu) ?? [];
}

/** Maps strings to small integers, so the diff compares numbers. */
function interner() {
  const ids = new Map<string, number>();
  return (value: string) => {
    let id = ids.get(value);
    if (id === undefined) {
      id = ids.size;
      ids.set(value, id);
    }
    return id;
  };
}

/** Joins adjacent runs with the same mark. */
function pushSegment(segments: DiffSegment[], text: string, changed: boolean) {
  const last = segments[segments.length - 1];
  if (last && last.changed === changed) last.text += text;
  else segments.push({ text, changed });
}

/**
 * Word-level runs for a removed line and the added line it pairs with, or `null` when the lines
 * are too long or too different for word marks to help.
 */
export function wordDiff(
  oldLine: string,
  newLine: string,
): { old: DiffSegment[]; new: DiffSegment[] } | null {
  const a = tokenize(oldLine);
  const b = tokenize(newLine);
  if (a.length > MAX_WORD_TOKENS || b.length > MAX_WORD_TOKENS) return null;
  const id = interner();
  const ops = editScript(a.map(id), b.map(id), MAX_WORD_EDITS);
  if (!ops) return null;

  const oldSegments: DiffSegment[] = [];
  const newSegments: DiffSegment[] = [];
  let i = 0;
  let j = 0;
  let same = 0;
  for (const op of ops) {
    if (op === 'equal') {
      same += a[i].length;
      pushSegment(oldSegments, a[i], false);
      pushSegment(newSegments, b[j], false);
      i += 1;
      j += 1;
    } else if (op === 'delete') {
      pushSegment(oldSegments, a[i], true);
      i += 1;
    } else {
      pushSegment(newSegments, b[j], true);
      j += 1;
    }
  }
  const longest = Math.max(oldLine.length, newLine.length);
  if (longest === 0 || same / longest < MIN_WORD_SIMILARITY) return null;
  return { old: oldSegments, new: newSegments };
}

/** Diffs two texts line by line, with word marks on changed line pairs. */
export function diffTexts(
  oldText: string,
  newText: string,
  options: DiffOptions = {},
): DiffResult {
  const before = splitText(oldText);
  const after = splitText(newText);
  const a = before.lines;
  const b = after.lines;

  // A last line without a line break differs from the same text with one, as in git.
  const keysA = a.slice();
  const keysB = b.slice();
  if (before.finalNewline !== after.finalNewline) {
    if (!before.finalNewline && a.length > 0) keysA[a.length - 1] += '\0';
    if (!after.finalNewline && b.length > 0) keysB[b.length - 1] += '\0';
  }

  // Trim the common prefix and suffix: most edits to long texts are small.
  let start = 0;
  while (
    start < a.length &&
    start < b.length &&
    keysA[start] === keysB[start]
  ) {
    start += 1;
  }
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && keysA[endA - 1] === keysB[endB - 1]) {
    endA -= 1;
    endB -= 1;
  }

  const id = interner();
  const middleA = keysA.slice(start, endA).map(id);
  const middleB = keysB.slice(start, endB).map(id);
  const size = middleA.length + middleB.length;
  const maxEdits = Math.min(
    options.maxEdits ?? DEFAULT_MAX_EDITS,
    Math.floor((options.maxWork ?? DEFAULT_MAX_WORK) / Math.max(1, size)),
  );
  let middle = size === 0 ? [] : editScript(middleA, middleB, maxEdits);
  const approximate = middle === null;
  middle ??= [
    ...new Array<EditOp>(middleA.length).fill('delete'),
    ...new Array<EditOp>(middleB.length).fill('insert'),
  ];
  const ops: EditOp[] = [
    ...new Array<EditOp>(start).fill('equal'),
    ...middle,
    ...new Array<EditOp>(a.length - endA).fill('equal'),
  ];

  const lines: DiffLine[] = [];
  let additions = 0;
  let deletions = 0;
  let i = 0;
  let j = 0;
  let removed: DiffLine[] = [];
  let added: DiffLine[] = [];
  const markEnd = (
    line: DiffLine,
    index: number,
    side: SplitText,
    other: SplitText,
  ) => {
    if (
      index === side.lines.length - 1 &&
      !side.finalNewline &&
      other.finalNewline
    ) {
      // eslint-disable-next-line no-param-reassign
      line.noNewline = true;
    }
  };
  // A block of changes is shown removed lines first, then added ones; pairs get word marks.
  const flush = () => {
    const pairs = Math.min(removed.length, added.length);
    for (let p = 0; p < pairs; p += 1) {
      const words = wordDiff(removed[p].text, added[p].text);
      if (words) {
        removed[p].segments = words.old;
        added[p].segments = words.new;
      }
    }
    lines.push(...removed, ...added);
    removed = [];
    added = [];
  };

  for (const op of ops) {
    if (op === 'equal') {
      flush();
      const line: DiffLine = {
        type: 'equal',
        oldNumber: i + 1,
        newNumber: j + 1,
        text: b[j],
      };
      lines.push(line);
      i += 1;
      j += 1;
    } else if (op === 'delete') {
      const line: DiffLine = { type: 'removed', oldNumber: i + 1, text: a[i] };
      markEnd(line, i, before, after);
      removed.push(line);
      deletions += 1;
      i += 1;
    } else {
      const line: DiffLine = { type: 'added', newNumber: j + 1, text: b[j] };
      markEnd(line, j, after, before);
      added.push(line);
      additions += 1;
      j += 1;
    }
  }
  flush();

  const lineEndings =
    before.ending && after.ending && before.ending !== after.ending
      ? { old: before.ending, new: after.ending }
      : null;

  return { lines, additions, deletions, approximate, lineEndings };
}
