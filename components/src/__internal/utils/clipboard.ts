/**
 * Copies with a hidden textarea and `document.execCommand('copy')`, for browsers without the
 * Clipboard API and pages where it rejects (an insecure origin, a denied permission, an iframe
 * without `clipboard-write`). Puts focus and the page's selection back afterwards.
 *
 * @returns Whether the browser reports that the copy worked.
 */
function copyWithExecCommand(text: string): boolean {
  if (typeof document === 'undefined' || !document.body) return false;

  const activeElement = document.activeElement as HTMLElement | null;
  const selection = document.getSelection();
  const ranges: Range[] = [];
  if (selection) {
    for (let i = 0; i < selection.rangeCount; i += 1) {
      ranges.push(selection.getRangeAt(i));
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.setAttribute('aria-hidden', 'true');
  textarea.tabIndex = -1;
  Object.assign(textarea.style, {
    position: 'fixed',
    insetBlockStart: '0',
    insetInlineStart: '0',
    inlineSize: '1px',
    blockSize: '1px',
    padding: '0',
    border: '0',
    opacity: '0',
    pointerEvents: 'none',
  });

  document.body.appendChild(textarea);
  let copied = false;
  try {
    textarea.focus({ preventScroll: true });
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    // Deprecated, but still the only synchronous way to copy without the Clipboard API.
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  } finally {
    textarea.remove();
    activeElement?.focus?.({ preventScroll: true });
    if (selection) {
      selection.removeAllRanges();
      for (const range of ranges) selection.addRange(range);
    }
  }
  return copied;
}

/**
 * Writes `text` to the clipboard: with `navigator.clipboard.writeText` when the browser has it,
 * else, or when it rejects, with a hidden textarea and `execCommand('copy')`.
 *
 * Call it from a user gesture (a click or a key press); browsers refuse clipboard writes
 * otherwise.
 *
 * @throws Rejects with an `Error` when neither way copied the text.
 */
export async function writeClipboardText(text: string): Promise<void> {
  const clipboard =
    typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
  if (clipboard && typeof clipboard.writeText === 'function') {
    try {
      await clipboard.writeText(text);
      return;
    } catch {
      // Fall through to the textarea.
    }
  }
  if (!copyWithExecCommand(text)) {
    throw new Error('Could not copy to the clipboard.');
  }
}

/**
 * The text a copy button copies from `element`: the value of an `input`, `textarea` or
 * `select`, else its text content.
 */
export function textToCopyFrom(element: Element): string {
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  ) {
    return element.value;
  }
  return element.textContent ?? '';
}
