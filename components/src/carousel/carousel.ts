import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import { isRtl } from '@/__internal/i18n/locale.js';
import styles from './carousel.scss';

/** Detail of the `change` event. */
export interface CarouselChangeDetail {
  /** The first slide in view, from 0. */
  index: number;
}

/** A slide is never drawn narrower than this, so `per-view` drops on narrow screens. */
const MIN_SLIDE_WIDTH = 240;

/** With more pages than this, a "3 of 9" counter replaces the picker buttons. */
const MAX_PICKERS = 7;

/** How long the track must be still before a scroll counts as settled, in milliseconds. */
const SETTLE_DELAY = 100;

/** Marks a slide name the carousel wrote, so it can rewrite it and leave the app's own alone. */
const OWN_LABEL = 'data-carousel-label';

/**
 * @label Carousel
 * @tag wc-carousel
 * @rawTag carousel
 *
 * @summary A row of slides shown one or a few at a time, with previous and next buttons and pickers.
 * @overview
 * <p>Carousel shows its children as slides, <code>per-view</code> at a time, for screenshots on a
 * product page or a row of testimonials. The slides scroll with snap points, so touch swipe,
 * trackpads and the scroll wheel work as they do anywhere else, and previous, next and picker
 * buttons sit under them. With more than seven pages a "3 of 9" counter replaces the pickers.</p>
 * <p>Each slide is never narrower than 15rem, so a carousel of three drops to two and then one as its
 * container narrows. Slides out of view are <code>inert</code>, so Tab never reaches a link the
 * person cannot see.</p>
 * <p>Slides do not move on their own unless you set <code>autoplay</code>, and then a button to stop
 * them comes first in the controls. Rotation pauses while the pointer rests on the carousel or focus
 * is inside it, stops for good when the person uses any control, and does not start at all when the
 * person asks for reduced motion.</p>
 *
 * @slot - The slides: any elements, one per slide. Give a slide an `aria-label` to name it; otherwise it is named "2 of 5".
 *
 * @csspart base - The carousel region.
 * @csspart track - The scrolling row of slides.
 * @csspart controls - The row of buttons under the slides.
 *
 * @cssprop --carousel-gap - Space between slides. Defaults to `--spacing-200`.
 *
 * @fires {CustomEvent<CarouselChangeDetail>} change - Dispatched when the slides in view change because the person used a control or scrolled, or autoplay moved on.
 *
 * @example
 * ```html
 * <wc-carousel label="Testimonials" per-view="3">
 *   <blockquote>We moved our incident process off spreadsheets in a week.</blockquote>
 *   <blockquote>Our customer portal runs on the same rules as the agents' workspace.</blockquote>
 *   <blockquote>Self-hosting took one command and a coffee.</blockquote>
 * </wc-carousel>
 * ```
 * @example
 * ```html
 * <wc-carousel label="Product screenshots" autoplay loop>
 *   <img src="/img/workspace.webp" alt="The ITSM workspace" />
 *   <img src="/img/portal.webp" alt="The customer portal" />
 * </wc-carousel>
 * ```
 * @tags media layout
 */
@IndividualComponent
export class Carousel extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** What the slides are, such as "Testimonials": the name of the carousel region. */
  @property({ reflect: true })
  label = '';

  /** How many slides show at once. Fewer show when the carousel is too narrow for them. */
  @property({ type: Number, attribute: 'per-view', reflect: true })
  perView = 1;

  /** The first slide in view, from 0. */
  @property({ type: Number, reflect: true })
  index = 0;

  /** Whether previous and next wrap around from the last page to the first and back. */
  @property({ type: Boolean, reflect: true })
  loop = false;

  /** Whether the slides move on by themselves. A stop button comes first in the controls. */
  @property({ type: Boolean, reflect: true })
  autoplay = false;

  /** How long each page shows while `autoplay` runs, in milliseconds. */
  @property({ type: Number })
  interval = 5000;

  // ── State ────────────────────────────────────────────────────────────────

  @state() private slideCount = 0;

  /** How many slides fit: `per-view`, or fewer when the carousel is narrow. */
  @state() private visible = 1;

  /** Whether autoplay rotates the slides: off once the person stops it or uses a control. */
  @state() private rotating = false;

  /** Whether the pointer or focus is inside, which pauses rotation. */
  @state() private held = false;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.track') private readonly track?: HTMLElement;

  // ── Private fields ───────────────────────────────────────────────────────

  private readonly i18n = new I18nController(this);

  private slides: HTMLElement[] = [];

  /** Whether the person started rotation with the button, so hover and focus no longer pause it. */
  private startedByPerson = false;

  /** Whether the person stopped rotation or used a control, so autoplay never starts again. */
  private stoppedByPerson = false;

  /** Whether the next `index` update came from scrolling, so it needs no scroll of its own. */
  private indexFromScroll = false;

  /** Whether the next scroll to `index` is animated. */
  private smoothScroll = false;

  private timer?: ReturnType<typeof setInterval>;

  private settleTimer?: ReturnType<typeof setTimeout>;

  private readonly resizeObserver = new ResizeObserver(() =>
    this.syncVisible(),
  );

  private readonly reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  );

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('pointerenter', this.handlePointerEnter);
    this.addEventListener('pointerleave', this.handlePointerLeave);
    this.addEventListener('focusin', this.handleFocusIn);
    this.addEventListener('focusout', this.handleFocusOut);
  }

  override disconnectedCallback() {
    this.removeEventListener('pointerenter', this.handlePointerEnter);
    this.removeEventListener('pointerleave', this.handlePointerLeave);
    this.removeEventListener('focusin', this.handleFocusIn);
    this.removeEventListener('focusout', this.handleFocusOut);
    this.resizeObserver.disconnect();
    this.stopTimer();
    clearTimeout(this.settleTimer);
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (changed.has('autoplay')) {
      this.rotating =
        this.autoplay && !this.stoppedByPerson && !this.reducedMotion.matches;
    }
    const clamped = this.clamp(this.index);
    if (clamped !== this.index) this.index = clamped;
  }

  protected override firstUpdated() {
    if (this.track) this.resizeObserver.observe(this.track);
  }

  // Untyped, because it reads private state.
  protected override updated(changed: PropertyValues) {
    super.updated(changed);
    if (
      changed.has('index') ||
      changed.has('visible') ||
      changed.has('slideCount')
    ) {
      this.syncSlides();
    }
    if (changed.has('index') && !this.indexFromScroll) {
      this.scrollToIndex(this.smoothScroll);
    }
    this.indexFromScroll = false;
    this.smoothScroll = false;
    this.syncTimer();
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** Shows the page after the current one, or the first after the last when `loop` is set. */
  next() {
    this.goToPage(this.page + 1, this.loop);
  }

  /** Shows the page before the current one, or the last before the first when `loop` is set. */
  previous() {
    this.goToPage(this.page - 1, this.loop);
  }

  /** Scrolls the slide at `index`, from 0, into the first place in view. */
  goTo(index: number) {
    this.moveTo(index);
  }

  // ── Private methods ──────────────────────────────────────────────────────

  /** The first slide index that still fills the view. */
  private get maxStart() {
    return Math.max(0, this.slideCount - this.visible);
  }

  private get pageCount() {
    return Math.max(1, Math.ceil(this.slideCount / this.visible));
  }

  /** The page in view: the last one once the view reaches the end. */
  private get page() {
    if (this.index >= this.maxStart) return this.pageCount - 1;
    return Math.floor(this.index / this.visible);
  }

  private pageStart(page: number) {
    return Math.min(page * this.visible, this.maxStart);
  }

  private clamp(index: number) {
    return Math.min(Math.max(0, Math.round(index) || 0), this.maxStart);
  }

  private goToPage(page: number, wrap: boolean) {
    const last = this.pageCount - 1;
    let target = page;
    if (target > last) target = wrap ? 0 : last;
    if (target < 0) target = wrap ? last : 0;
    this.moveTo(this.pageStart(target));
  }

  private moveTo(index: number) {
    const target = this.clamp(index);
    if (target === this.index) return;
    this.smoothScroll = true;
    this.index = target;
    this.dispatchChange();
  }

  private dispatchChange() {
    this.dispatchEvent(
      new CustomEvent<CarouselChangeDetail>('change', {
        detail: { index: this.index },
      }),
    );
  }

  private syncVisible() {
    const { track } = this;
    if (!track) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const fit = Math.floor((track.clientWidth + gap) / (MIN_SLIDE_WIDTH + gap));
    const visible = Math.max(1, Math.min(Math.floor(this.perView) || 1, fit));
    if (visible !== this.visible) this.visible = visible;
  }

  /** Names each slide and makes the ones out of view inert. */
  private syncSlides() {
    const total = String(this.slides.length);
    const label = this.i18n.t('carouselSlideLabel');
    this.slides.forEach((slide, i) => {
      slide.setAttribute('role', 'group');
      slide.setAttribute(
        'aria-roledescription',
        this.i18n.t('carouselSlideRole'),
      );
      const named =
        slide.hasAttribute('aria-labelledby') ||
        (slide.hasAttribute('aria-label') && !slide.hasAttribute(OWN_LABEL));
      if (!named) {
        slide.setAttribute('aria-label', label(String(i + 1), total));
        slide.setAttribute(OWN_LABEL, '');
      }
      const inView = i >= this.index && i < this.index + this.visible;
      slide.toggleAttribute('inert', !inView);
    });
  }

  private scrollToIndex(smooth: boolean) {
    const { track } = this;
    const slide = this.slides[this.index];
    if (!track || !slide) return;
    const trackBox = track.getBoundingClientRect();
    const slideBox = slide.getBoundingClientRect();
    const delta = isRtl(this)
      ? slideBox.right - trackBox.right
      : slideBox.left - trackBox.left;
    if (Math.abs(delta) < 1) return;
    track.scrollBy({
      left: delta,
      behavior: smooth && !this.reducedMotion.matches ? 'smooth' : 'instant',
    });
  }

  /** The slide nearest the start edge of the track. */
  private nearestIndex() {
    const { track } = this;
    if (!track || !this.slides.length) return 0;
    const trackBox = track.getBoundingClientRect();
    const rtl = isRtl(this);
    let nearest = 0;
    let best = Infinity;
    this.slides.forEach((slide, i) => {
      const box = slide.getBoundingClientRect();
      const distance = Math.abs(
        rtl ? box.right - trackBox.right : box.left - trackBox.left,
      );
      if (distance < best) {
        best = distance;
        nearest = i;
      }
    });
    return nearest;
  }

  private get shouldRotate() {
    return (
      this.rotating &&
      this.pageCount > 1 &&
      (this.startedByPerson || !this.held)
    );
  }

  private syncTimer() {
    if (this.shouldRotate && this.isConnected) {
      if (this.timer === undefined) {
        this.timer = setInterval(
          () => this.advance(),
          Math.max(1000, this.interval),
        );
      }
    } else {
      this.stopTimer();
    }
  }

  private stopTimer() {
    clearInterval(this.timer);
    this.timer = undefined;
  }

  private advance() {
    this.goToPage(this.page + 1, true);
  }

  /** The person took over: autoplay stops and does not start again. */
  private stopRotation() {
    this.rotating = false;
    this.stoppedByPerson = true;
    this.startedByPerson = false;
  }

  // ── Event handlers ───────────────────────────────────────────────────────

  private readonly handleSlotChange = (event: Event) => {
    const slot = event.target as HTMLSlotElement;
    const slides = slot
      .assignedElements()
      .filter((el): el is HTMLElement => el instanceof HTMLElement);
    this.slides
      .filter(slide => !slides.includes(slide))
      .forEach(slide => slide.removeAttribute('inert'));
    this.slides = slides;
    this.slideCount = slides.length;
    this.syncSlides();
  };

  private readonly handleScroll = () => {
    clearTimeout(this.settleTimer);
    this.settleTimer = setTimeout(() => {
      const index = this.clamp(this.nearestIndex());
      if (index === this.index) return;
      this.indexFromScroll = true;
      this.index = index;
      this.dispatchChange();
    }, SETTLE_DELAY);
  };

  // The ends' buttons are soft-disabled, which keeps them focusable but sends no click.
  private readonly handlePrevious = () => {
    this.stopRotation();
    this.previous();
  };

  private readonly handleNext = () => {
    this.stopRotation();
    this.next();
  };

  private handlePicker(page: number) {
    this.stopRotation();
    this.goToPage(page, false);
  }

  private readonly handleRotation = () => {
    if (this.rotating) {
      this.stopRotation();
    } else {
      this.rotating = true;
      this.stoppedByPerson = false;
      this.startedByPerson = true;
    }
  };

  private readonly handlePointerEnter = (event: PointerEvent) => {
    if (event.pointerType === 'mouse') this.held = true;
  };

  private readonly handlePointerLeave = () => {
    if (!this.matches(':focus-within')) this.held = false;
  };

  private readonly handleFocusIn = () => {
    this.held = true;
  };

  private readonly handleFocusOut = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null;
    if (!next || !this.contains(next)) {
      if (!this.matches(':hover')) this.held = false;
    }
  };

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderPickers() {
    const pages = this.pageCount;
    const { page } = this;
    if (pages > MAX_PICKERS) {
      return html`<span class="counter"
        >${this.i18n.t('carouselCounter')(
          String(page + 1),
          String(pages),
        )}</span
      >`;
    }
    const picker = this.i18n.t('carouselPicker');
    const total = String(this.slideCount);
    return html`<div
      class="pickers"
      role="group"
      aria-label=${this.i18n.t('chooseSlide')}
    >
      ${Array.from({ length: pages }, (_, p) => {
        const first = this.pageStart(p);
        const last = Math.min(first + this.visible, this.slideCount);
        const current = p === page;
        return html`<button
          class=${classMap({ picker: true, current })}
          type="button"
          aria-label=${picker(String(first + 1), String(last), total)}
          aria-current=${current ? 'true' : nothing}
          @click=${() => this.handlePicker(p)}
        ></button>`;
      })}
    </div>`;
  }

  private renderControls() {
    if (this.pageCount < 2) return nothing;
    const atStart = !this.loop && this.page === 0;
    const atEnd = !this.loop && this.page === this.pageCount - 1;
    return html`<div class="controls" part="controls">
      ${this.autoplay
        ? html`<wc-icon-button
            class="rotation"
            variant="text"
            shape="round"
            aria-label=${this.rotating
              ? this.i18n.t('stopSlideRotation')
              : this.i18n.t('startSlideRotation')}
            @click=${this.handleRotation}
          >
            <wc-icon name=${this.rotating ? 'pause' : 'play_arrow'}></wc-icon>
          </wc-icon-button>`
        : nothing}
      <wc-icon-button
        class="previous"
        variant="tonal"
        shape="round"
        aria-label=${this.i18n.t('previousSlide')}
        ?soft-disabled=${atStart}
        @click=${this.handlePrevious}
      >
        <wc-icon class="chevron" name="chevron_left"></wc-icon>
      </wc-icon-button>
      ${this.renderPickers()}
      <wc-icon-button
        class="next"
        variant="tonal"
        shape="round"
        aria-label=${this.i18n.t('nextSlide')}
        ?soft-disabled=${atEnd}
        @click=${this.handleNext}
      >
        <wc-icon class="chevron" name="chevron_right"></wc-icon>
      </wc-icon-button>
    </div>`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    return html`<div
      class="carousel"
      part="base"
      role="region"
      aria-roledescription=${this.i18n.t('carouselRole')}
      aria-label=${this.label || nothing}
    >
      <div
        class="track"
        part="track"
        aria-live=${this.shouldRotate ? 'off' : 'polite'}
        style=${styleMap({ '--_per-view': String(this.visible) })}
        @scroll=${this.handleScroll}
      >
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
      ${this.renderControls()}
    </div>`;
  }
}
