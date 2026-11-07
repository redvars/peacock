import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { PeacockStrings } from '@/__internal/i18n/strings.js';
import { diffTexts, type DiffLine, type DiffResult } from './diff.js';
import styles from './diff-viewer.scss';

/** How a diff viewer lays out the two texts. */
export type DiffViewerView = 'unified' | 'split';

/** A run of visible lines, or of hidden unchanged lines shown as a separator. */
type Segment =
  | { kind: 'lines'; lines: DiffLine[] }
  | { kind: 'gap'; start: number; lines: DiffLine[] };

/** A row of the split view: the old side's line, the new side's, or both for unchanged lines. */
interface SplitRow {
  old: DiffLine | null;
  new: DiffLine | null;
}

/**
 * @label Diff Viewer
 * @tag wc-diff-viewer
 * @rawTag diff-viewer
 *
 * @summary Shows what changed between two texts, such as two versions of a config or document.
 * @overview
 * <p>The viewer compares <code>old-value</code> and <code>new-value</code> line by line
 * (Myers' algorithm) and marks the changed words inside each pair of changed lines. A summary
 * such as "3 additions, 2 deletions" sits at the top. Unchanged lines more than
 * <code>context</code> lines (default 3) away from a change fold into a "Show 24 unchanged lines"
 * button that expands them.</p>
 * <p><code>view="unified"</code> (the default) lists removed lines before the added lines that
 * replace them, with old and new line numbers; <code>view="split"</code> puts the old text on the
 * left and the new text on the right (code reads left to right, also in right-to-left pages).</p>
 * <p>Lines are compared without their line endings, so CRLF and LF texts match; a note says when
 * the endings differ. A last line without a line break is marked when the other side has one.
 * Texts that are too different or too large to compare line by line within a time budget are
 * shown as the changed part removed and then added, with a note.</p>
 * <p>The diff is a table: each row is a line, removed and added lines carry a <code>−</code> or
 * <code>+</code> marker besides their color, and screen readers hear "Removed line 12" or
 * "Added line 13" before the text. The text is shown plain, without syntax highlighting.</p>
 *
 * @cssprop --diff-viewer-background - Block background. Defaults to `--color-surface-container-low`.
 * @cssprop --diff-viewer-border-color - Block border color. Defaults to `--color-outline-variant`.
 * @cssprop --diff-viewer-shape - Block corner radius. Defaults to `--shape-corner-medium`.
 * @cssprop --diff-viewer-foreground - Text color. Defaults to `--color-on-surface`.
 * @cssprop --diff-viewer-max-height - Caps the height of the lines; they scroll beyond. Defaults to `none`.
 * @cssprop --diff-viewer-added-color - Hue of added lines and words. Defaults to `--color-success`.
 * @cssprop --diff-viewer-removed-color - Hue of removed lines and words. Defaults to `--color-error`.
 *
 * @csspart container - The outer block.
 * @csspart header - The row with the label and the summary.
 * @csspart summary - The additions and deletions summary.
 * @csspart content - The scrollable area holding the table.
 *
 * @example
 * ```html
 * <wc-diff-viewer
 *   label="config.yaml"
 *   old-value="port: 8080&#10;host: localhost&#10;"
 *   new-value="port: 9090&#10;host: localhost&#10;debug: true&#10;"
 * ></wc-diff-viewer>
 * ```
 *
 * @example
 * ```html
 * <wc-diff-viewer view="split" context="1" old-value="a&#10;b&#10;c" new-value="a&#10;B&#10;c"></wc-diff-viewer>
 * ```
 *
 * @tags display
 */
@IndividualComponent
export class DiffViewer extends LitElement {
  // ── Static ────────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ────────────────────────────────────────────────────────────

  /** The text before the change. */
  @property({ attribute: 'old-value', type: String })
  oldValue: string = '';

  /** The text after the change. */
  @property({ attribute: 'new-value', type: String })
  newValue: string = '';

  /** `unified` lists both sides in one column; `split` shows them side by side. */
  @property({ type: String, reflect: true })
  view: DiffViewerView = 'unified';

  /** Unchanged lines shown around each change; the rest fold into separators. */
  @property({ type: Number })
  context: number = 3;

  /** Title shown in the header, such as a file name; also the table's accessible name. */
  @property({ type: String })
  label: string = '';

  /** Wraps long lines instead of scrolling horizontally. */
  @property({ type: Boolean, reflect: true })
  wrap: boolean = false;

  /** Overrides Peacock's strings for this instance only. */
  @property({ attribute: false }) strings?: Partial<PeacockStrings>;

  // ── State ─────────────────────────────────────────────────────────────────

  /** The diff of the current texts. */
  @state() private _diff: DiffResult = diffTexts('', '');

  /** Start indexes of the separators the person expanded. */
  @state() private _expanded = new Set<number>();

  // ── Private fields ────────────────────────────────────────────────────────

  private readonly i18n = new I18nController(this);

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  protected override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (changed.has('oldValue') || changed.has('newValue')) {
      this._diff = diffTexts(this.oldValue ?? '', this.newValue ?? '');
      this._expanded = new Set();
    }
  }

  // ── Public methods ────────────────────────────────────────────────────────

  /** Number of added lines. */
  get additions(): number {
    return this._diff.additions;
  }

  /** Number of removed lines. */
  get deletions(): number {
    return this._diff.deletions;
  }

  // ── Private methods ───────────────────────────────────────────────────────

  private __format(value: number): string {
    return new Intl.NumberFormat(this.i18n.locale).format(value);
  }

  /** Splits the lines into visible runs and folded runs of unchanged lines. */
  private __segments(): Segment[] {
    const { lines } = this._diff;
    const context = Math.max(0, Number.isNaN(this.context) ? 3 : this.context);
    const visible = new Uint8Array(lines.length);
    lines.forEach((line, index) => {
      if (line.type === 'equal') return;
      const from = Math.max(0, index - context);
      const to = Math.min(lines.length - 1, index + context);
      for (let i = from; i <= to; i += 1) visible[i] = 1;
    });

    const segments: Segment[] = [];
    let index = 0;
    while (index < lines.length) {
      const shown = visible[index] === 1;
      let end = index;
      while (end < lines.length && (visible[end] === 1) === shown) end += 1;
      const run = lines.slice(index, end);
      // A single hidden line takes as much room as its separator, so it is shown.
      if (shown || run.length < 2 || this._expanded.has(index)) {
        const last = segments[segments.length - 1];
        if (last?.kind === 'lines') last.lines.push(...run);
        else segments.push({ kind: 'lines', lines: run });
      } else {
        segments.push({ kind: 'gap', start: index, lines: run });
      }
      index = end;
    }
    return segments;
  }

  /** Pairs removed and added lines of each change block into side-by-side rows. */
  // eslint-disable-next-line class-methods-use-this
  private __splitRows(lines: DiffLine[]): SplitRow[] {
    const rows: SplitRow[] = [];
    let removed: DiffLine[] = [];
    let added: DiffLine[] = [];
    const flush = () => {
      for (let i = 0; i < Math.max(removed.length, added.length); i += 1) {
        rows.push({ old: removed[i] ?? null, new: added[i] ?? null });
      }
      removed = [];
      added = [];
    };
    for (const line of lines) {
      if (line.type === 'removed') removed.push(line);
      else if (line.type === 'added') added.push(line);
      else {
        flush();
        rows.push({ old: line, new: line });
      }
    }
    flush();
    return rows;
  }

  private __expand(start: number) {
    this._expanded = new Set(this._expanded).add(start);
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  private __renderText(line: DiffLine, side: 'old' | 'new') {
    let marker = ' ';
    let srText = '';
    if (line.type === 'removed') {
      marker = '−';
      srText = this.i18n.t('diffRemovedLine')(
        this.__format(line.oldNumber ?? 0),
      );
    } else if (line.type === 'added') {
      marker = '+';
      srText = this.i18n.t('diffAddedLine')(this.__format(line.newNumber ?? 0));
    }
    const content = line.segments
      ? line.segments.map(segment =>
          segment.changed
            ? html`<span class="word">${segment.text}</span>`
            : segment.text,
        )
      : line.text;
    // No whitespace between tags: the text keeps its white space.
    return html`<td class="text" data-side=${side}>
      <span class="marker" aria-hidden="true">${marker}</span>${srText
        ? html`<span class="sr-only">${srText} </span>`
        : nothing}<span class="code">${content}</span>${line.noNewline
        ? html`<span class="no-newline">${this.i18n.t('diffNoNewline')}</span>`
        : nothing}
    </td>`;
  }

  // eslint-disable-next-line class-methods-use-this
  private __renderNumber(value: number | undefined) {
    return html`<td class="number" aria-hidden="true">${value ?? ''}</td>`;
  }

  private __renderGap(segment: Segment & { kind: 'gap' }, columns: number) {
    const count = segment.lines.length;
    return html`<tr class="gap">
      <td colspan=${columns}>
        <wc-button
          class="gap-button"
          variant="text"
          size="xs"
          @click=${() => this.__expand(segment.start)}
        >
          <wc-icon slot="icon" name="unfold_more"></wc-icon>
          ${this.i18n.t('diffShowUnchanged')(count, this.__format(count))}
        </wc-button>
      </td>
    </tr>`;
  }

  private __renderUnified(segments: Segment[]) {
    return html`<thead class="sr-only">
        <tr>
          <th aria-hidden="true"></th>
          <th aria-hidden="true"></th>
          <th scope="col">${this.label || this.i18n.t('diffViewer')}</th>
        </tr>
      </thead>
      <tbody>
        ${segments.map(segment =>
          segment.kind === 'gap'
            ? this.__renderGap(segment, 3)
            : segment.lines.map(
                line =>
                  html`<tr class="line" data-type=${line.type}>
                    ${this.__renderNumber(line.oldNumber)}${this.__renderNumber(
                      line.newNumber,
                    )}${this.__renderText(
                      line,
                      line.type === 'added' ? 'new' : 'old',
                    )}
                  </tr>`,
              ),
        )}
      </tbody>`;
  }

  private __renderSplitCells(line: DiffLine | null, side: 'old' | 'new') {
    if (!line) {
      return html`<td class="number" aria-hidden="true"></td>
        <td class="text empty" data-side=${side}></td>`;
    }
    return html`${this.__renderNumber(
      side === 'old' ? line.oldNumber : line.newNumber,
    )}${this.__renderText(line, side)}`;
  }

  private __renderSplit(segments: Segment[]) {
    return html`<colgroup>
        <col class="number-column" />
        <col class="text-column" />
        <col class="number-column" />
        <col class="text-column" />
      </colgroup>
      <thead class="sr-only">
        <tr>
          <th aria-hidden="true"></th>
          <th scope="col">${this.i18n.t('diffOld')}</th>
          <th aria-hidden="true"></th>
          <th scope="col">${this.i18n.t('diffNew')}</th>
        </tr>
      </thead>
      <tbody>
        ${segments.map(segment =>
          segment.kind === 'gap'
            ? this.__renderGap(segment, 4)
            : this.__splitRows(segment.lines).map(
                row =>
                  html`<tr
                    class="line"
                    data-old-type=${row.old?.type ?? 'none'}
                    data-new-type=${row.new?.type ?? 'none'}
                  >
                    ${this.__renderSplitCells(row.old, 'old')}
                    ${this.__renderSplitCells(row.new, 'new')}
                  </tr>`,
              ),
        )}
      </tbody>`;
  }

  private __renderNotes() {
    const { approximate, lineEndings } = this._diff;
    if (!approximate && !lineEndings) return nothing;
    return html`<div class="notes">
      ${approximate
        ? html`<p class="note">
            <wc-icon name="info"></wc-icon>${this.i18n.t('diffApproximate')}
          </p>`
        : nothing}
      ${lineEndings
        ? html`<p class="note">
            <wc-icon name="info"></wc-icon>${this.i18n.t('diffLineEndings')(
              lineEndings.old,
              lineEndings.new,
            )}
          </p>`
        : nothing}
    </div>`;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  render() {
    const { additions, deletions } = this._diff;
    const summary =
      additions === 0 && deletions === 0
        ? this.i18n.t('diffNoChanges')
        : this.i18n.t('diffSummary')(
            additions,
            deletions,
            this.__format(additions),
            this.__format(deletions),
          );
    const segments = this.__segments();
    const split = this.view === 'split';

    return html`
      <div
        class=${classMap({ 'code-block': true, wrap: this.wrap, split })}
        part="container"
      >
        <div class="header" part="header">
          ${this.label
            ? html`<div class="title" part="title">${this.label}</div>`
            : nothing}
          <div class="summary" id="summary" part="summary">${summary}</div>
        </div>
        ${this.__renderNotes()}
        ${segments.length > 0
          ? html`<div class="content" part="content" dir="ltr" tabindex="0">
              <table
                class="diff"
                aria-label=${this.label || this.i18n.t('diffViewer')}
                aria-describedby="summary"
              >
                ${split
                  ? this.__renderSplit(segments)
                  : this.__renderUnified(segments)}
              </table>
            </div>`
          : nothing}
      </div>
    `;
  }
}
