import {
  html,
  LitElement,
  nothing,
  type PropertyValues,
  type SVGTemplateResult,
} from 'lit';
import { property, state } from 'lit/decorators.js';
import styles from './illustration.scss';
import IndividualComponent from '@/IndividualComponent.js';
import { warnOnce } from '@/__internal/utils/warn-once.js';
import {
  getLoadedIllustration,
  hasIllustration,
  loadIllustration,
  onIllustrationRegistered,
  type IllustrationName,
} from './registry.js';

/**
 * @label Illustration
 * @tag wc-illustration
 * @rawTag illustration
 * @summary A themed spot illustration for empty, error and success moments, such as no results, a 404 page or a finished payment.
 * @overview
 * <p>The illustration draws the art named by <code>name</code>. Peacock ships eighteen:
 * <code>empty</code>, <code>no-results</code>, <code>empty-inbox</code>,
 * <code>no-notifications</code>, <code>no-messages</code>, <code>no-files</code>,
 * <code>upload</code>, <code>not-found</code>, <code>server-error</code>, <code>error</code>,
 * <code>no-access</code>, <code>offline</code>, <code>maintenance</code>, <code>success</code>,
 * <code>welcome</code>, <code>empty-cart</code>, <code>no-team</code> and
 * <code>coming-soon</code>. Each one is a small module loaded the first time its name is shown;
 * <code>registerIllustration(name, art)</code> adds art of your own.</p>
 * <p>The art is drawn with the theme's color tokens, so it follows the theme and dark mode. The
 * <code>--illustration-*-color</code> custom properties recolor every illustration at once.</p>
 * <p>An illustration is decorative by default and hidden from assistive technology, because the
 * heading beside it says the same thing. Set <code>label</code> when the picture carries meaning
 * of its own; it then has <code>role="img"</code> with that name.</p>
 * <p><code>size</code> (<code>sm</code> 6rem, <code>md</code> 10rem, <code>lg</code> 15rem) sets
 * the width through <code>--illustration-size</code>; a width set in CSS still wins. The height
 * follows at 4:3. Compose empty, error and success screens from an illustration, a heading, text
 * and buttons; it replaces <code>wc-empty-state</code>.</p>
 *
 * @cssprop --illustration-size - Width of the illustration; the height follows at 4:3.
 * @cssprop --illustration-primary-color - Main accent of the art. Defaults to `--color-primary`.
 * @cssprop --illustration-primary-container-color - Soft fill of the subject. Defaults to `--color-primary-container`.
 * @cssprop --illustration-accent-color - Supporting details. Defaults to `--color-tertiary-container`.
 * @cssprop --illustration-accent-alt-color - Second supporting color. Defaults to `--color-secondary-container`.
 * @cssprop --illustration-surface-color - Bodies of objects such as paper and cards. Defaults to `--color-surface-bright`.
 * @cssprop --illustration-inset-color - Recessed areas and shadows. Defaults to `--color-surface-container-highest`.
 * @cssprop --illustration-backdrop-color - The round shape behind the subject. Defaults to `--color-surface-container-high`.
 * @cssprop --illustration-outline-color - Outlines of objects. Defaults to `--color-outline-variant`.
 * @cssprop --illustration-detail-color - Small details such as lines of text. Defaults to `--color-outline`.
 *
 * @example
 * ```html
 * <wc-illustration name="no-results"></wc-illustration>
 * <wc-illustration name="success" size="lg" label="Payment complete"></wc-illustration>
 * ```
 *
 * @tags display
 */
@IndividualComponent
export class Illustration extends LitElement {
  // ── Static
  static styles = [styles];

  // ── Properties
  /** The illustration to draw: a shipped name, or one added with `registerIllustration`. */
  @property({ type: String, reflect: true }) name: IllustrationName | string =
    '';

  /** The accessible name. Without it the illustration is decorative and hidden from assistive technology. */
  @property({ type: String }) label?: string;

  /** Width: `sm` (6rem), `md` (10rem, default) or `lg` (15rem). */
  @property({ type: String, reflect: true }) size: 'sm' | 'md' | 'lg' = 'md';

  // ── State
  /** The loaded art for `name`, or undefined while it loads or when the name is unknown. */
  @state() private __art?: SVGTemplateResult;

  // ── Private fields
  /** The load in flight for the current name, awaited by `updateComplete`. */
  private __loading?: Promise<void>;

  /** Stops listening for registrations. */
  private __unsubscribe?: () => void;

  // ── Lifecycle
  override connectedCallback() {
    super.connectedCallback();
    this.__unsubscribe = onIllustrationRegistered(name => {
      if (name === this.name) this.__resolve();
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.__unsubscribe?.();
    this.__unsubscribe = undefined;
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('name')) this.__resolve();
  }

  /** Also waits for the art of the current name to load. */
  protected override async getUpdateComplete(): Promise<boolean> {
    const result = await super.getUpdateComplete();
    if (!this.__loading) return result;
    // The load sets the art, which schedules another update; wait for that one too.
    await this.__loading;
    return this.getUpdateComplete();
  }

  // ── Private methods
  /** Shows the art for `name`: at once when it is loaded, else after it loads. */
  private __resolve() {
    const { name } = this;
    const loaded = getLoadedIllustration(name);
    this.__loading = undefined;
    this.__art = loaded;
    if (loaded || !name) return;
    if (!hasIllustration(name)) {
      warnOnce(
        `wc-illustration:${name}`,
        `[peacock] wc-illustration has no illustration named "${name}".`,
      );
      return;
    }
    const loading: Promise<void> = loadIllustration(name).then(
      art => {
        if (this.__loading !== loading) return;
        this.__loading = undefined;
        this.__art = art;
      },
      () => {
        if (this.__loading !== loading) return;
        this.__loading = undefined;
        warnOnce(
          `wc-illustration:${name}:load`,
          `[peacock] wc-illustration could not load the illustration "${name}".`,
        );
      },
    );
    this.__loading = loading;
  }

  // ── Render
  render() {
    if (!this.__art) return nothing;
    const { label } = this;
    return html`<svg
      class="art"
      viewBox="0 0 240 180"
      stroke-width="3"
      focusable="false"
      role=${label ? 'img' : nothing}
      aria-label=${label || nothing}
      aria-hidden=${label ? nothing : 'true'}
    >
      ${this.__art}
    </svg>`;
  }
}
