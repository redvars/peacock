import { html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import styles from './page-header.scss';

/** Heading levels the headline can take. */
export type PageHeaderHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** The slots whose wrappers hide while empty. */
const SLOTS = ['breadcrumb', 'start', 'actions', 'meta', 'tabs'] as const;

type SlotName = (typeof SLOTS)[number];

/**
 * @label Page Header
 * @tag wc-page-header
 * @rawTag page-header
 *
 * @summary The top of a page: title, supporting text, breadcrumb, actions, metadata and tabs.
 * @overview
 * <p>Page header names the page with <code>headline</code>, an <code>&lt;h1&gt;</code> by default
 * (<code>heading-level</code> picks another level, for a header inside a section), and
 * <code>supporting-text</code> under it.</p>
 * <p>Slots fill the rest: <code>breadcrumb</code> above the title, <code>start</code> before it
 * (an avatar or icon), <code>meta</code> under it (tags, a status, timestamps),
 * <code>actions</code> at the end (buttons) and <code>tabs</code> along the bottom edge (a
 * <code>wc-tabs</code>). <code>back-href</code> adds a round back link before the title, named by
 * <code>back-label</code> (<em>Back</em> by default).</p>
 * <p>The header responds to its own width: on narrow containers the actions wrap onto their own
 * row under the title and the headline steps down a size.</p>
 *
 * @slot breadcrumb - A `wc-breadcrumb` above the title.
 * @slot start - An avatar or icon before the title.
 * @slot meta - Tags, status and timestamps under the title.
 * @slot actions - Buttons at the end; they wrap on narrow widths.
 * @slot tabs - A `wc-tabs` along the bottom edge.
 *
 * @csspart headline - The heading element.
 * @csspart supporting-text - The supporting text.
 * @csspart back - The back link.
 *
 * @cssprop --page-header-padding-block - Space above and below the header. Defaults to `--spacing-300`.
 * @cssprop --page-header-padding-inline - Space at the start and end. Defaults to `--spacing-300`.
 * @cssprop --page-header-background - Background of the header. Defaults to transparent.
 *
 * @example
 * ```html
 * <wc-page-header
 *   headline="Quarterly report"
 *   supporting-text="Revenue, costs and headcount for Q3"
 *   back-href="/reports"
 *   back-label="All reports"
 * >
 *   <wc-breadcrumb slot="breadcrumb">…</wc-breadcrumb>
 *   <wc-tag slot="meta">Draft</wc-tag>
 *   <wc-button slot="actions" variant="outlined">Share</wc-button>
 *   <wc-button slot="actions">Publish</wc-button>
 *   <wc-tabs slot="tabs">…</wc-tabs>
 * </wc-page-header>
 * ```
 * @tags layout
 */
@IndividualComponent
export class PageHeader extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** The page title. */
  @property() headline = '';

  /** Text under the title. */
  @property({ attribute: 'supporting-text' }) supportingText = '';

  /** Level of the headline's heading element, 1 to 6. */
  @property({ type: Number, attribute: 'heading-level' })
  headingLevel: PageHeaderHeadingLevel = 1;

  /** URL of the back link before the title; without it there is no back link. */
  @property({ attribute: 'back-href' }) backHref = '';

  /** Accessible name of the back link. Defaults to "Back". */
  @property({ attribute: 'back-label' }) backLabel = '';

  // ── State ────────────────────────────────────────────────────────────────

  /** Which slots have content, so empty wrappers take no space. */
  @state() private filled: Record<SlotName, boolean> = {
    breadcrumb: false,
    start: false,
    actions: false,
    meta: false,
    tabs: false,
  };

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings for the back link. */
  private readonly i18n = new I18nController(this);

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    this.syncSlots();
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private syncSlots = () => {
    const filled = { ...this.filled };
    let changed = false;
    for (const name of SLOTS) {
      const has = !!this.querySelector(`:scope > [slot="${name}"]`);
      if (filled[name] !== has) {
        filled[name] = has;
        changed = true;
      }
    }
    if (changed) this.filled = filled;
  };

  /** The heading level, kept to 1–6 whatever was set. */
  private get level(): PageHeaderHeadingLevel {
    const level = Math.round(Number(this.headingLevel));
    if (!Number.isFinite(level)) return 1;
    return Math.min(6, Math.max(1, level)) as PageHeaderHeadingLevel;
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderSlot(name: SlotName) {
    return html`<div class=${name} ?hidden=${!this.filled[name]}>
      <slot name=${name} @slotchange=${this.syncSlots}></slot>
    </div>`;
  }

  private renderBack() {
    if (!this.backHref) return nothing;
    return html`<wc-icon-button
      class="back"
      part="back"
      variant="text"
      shape="round"
      href=${this.backHref}
      aria-label=${this.backLabel || this.i18n.t('back')}
    >
      <wc-icon name="arrow_back"></wc-icon>
    </wc-icon-button>`;
  }

  private renderHeadline() {
    if (!this.headline) return nothing;
    // The tag comes from a clamped number, so it is always h1–h6.
    const tag = unsafeStatic(`h${this.level}`);
    return staticHtml`<${tag} class="headline" part="headline">${this.headline}</${tag}>`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    return html`
      <div
        class=${classMap({ 'page-header': true, 'has-tabs': this.filled.tabs })}
        part="base"
      >
        ${this.renderSlot('breadcrumb')}
        <div class="row">
          <div class="title-row">
            ${this.renderBack()} ${this.renderSlot('start')}
            <div class="titles">
              ${this.renderHeadline()}
              ${this.supportingText
                ? html`<p class="supporting-text" part="supporting-text">
                    ${this.supportingText}
                  </p>`
                : nothing}
              ${this.renderSlot('meta')}
            </div>
          </div>
          ${this.renderSlot('actions')}
        </div>
        ${this.renderSlot('tabs')}
      </div>
    `;
  }
}
