import { html, LitElement, nothing, svg, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { Avatar } from '@/avatar/avatar.js';
import IndividualComponent from '@/IndividualComponent.js';

import styles from './presence-indicator.scss';

/** Whether a person is available. */
export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline';

/** Size of the dot; the same names as the avatar sizes. */
export type PresenceIndicatorSize = 'sm' | 'md' | 'lg';

/**
 * One shape per status, so presence does not rest on color alone: a filled circle (online), a
 * crescent moon (away), a circle with a dash (busy) and a hollow ring (offline). Parts drawn in
 * the ring color (`cutout`) read as holes.
 */
const SHAPES = {
  online: svg`<circle cx="6" cy="6" r="6" class="fill"></circle>`,
  away: svg`<path d="M6 0A6 6 0 1 0 12 6 4.5 4.5 0 0 1 6 0Z" class="fill"></path>`,
  busy: svg`<circle cx="6" cy="6" r="6" class="fill"></circle><rect x="2.5" y="4.75" width="7" height="2.5" rx="1.25" class="cutout"></rect>`,
  offline: svg`<circle cx="6" cy="6" r="6" class="fill"></circle><circle cx="6" cy="6" r="3.25" class="cutout"></circle>`,
};

/** The string key of each status's name. */
const STATUS_NAMES = {
  online: 'presenceOnline',
  away: 'presenceAway',
  busy: 'presenceBusy',
  offline: 'presenceOffline',
} as const;

const AVATAR_SIZES: readonly string[] = ['sm', 'md', 'lg'];

function isAvatar(element: Element): element is Avatar {
  return element.localName === 'wc-avatar';
}

/**
 * @label Presence Indicator
 * @tag wc-presence-indicator
 * @rawTag presence-indicator
 * @summary A small online, away, busy or offline dot on the corner of a person's avatar.
 *
 * @overview
 * <p>A presence indicator shows whether a person is available, in chat, collaboration and people
 * lists. Wrap an avatar in it and the dot sits on the avatar's bottom-end corner (bottom right,
 * or bottom left in right-to-left pages) inside a ring of the surface color, sized to the
 * avatar:</p>
 * <pre><code>&lt;wc-presence-indicator status="online"&gt;
 *   &lt;wc-avatar name="Ana Lima"&gt;&lt;/wc-avatar&gt;
 * &lt;/wc-presence-indicator&gt;</code></pre>
 * <p><code>status</code> is <code>online</code>, <code>away</code>, <code>busy</code> or
 * <code>offline</code> (the default). Each has its own shape as well as its own color, so it does
 * not rest on color alone, and forced-colors mode keeps the shapes: a filled circle (online), a
 * crescent moon (away), a circle with a dash (busy) and a hollow ring (offline).</p>
 * <p>The status is part of the person's name, not a separate announcement: a wrapped
 * <code>wc-avatar</code> is named "Ana Lima, online" (its <code>label</code> attribute, else its
 * <code>name</code>, then the status). Other wrapped content, such as an <code>img</code>, is
 * followed by the status as screen-reader text. On its own, without content, the dot is an image
 * named by the status. <code>label</code> replaces the status text, such as "In a meeting".</p>
 * <p><code>size</code> follows the wrapped avatar's size; set it for a dot on its own, or to
 * override.</p>
 * <p>Which one to use: <code>wc-presence-indicator</code> for a person's availability, attached to
 * their avatar, where the four statuses and their shapes are fixed and people recognise them from
 * chat apps. <code>wc-status-indicator</code> for the state of a thing (a service, a job, a
 * device) shown as a dot and a visible label next to its name, with the general intents
 * (<code>info</code>, <code>success</code>, <code>warning</code>, <code>danger</code>). A
 * person's status written out in a list or a profile ("Away") can be either; prefer the status
 * indicator when the label is visible.</p>
 *
 * @cssprop --presence-indicator-color - Color of the dot; defaults to the status's color.
 * @cssprop --presence-indicator-ring-color - Color of the ring around the dot and of its holes; defaults to the surface color. Set it to the background behind the avatar.
 *
 * @example
 * ```html
 * <wc-presence-indicator status="online"><wc-avatar name="Ana Lima"></wc-avatar></wc-presence-indicator>
 * <wc-presence-indicator status="away"><wc-avatar name="Grace Hopper"></wc-avatar></wc-presence-indicator>
 * <wc-presence-indicator status="busy"><wc-avatar name="Ada Lovelace" size="lg"></wc-avatar></wc-presence-indicator>
 * <wc-presence-indicator status="offline"><wc-avatar name="Alan Turing" size="sm"></wc-avatar></wc-presence-indicator>
 * ```
 * @example
 * ```html
 * <wc-presence-indicator status="busy" label="In a meeting"></wc-presence-indicator>
 * ```
 * @tags display
 */
@IndividualComponent
export class PresenceIndicator extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** Whether the person is available: `online`, `away`, `busy` or `offline` (default). */
  @property({ type: String, reflect: true })
  status: PresenceStatus = 'offline';

  /** Replaces the status text in the accessible name, such as "In a meeting". */
  @property({ type: String })
  label = '';

  /** Size of the dot: `sm`, `md` or `lg`. Defaults to the wrapped avatar's size, else `md`. */
  @property({ type: String, reflect: true })
  size?: PresenceIndicatorSize;

  /** Elements in the default slot. */
  @state() private content: Element[] = [];

  /** Bumped when a wrapped avatar's name, label or size changes. */
  @state() private avatarRevision = 0;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings for the status names. */
  private readonly i18n = new I18nController(this);

  /** Avatars whose `label` this indicator set, to restore when they leave. */
  private labelled = new Set<Avatar>();

  /** Watches wrapped avatars' `name`, `label` and `size` attributes. */
  private readonly avatarObserver = new MutationObserver(() => {
    this.avatarRevision += 1;
  });

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.avatarObserver.disconnect();
    for (const avatar of this.labelled) this.restoreLabel(avatar);
    this.labelled.clear();
  }

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    this.labelAvatars();
  }

  // ── Private methods ──────────────────────────────────────────────────────

  /** The status in effect; unknown values are offline. */
  private get resolvedStatus(): PresenceStatus {
    return this.status in SHAPES ? this.status : 'offline';
  }

  /** The status as words: `label`, else the status's name. */
  private get statusText(): string {
    return this.label || this.i18n.t(STATUS_NAMES[this.resolvedStatus]);
  }

  private get avatars(): Avatar[] {
    return this.content.filter(isAvatar);
  }

  /** The dot's size: `size`, else the first wrapped avatar's, else `md`. */
  private get resolvedSize(): PresenceIndicatorSize {
    if (this.size && AVATAR_SIZES.includes(this.size)) return this.size;
    const avatarSize = this.avatars[0]?.getAttribute('size') ?? 'md';
    return (
      AVATAR_SIZES.includes(avatarSize) ? avatarSize : 'md'
    ) as PresenceIndicatorSize;
  }

  private handleSlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;
    const content = slot.assignedElements({ flatten: true });
    for (const avatar of this.labelled) {
      if (!content.includes(avatar)) this.restoreLabel(avatar);
    }
    this.content = content;
    this.avatarObserver.disconnect();
    for (const avatar of this.avatars) {
      this.avatarObserver.observe(avatar, {
        attributes: true,
        attributeFilter: ['name', 'label', 'size'],
      });
    }
  }

  /** Names each wrapped avatar after its person and the status, such as "Ana Lima, online". */
  private labelAvatars() {
    const status = this.statusText;
    for (const avatar of this.avatars) {
      const base = avatar.getAttribute('label') || avatar.name || '';
      avatar.label = this.i18n.t('presenceLabel')(base, status);
      this.labelled.add(avatar);
    }
  }

  /** Gives an avatar back its own `label` attribute (or none). */
  private restoreLabel(avatar: Avatar) {
    // eslint-disable-next-line no-param-reassign
    avatar.label = avatar.getAttribute('label') ?? undefined;
    this.labelled.delete(avatar);
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const status = this.resolvedStatus;
    const standalone = this.content.length === 0;
    const describesOther = !standalone && this.avatars.length === 0;
    return html`<slot @slotchange=${this.handleSlotChange}></slot
      ><span
        class=${classMap({
          dot: true,
          attached: !standalone,
          [`size-${this.resolvedSize}`]: true,
        })}
        part="dot"
        role=${standalone ? 'img' : nothing}
        aria-label=${standalone ? this.statusText : nothing}
        aria-hidden=${standalone ? nothing : 'true'}
        ><svg class="shape" viewBox="0 0 12 12" focusable="false">
          ${SHAPES[status]}
        </svg></span
      >${describesOther
        ? html`<span class="screen-reader-only">${this.statusText}</span>`
        : nothing}`;
  }
}
