/** Computed styles that change where text wraps and how tall a line is. */
const MIRRORED = [
  'direction',
  'boxSizing',
  'width',
  'overflowX',
  'overflowY',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderStyle',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'fontStretch',
  'fontSize',
  'fontSizeAdjust',
  'lineHeight',
  'fontFamily',
  'textAlign',
  'textTransform',
  'textIndent',
  'textDecoration',
  'letterSpacing',
  'wordSpacing',
  'tabSize',
  'whiteSpace',
  'wordBreak',
  'overflowWrap',
] as const;

/** Where a caret position sits, in pixels from the textarea's top-left border edge. */
export interface CaretCoordinates {
  top: number;
  left: number;
  height: number;
}

/**
 * The position of the character at `position` in a textarea, by the mirror-div technique: a
 * hidden div with the textarea's text metrics holds the text up to the caret and a marker span,
 * and the span's offset is the caret's. The result accounts for the textarea's scroll.
 */
export function caretCoordinates(
  textarea: HTMLTextAreaElement,
  position: number,
): CaretCoordinates {
  const style = getComputedStyle(textarea);
  const mirror = document.createElement('div');
  const target = mirror.style;
  for (const property of MIRRORED) {
    target[property] = style[property];
  }
  target.position = 'absolute';
  target.visibility = 'hidden';
  target.top = '0';
  target.left = '-9999px';
  target.whiteSpace = 'pre-wrap';
  target.overflowWrap = 'break-word';
  target.height = 'auto';
  target.overflow = 'hidden';

  mirror.textContent = textarea.value.slice(0, position);
  const marker = document.createElement('span');
  // A character, so the span has a height even at the end of a line.
  marker.textContent = textarea.value.slice(position) || '.';
  mirror.appendChild(marker);
  (textarea.parentNode ?? document.body).appendChild(mirror);

  const lineHeight =
    parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2;
  const coordinates = {
    top:
      marker.offsetTop + parseFloat(style.borderTopWidth) - textarea.scrollTop,
    left:
      marker.offsetLeft +
      parseFloat(style.borderLeftWidth) -
      textarea.scrollLeft,
    height: lineHeight,
  };
  mirror.remove();
  return coordinates;
}
