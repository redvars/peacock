/** A person, tag or other thing the app offers after a trigger character. */
export interface MentionSuggestion {
  /** Stable id the app knows the thing by, such as a user id. */
  id: string;
  /** Name inserted into the text after the trigger, such as "Ana Lima". */
  label: string;
  /** A second line in the list, such as a job title or an email address. */
  description?: string;
  /** Image URL of an avatar shown before the label. */
  avatar?: string;
}

/** A mention in the text: the characters `start` to `end` are the trigger followed by `label`. */
export interface Mention {
  /** The `id` of the suggestion it was made from. */
  id: string;
  /** The inserted name, without the trigger. */
  label: string;
  /** The trigger character, such as `@`. */
  trigger: string;
  /** Index of the trigger character in `value`. */
  start: number;
  /** Index just after the label in `value`. */
  end: number;
}

/** The query being typed after a trigger character. */
export interface MentionQuery {
  trigger: string;
  /** Index of the trigger character. */
  start: number;
  /** The text between the trigger and the caret. */
  query: string;
}

/** Longest query looked at; longer runs of text after a trigger are not a mention. */
const MAX_QUERY_LENGTH = 50;

/**
 * Keeps the mentions that still match the text: in range, not overlapping, and with the trigger
 * and label at their place. Sorted by position; each a copy.
 */
export function validMentions(
  mentions: readonly Mention[],
  text: string,
): Mention[] {
  const sorted = mentions
    .filter(
      mention =>
        Number.isInteger(mention.start) &&
        Number.isInteger(mention.end) &&
        mention.start >= 0 &&
        mention.end <= text.length &&
        text.slice(mention.start, mention.end) ===
          `${mention.trigger}${mention.label}`,
    )
    .map(mention => ({ ...mention }))
    .sort((a, b) => a.start - b.start);
  const result: Mention[] = [];
  for (const mention of sorted) {
    const last = result[result.length - 1];
    if (!last || mention.start >= last.end) result.push(mention);
  }
  return result;
}

/**
 * Moves the mentions to follow an edit from `before` to `after`. A mention before the edit
 * stays, one after it moves by the change in length, and one the edit touched is dropped: its
 * text stays as typed, as plain text. `caret` is the caret after the edit; it places an edit
 * between repeated characters (typing `@` in front of `@Ana`).
 */
export function shiftMentions(
  mentions: readonly Mention[],
  before: string,
  after: string,
  caret?: number,
): Mention[] {
  const delta = after.length - before.length;
  const shortest = Math.min(before.length, after.length);
  let prefix = 0;
  while (prefix < shortest && before[prefix] === after[prefix]) prefix += 1;
  if (caret !== undefined) {
    prefix = Math.max(0, Math.min(prefix, caret - Math.max(delta, 0)));
  }
  let suffix = 0;
  while (
    suffix < shortest - prefix &&
    before[before.length - 1 - suffix] === after[after.length - 1 - suffix]
  ) {
    suffix += 1;
  }
  const editEnd = before.length - suffix;
  const result: Mention[] = [];
  for (const mention of mentions) {
    if (mention.end <= prefix) {
      result.push({ ...mention });
    } else if (mention.start >= editEnd) {
      result.push({
        ...mention,
        start: mention.start + delta,
        end: mention.end + delta,
      });
    }
  }
  return validMentions(result, after);
}

/** Whether the character before a trigger lets it start a mention: start, space or an opening mark. */
function opensMention(previous: string | undefined): boolean {
  return previous === undefined || /[\s([{"'«“‘]/.test(previous);
}

/**
 * The mention query that ends at `caret`: a trigger at the start of the text or after a space,
 * followed by up to 50 characters on the same line, without a leading space or two spaces in a
 * row (names have spaces; sentences have more). Nothing inside an existing mention counts.
 */
export function findQuery(
  text: string,
  caret: number,
  triggers: readonly string[],
  mentions: readonly Mention[],
): MentionQuery | null {
  if (!triggers.length) return null;
  const inMention = (index: number) =>
    mentions.some(mention => index >= mention.start && index < mention.end);
  const lowest = Math.max(0, caret - MAX_QUERY_LENGTH - 1);
  for (let index = caret - 1; index >= lowest; index -= 1) {
    const char = text[index];
    if (char === '\n') return null;
    if (inMention(index)) return null;
    if (triggers.includes(char) && opensMention(text[index - 1])) {
      const query = text.slice(index + 1, caret);
      if (/^\s/.test(query) || /\s\s/.test(query)) return null;
      return { trigger: char, start: index, query };
    }
  }
  return null;
}
