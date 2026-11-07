import { Extension } from '@tiptap/core';
import type { Node as PMNode, ResolvedPos } from '@tiptap/pm/model';
import { Plugin, PluginKey, type EditorState } from '@tiptap/pm/state';
import { Decoration, DecorationSet, type EditorView } from '@tiptap/pm/view';

import type { PageGeometry } from './document-model.js';

/**
 * Pagination for `wc-document-editor`. The body is one continuous editor as wide as the page's text
 * area; pages are drawn behind it. After layout, `paginate()` measures where the content falls and
 * inserts spacers that push the next piece of content to the top of the next page:
 *
 * - paragraphs and headings break at the line that crosses the page bottom (a spacer inside the
 *   paragraph, at the start of that line);
 * - lists, quotes and other containers break between their children;
 * - table rows move whole (the row's cells get extra top padding);
 * - images, dividers and other atoms move whole;
 * - a manual page break starts a new page after it.
 *
 * Measuring is done on the layout without spacers: they are removed, the content is measured, and
 * the new spacers are added in the same frame, so nothing flickers.
 *
 * The pages may be shown scaled (the editor's zoom is a CSS transform on the sheet). The layout
 * does not change with the zoom, so pagination works in the layout's unscaled CSS pixels: screen
 * measurements are divided by the scale, and points given to `posAtCoords` are scaled back.
 */

/** A spacer: before `pos`, `height` pixels, either a widget or extra padding on a table row. */
export interface Spacer {
  pos: number;
  height: number;
  kind: 'widget' | 'row';
}

interface PaginationState {
  spacers: Spacer[];
  decorations: DecorationSet;
}

export const paginationKey = new PluginKey<PaginationState>(
  'peacockPagination',
);

function spacerElement(height: number): HTMLElement {
  const element = document.createElement('div');
  element.className = 'page-spacer';
  element.setAttribute('aria-hidden', 'true');
  element.contentEditable = 'false';
  element.style.height = `${height}px`;
  return element;
}

/** The decorations for a set of spacers. */
function decorationsFor(doc: PMNode, spacers: Spacer[]): DecorationSet {
  const decorations: Decoration[] = [];
  for (const spacer of spacers) {
    const row = spacer.kind === 'row' ? doc.nodeAt(spacer.pos) : null;
    if (row) {
      row.forEach((_cell, offset) => {
        const from = spacer.pos + 1 + offset;
        const cell = doc.nodeAt(from);
        if (!cell) return;
        decorations.push(
          Decoration.node(from, from + cell.nodeSize, {
            class: 'page-gap',
            style: `--page-gap-before: ${spacer.height}px`,
          }),
        );
      });
    } else if (spacer.kind === 'widget') {
      decorations.push(
        Decoration.widget(spacer.pos, () => spacerElement(spacer.height), {
          side: -1,
          key: `page-spacer-${spacer.pos}-${Math.round(spacer.height)}`,
          ignoreSelection: true,
        }),
      );
    }
  }
  return DecorationSet.create(doc, decorations);
}

/** The ProseMirror plugin that holds the spacers. */
export function paginationExtension() {
  return Extension.create({
    name: 'peacockPagination',
    addProseMirrorPlugins() {
      return [
        new Plugin<PaginationState>({
          key: paginationKey,
          state: {
            init: () => ({ spacers: [], decorations: DecorationSet.empty }),
            apply(tr, old) {
              const next = tr.getMeta(paginationKey) as Spacer[] | undefined;
              if (next) {
                return {
                  spacers: next,
                  decorations: decorationsFor(tr.doc, next),
                };
              }
              if (!tr.docChanged) return old;
              return {
                spacers: old.spacers.map(spacer => ({
                  ...spacer,
                  pos: tr.mapping.map(spacer.pos),
                })),
                decorations: old.decorations.map(tr.mapping, tr.doc),
              };
            },
          },
          props: {
            decorations: (state: EditorState) =>
              paginationKey.getState(state)?.decorations,
          },
        }),
      ];
    },
  });
}

/** A piece of content that moves to the next page whole, or breaks at a line. */
interface Unit {
  pos: number;
  node: PMNode;
  kind: 'text' | 'row' | 'atom' | 'manual';
}

function collectUnits(doc: PMNode): Unit[] {
  const units: Unit[] = [];
  doc.descendants((node, pos) => {
    if (node.type.name === 'pageBreak') {
      units.push({ pos, node, kind: 'manual' });
      return false;
    }
    if (node.type.name === 'tableRow') {
      units.push({ pos, node, kind: 'row' });
      return false;
    }
    if (node.isTextblock) {
      units.push({ pos, node, kind: 'text' });
      return false;
    }
    if (node.isBlock && node.isAtom) {
      units.push({ pos, node, kind: 'atom' });
      return false;
    }
    return true;
  });
  return units;
}

/**
 * Where to put a spacer that moves the unit at `pos` down: before the outermost container the unit
 * starts, so a list's bullet or a quote's bar moves with its first line.
 */
function liftedPosition(doc: PMNode, pos: number): number {
  let $pos: ResolvedPos = doc.resolve(pos);
  let at = pos;
  while ($pos.depth > 0 && $pos.index() === 0) {
    const parent = $pos.parent.type.name;
    if (parent === 'tableCell' || parent === 'tableHeader') break;
    at = $pos.before();
    $pos = doc.resolve(at);
  }
  return at;
}

function sameSpacers(a: Spacer[], b: Spacer[]): boolean {
  return (
    a.length === b.length &&
    a.every(
      (spacer, index) =>
        spacer.pos === b[index].pos &&
        spacer.kind === b[index].kind &&
        Math.abs(spacer.height - b[index].height) < 1,
    )
  );
}

/** The result of a pagination pass. */
export interface PaginationResult {
  /** Number of pages. */
  pages: number;
  spacers: Spacer[];
}

/**
 * Measures the content and places the spacers. Returns the page count. `lock` is called with the
 * current height before the spacers come out, so the scroll position cannot jump. `scale` is the
 * zoom the pages are shown at (1 for 100%); the result does not depend on it.
 */
export function paginate(
  view: EditorView,
  geometry: PageGeometry,
  lock?: (height: number) => () => void,
  scale = 1,
): PaginationResult {
  const current = paginationKey.getState(view.state)?.spacers ?? [];
  const release = lock?.(view.dom.offsetHeight);
  // Measure without spacers.
  if (current.length) {
    view.dispatch(
      view.state.tr.setMeta(paginationKey, []).setMeta('addToHistory', false),
    );
  }
  const { doc } = view.state;
  const rootTop = view.dom.getBoundingClientRect().top;
  /** A screen y as unscaled layout pixels below the top of the body, and back. */
  const toLayout = (y: number) => (y - rootTop) / scale;
  const toScreen = (y: number) => rootTop + y * scale;
  const gutter = geometry.marginBottom + geometry.gap + geometry.marginTop;
  const pageHeight = geometry.contentHeight;
  const spacers: Spacer[] = [];

  let pageStart = 0;
  let forceBreak = false;
  let pages = 1;

  const breakBefore = (pos: number, top: number, kind: Spacer['kind']) => {
    const room = Math.max(0, pageStart + pageHeight - top);
    spacers.push({ pos, height: room + gutter, kind });
    pageStart = top;
    pages += 1;
  };

  /** Moves a whole unit to the next page. */
  const moveWhole = (unit: Unit, top: number) =>
    breakBefore(
      unit.kind === 'row' ? unit.pos : liftedPosition(doc, unit.pos),
      top,
      unit.kind === 'row' ? 'row' : 'widget',
    );

  /** Breaks a paragraph at the first line that does not fit, page after page if it is long. */
  const splitText = (
    unit: Unit,
    rect: DOMRect,
    top: number,
    bottom: number,
  ) => {
    let limit = pageStart + pageHeight;
    let splitFrom = top;
    while (bottom > limit + 0.5) {
      const probe = view.posAtCoords({
        left: rect.left + 2 * scale,
        top: toScreen(limit + 1),
      });
      if (!probe) return;
      const lineTop = toLayout(view.coordsAtPos(probe.pos).top);
      const lineStart = view.posAtCoords({
        left: rect.left + scale,
        top: toScreen(lineTop + 1),
      });
      const inside =
        !!lineStart &&
        lineStart.pos > unit.pos + 1 &&
        lineStart.pos < unit.pos + unit.node.nodeSize - 1;
      if (lineTop <= splitFrom + 1 || !inside || !lineStart) {
        // The first line of what is left does not fit: move the block itself, unless it already
        // starts the page.
        if (splitFrom === top && top > pageStart + 1) moveWhole(unit, top);
        return;
      }
      breakBefore(lineStart.pos, lineTop, 'widget');
      splitFrom = lineTop;
      limit = pageStart + pageHeight;
    }
  };

  const place = (unit: Unit) => {
    const dom = view.nodeDOM(unit.pos);
    if (!(dom instanceof HTMLElement)) return;
    const rect = dom.getBoundingClientRect();
    const top = toLayout(rect.top);
    const bottom = toLayout(rect.bottom);
    if (forceBreak) {
      forceBreak = false;
      moveWhole(unit, top);
    }
    if (unit.kind === 'manual') {
      forceBreak = true;
    } else if (bottom > pageStart + pageHeight + 0.5) {
      if (unit.kind === 'text') splitText(unit, rect, top, bottom);
      // Rows and atoms move whole, unless they already start the page.
      else if (top > pageStart + 1) moveWhole(unit, top);
    }
  };

  collectUnits(doc).forEach(place);

  // Content taller than one page with no breaks still needs pages to sit on.
  const contentBottom = toLayout(view.dom.getBoundingClientRect().bottom);
  pages = Math.max(pages, 1);
  const lastPageEnd = pageStart + pageHeight;
  if (contentBottom > lastPageEnd + 1) {
    pages += Math.ceil((contentBottom - lastPageEnd) / pageHeight);
  }

  // Positions must be in document order for the decoration set.
  spacers.sort((a, b) => a.pos - b.pos);
  if (current.length || spacers.length) {
    view.dispatch(
      view.state.tr
        .setMeta(paginationKey, spacers)
        .setMeta('addToHistory', false),
    );
  }
  release?.();
  return { pages, spacers: sameSpacers(current, spacers) ? current : spacers };
}
