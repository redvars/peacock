import type { JSONContent } from '@tiptap/core';

/**
 * The value of `wc-document-editor`: the page setup and three rich-text documents (body, header,
 * footer) as Tiptap JSON. It keeps what Markdown cannot: alignment, text color, page size,
 * margins, page breaks and the header and footer.
 */

/** Paper sizes the editor offers, in millimetres (portrait). */
export const PAGE_SIZES = {
  a4: { width: 210, height: 297 },
  letter: { width: 215.9, height: 279.4 },
  legal: { width: 215.9, height: 355.6 },
} as const;

export type PageSize = keyof typeof PAGE_SIZES;

export type PageOrientation = 'portrait' | 'landscape';

/** Page margins in millimetres. */
export interface PageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Margin presets, as in word processors. */
export const MARGIN_PRESETS = {
  normal: { top: 25.4, right: 25.4, bottom: 25.4, left: 25.4 },
  narrow: { top: 12.7, right: 12.7, bottom: 12.7, left: 12.7 },
  wide: { top: 25.4, right: 50.8, bottom: 25.4, left: 50.8 },
} as const satisfies Record<string, PageMargins>;

export type MarginPreset = keyof typeof MARGIN_PRESETS;

export interface PageSetup {
  size: PageSize;
  orientation: PageOrientation;
  margins: PageMargins;
}

export interface DocumentValue {
  /** Format version, for future migrations. */
  version: 1;
  page: PageSetup;
  /** Repeated at the top of every page. */
  header: JSONContent;
  /** Repeated at the bottom of every page. */
  footer: JSONContent;
  body: JSONContent;
}

const EMPTY_DOC: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
};

export function defaultPageSetup(): PageSetup {
  return {
    size: 'a4',
    orientation: 'portrait',
    margins: { ...MARGIN_PRESETS.normal },
  };
}

/** A new, empty document. */
export function emptyDocument(): DocumentValue {
  return {
    version: 1,
    page: defaultPageSetup(),
    header: structuredClone(EMPTY_DOC),
    footer: structuredClone(EMPTY_DOC),
    body: structuredClone(EMPTY_DOC),
  };
}

function isDoc(content: unknown): content is JSONContent {
  return (
    !!content &&
    typeof content === 'object' &&
    (content as JSONContent).type === 'doc'
  );
}

function clampMargin(value: unknown, fallback: number): number {
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.min(Math.max(number, 0), 100)
    : fallback;
}

/** A value with every part present and valid, filling gaps from the defaults. */
export function normalizeDocument(
  value: Partial<DocumentValue> | null | undefined,
): DocumentValue {
  const empty = emptyDocument();
  if (!value || typeof value !== 'object') return empty;
  const page = (value.page ?? {}) as Partial<PageSetup>;
  const margins = (page.margins ?? {}) as Partial<PageMargins>;
  const defaults = empty.page.margins;
  return {
    version: 1,
    page: {
      size: page.size && page.size in PAGE_SIZES ? page.size : 'a4',
      orientation: page.orientation === 'landscape' ? 'landscape' : 'portrait',
      margins: {
        top: clampMargin(margins.top, defaults.top),
        right: clampMargin(margins.right, defaults.right),
        bottom: clampMargin(margins.bottom, defaults.bottom),
        left: clampMargin(margins.left, defaults.left),
      },
    },
    header: isDoc(value.header) ? value.header : empty.header,
    footer: isDoc(value.footer) ? value.footer : empty.footer,
    body: isDoc(value.body) ? value.body : empty.body,
  };
}

/** CSS pixels per millimetre at 96 DPI. */
export const PX_PER_MM = 96 / 25.4;

/** The page box in CSS pixels. */
export interface PageGeometry {
  width: number;
  height: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  /** Height available to the body on each page. */
  contentHeight: number;
  /** Width available to the body. */
  contentWidth: number;
  /** Space between pages on screen. */
  gap: number;
}

export function pageGeometry(page: PageSetup, gap = 24): PageGeometry {
  const paper = PAGE_SIZES[page.size];
  const landscape = page.orientation === 'landscape';
  const width = (landscape ? paper.height : paper.width) * PX_PER_MM;
  const height = (landscape ? paper.width : paper.height) * PX_PER_MM;
  const m = page.margins;
  const marginTop = m.top * PX_PER_MM;
  const marginRight = m.right * PX_PER_MM;
  const marginBottom = m.bottom * PX_PER_MM;
  const marginLeft = m.left * PX_PER_MM;
  return {
    width,
    height,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    contentHeight: Math.max(48, height - marginTop - marginBottom),
    contentWidth: Math.max(96, width - marginLeft - marginRight),
    gap,
  };
}

/** Which margin preset a page setup matches, if any. */
export function marginPresetOf(margins: PageMargins): MarginPreset | undefined {
  return (Object.keys(MARGIN_PRESETS) as MarginPreset[]).find(name => {
    const preset = MARGIN_PRESETS[name];
    return (
      Math.abs(preset.top - margins.top) < 0.1 &&
      Math.abs(preset.right - margins.right) < 0.1 &&
      Math.abs(preset.bottom - margins.bottom) < 0.1 &&
      Math.abs(preset.left - margins.left) < 0.1
    );
  });
}
