import { html, LitElement, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import IndividualComponent from '@/IndividualComponent.js';
import { resolveLocale } from '@/__internal/i18n/locale.js';
import { findMatches, type HighlightRange, mergeRanges } from './matches.js';
import styles from './highlight.scss';

export type { HighlightRange } from './matches.js';

/**
 * @label Highlight
 * @tag wc-highlight
 * @rawTag highlight
 *
 * @summary Marks the words of a search query in a piece of text.
 * @overview
 * <p>Highlight shows its text with each word of <code>query</code> marked, for search results in a
 * knowledge base, a site search or a filtered list. Words match on their own, in any order,
 * ignoring case and accents, so "resume" marks "Résumé".</p>
 * <p>It reads its children as plain text and never parses HTML, so text from records or a search
 * index is safe to put in it. When the server already knows where the matches are, set
 * <code>ranges</code> instead of <code>query</code>.</p>
 * <p>Marks use the tertiary container colour, so they differ from links and from the selection.</p>
 *
 * @slot - The text. Only its text content is used; markup in it is not rendered.
 *
 * @csspart mark - Each marked run of text, a `<mark>` element.
 *
 * @cssprop --highlight-background - Background of the marks. Defaults to `--color-tertiary-container`.
 * @cssprop --highlight-color - Text colour of the marks. Defaults to `--color-on-tertiary-container`.
 *
 * @example
 * ```html
 * <wc-highlight query="reset password">
 *   If you forgot your password, choose Forgot password and reset it from the link we email you.
 * </wc-highlight>
 * ```
 * @tags display search
 */
@IndividualComponent
export class Highlight extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** The search query whose words are marked. */
  @property({ reflect: true })
  query = '';

  /**
   * Runs to mark, as `[start, end)` offsets in the element's `textContent`, for matches the server
   * already found. When set, `query` is ignored.
   */
  @property({ attribute: false })
  ranges?: HighlightRange[];

  /** The language to fold case in. Defaults to the nearest `lang`, else the browser's. */
  @property({ reflect: true })
  locale?: string;

  // ── State ────────────────────────────────────────────────────────────────

  /** The element's text content. */
  @state() private text = '';

  // ── Private fields ───────────────────────────────────────────────────────

  /** Watches the text, so the marks follow when it changes. */
  private readonly textObserver = new MutationObserver(() => this.syncText());

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    this.syncText();
    this.textObserver.observe(this, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  override disconnectedCallback() {
    this.textObserver.disconnect();
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    this.syncText();
  }

  // ── Private methods ──────────────────────────────────────────────────────

  /** The runs to mark, as `[start, end)` offsets in the text. */
  private get marks(): HighlightRange[] {
    if (this.ranges) return mergeRanges(this.ranges, this.text.length);
    return findMatches(this.text, this.query, resolveLocale(this.locale, this));
  }

  private syncText() {
    // Kept as is, so `ranges` offsets match the text; CSS collapses the whitespace when it renders.
    const text = this.textContent ?? '';
    if (text !== this.text) this.text = text;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const { text } = this;
    const pieces = [];
    let at = 0;
    for (const [start, end] of this.marks) {
      if (start > at) pieces.push(text.slice(at, start));
      pieces.push(html`<mark part="mark">${text.slice(start, end)}</mark>`);
      at = end;
    }
    if (at < text.length) pieces.push(text.slice(at));
    return html`${pieces}`;
  }
}
