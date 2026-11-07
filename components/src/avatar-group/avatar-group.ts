import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import styles from './avatar-group.scss';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';

export type AvatarGroupSize = 'sm' | 'md' | 'lg';

/** What the overflow list shows for an avatar the group hides. */
interface HiddenAvatar {
  name: string;
  src?: string;
  label: string;
}

/**
 * @label Avatar Group
 * @tag wc-avatar-group
 * @rawTag avatar-group
 * @summary Shows a row of overlapping avatars, such as the members of a team, with a count of the rest.
 * @overview
 * <p>Put <code>wc-avatar</code> elements inside. They overlap, each separated from the next by a
 * ring in the surface color, and stack from the start edge, so from the right in RTL.
 * <code>size</code> (<code>sm</code>, <code>md</code>, <code>lg</code>) is passed down to every
 * avatar.</p>
 * <p>With <code>max</code>, the group shows the first <code>max</code> avatars and then a
 * <em>+N</em> button for the rest; its accessible name is "N more". Pressing it opens a popover
 * that lists the hidden avatars by name. Without <code>max</code>, or with fewer avatars, every
 * avatar shows and there is no button.</p>
 * <p>The group has <code>role="group"</code> and is named by <code>label</code>, "Members" by
 * default. Name each avatar with its <code>name</code> or <code>label</code>.</p>
 *
 * @slot - The `wc-avatar` elements.
 *
 * @cssprop --avatar-group-overlap - How far each avatar slides under the previous one. Defaults to a quarter of the avatar size.
 * @cssprop --avatar-group-ring-width - Width of the ring between avatars. Defaults to `2px`.
 * @cssprop --avatar-group-ring-color - Color of the ring between avatars. Defaults to `var(--color-surface)`; set it to the background the group sits on.
 *
 * @example
 * ```html
 * <wc-avatar-group max="3" label="Project members">
 *   <wc-avatar name="Ada Lovelace"></wc-avatar>
 *   <wc-avatar name="Grace Hopper"></wc-avatar>
 *   <wc-avatar name="Alan Turing"></wc-avatar>
 *   <wc-avatar name="Katherine Johnson"></wc-avatar>
 *   <wc-avatar name="Edsger Dijkstra"></wc-avatar>
 * </wc-avatar-group>
 * ```
 *
 * @tags display
 */
@IndividualComponent
export class AvatarGroup extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static override styles = [styles];

  /** The group chooses which children show, so it assigns them to its slot itself. */
  // eslint-disable-next-line no-undef
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    slotAssignment: 'manual',
  };

  // ── Properties ───────────────────────────────────────────────────────────

  /** How many avatars to show before the +N button. Unset, every avatar shows. */
  @property({ type: Number, reflect: true }) max?: number;

  /** Size of every avatar in the group: `sm`, `md` (default) or `lg`. */
  @property({ type: String, reflect: true }) size: AvatarGroupSize = 'md';

  /** The accessible name of the group. Defaults to "Members". */
  @property({ type: String }) label?: string;

  // ── State ────────────────────────────────────────────────────────────────

  /** Bumped when the children change, so the group renders again. */
  @state() private __childrenVersion = 0;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('slot') private readonly __slot!: HTMLSlotElement | null;

  // ── Private fields ───────────────────────────────────────────────────────

  private readonly i18n = new I18nController(this);

  /** Watches the children and the names on them. */
  private readonly __observer = new MutationObserver(() => {
    this.__childrenVersion += 1;
  });

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    this.__observer.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['name', 'src', 'label'],
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.__observer.disconnect();
  }

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    const items = this.__items();
    for (const item of items) {
      if (
        item.localName === 'wc-avatar' &&
        item.getAttribute('size') !== this.size
      ) {
        item.setAttribute('size', this.size);
      }
    }
    this.__slot?.assign(...items.slice(0, this.__visibleCount(items.length)));
  }

  // ── Private methods ──────────────────────────────────────────────────────

  /** The element children, in order. */
  private __items(): HTMLElement[] {
    return Array.from(this.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement,
    );
  }

  /** How many of `total` items show. */
  private __visibleCount(total: number): number {
    const max = Math.floor(Number(this.max));
    if (!Number.isFinite(max) || max < 0) return total;
    return Math.min(max, total);
  }

  private __describe(item: HTMLElement): HiddenAvatar {
    const name = item.getAttribute('name') ?? '';
    const label =
      item.getAttribute('label') ||
      name ||
      item.getAttribute('aria-label') ||
      (item.textContent ?? '').trim();
    return { name, src: item.getAttribute('src') ?? undefined, label };
  }

  /** The overflow popover's `open` / `close` are internal; they would escape as the group's. */
  // eslint-disable-next-line class-methods-use-this
  private __stopPopoverEvent(event: Event) {
    event.stopPropagation();
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private __renderOverflow(hidden: HTMLElement[]) {
    if (hidden.length === 0) return nothing;
    const count = new Intl.NumberFormat(this.i18n.locale).format(hidden.length);
    const moreLabel = this.i18n.t('avatarGroupMore')(count);
    return html`<wc-popover
      class="overflow"
      trigger="click"
      placement="bottom-start"
      label=${moreLabel}
      @open=${this.__stopPopoverEvent}
      @close=${this.__stopPopoverEvent}
    >
      <button class="more" type="button" aria-label=${moreLabel}>
        +${count}
      </button>
      <wc-popover-content>
        <ul class="list">
          ${hidden.map(item => {
            const { name, src, label } = this.__describe(item);
            return html`<li class="list-item">
              <wc-avatar
                size="sm"
                name=${name}
                src=${src ?? nothing}
                aria-hidden="true"
              ></wc-avatar>
              <span class="list-label">${label}</span>
            </li>`;
          })}
        </ul>
      </wc-popover-content>
    </wc-popover>`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  override render() {
    const items = this.__items();
    const hidden = items.slice(this.__visibleCount(items.length));
    return html`<div
      class="group"
      role="group"
      aria-label=${this.label || this.i18n.t('avatarGroupLabel')}
    >
      <slot></slot>
      ${this.__renderOverflow(hidden)}
    </div>`;
  }
}
