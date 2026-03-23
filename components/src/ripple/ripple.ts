import { LitElement, html, css, PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

const PRESS_GROW_MS = 450;
const MINIMUM_PRESS_MS = 225;
const INITIAL_ORIGIN_SCALE = 0.2;
const PADDING = 10;
const SOFT_EDGE_MINIMUM_SIZE = 75;
const SOFT_EDGE_CONTAINER_RATIO = 0.35;
const PRESS_PSEUDO = '::after';
const ANIMATION_FILL = 'forwards';

/**
 * Interaction states for the ripple.
 *
 * On Touch:
 *  - `INACTIVE -> TOUCH_DELAY -> WAITING_FOR_CLICK -> INACTIVE`
 *
 * On Mouse or Pen:
 *   - `INACTIVE -> WAITING_FOR_CLICK -> INACTIVE`
 */
enum State {
  /**
   * Initial state of the control, no touch in progress.
   *
   * Transitions:
   *   - on touch down: transition to `TOUCH_DELAY`.
   *   - on mouse down: transition to `WAITING_FOR_CLICK`.
   */
  INACTIVE,
  /**
   * Touch down has been received, waiting to determine if it's a swipe or
   * scroll.
   *
   * Transitions:
   *   - on touch up: begin press; transition to `WAITING_FOR_CLICK`.
   *   - on cancel: transition to `INACTIVE`.
   *   - after `TOUCH_DELAY_MS`: begin press; transition to `HOLDING`.
   */
  TOUCH_DELAY,
  /**
   * A touch has been deemed to be a press
   *
   * Transitions:
   *  - on up: transition to `WAITING_FOR_CLICK`.
   */
  HOLDING,
  /**
   * The user touch has finished, transition into rest state.
   *
   * Transitions:
   *   - on click end press; transition to `INACTIVE`.
   */
  WAITING_FOR_CLICK,
}

/**
 * Events that the ripple listens to.
 */
const EVENTS = [
  'click',
  'contextmenu',
  'pointercancel',
  'pointerdown',
  'pointerenter',
  'pointerleave',
  'pointerup',
];

/**
 * Delay reacting to touch so that we do not show the ripple for a swipe or
 * scroll interaction.
 */
const TOUCH_DELAY_MS = 150;

/**
 * Used to detect if HCM is active. Events do not process during HCM when the
 * ripple is not displayed.
 */
const FORCED_COLORS = window.matchMedia('(forced-colors: active)');

/**
 * @label Ripple
 * @tag wc-ripple
 * @rawTag ripple
 *
 * @summary Provides ripple effect for interactive elements.
 * @overview
 * <p>Ripple creates a visual feedback effect when users interact with buttons or other clickable elements.</p>
 *
 * @example
 * ```html
 * <button style="position: relative;">
 *   <wc-ripple></wc-ripple>
 *   Click me
 * </button>
 * ```
 * @tags display
 */
export class Ripple extends LitElement {
  static styles = css`
    :host {
      display: flex;
      margin: auto;
      pointer-events: none;
    }

    :host([disabled]) {
      display: none;
    }

    @media (forced-colors: active) {
      :host {
        display: none;
      }
    }

    :host,
    .surface {
      border-radius: inherit;
      corner-shape: inherit;
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    .surface {
      -webkit-tap-highlight-color: transparent;

      &::before,
      &::after {
        content: '';
        opacity: 0;
        position: absolute;
      }

      &::before {
        background-color: var(--ripple-pressed-color, var(--color-on-surface));
        inset: 0;
        transition: opacity 15ms linear, background-color 15ms linear;
      }

      &::after {
        background: radial-gradient(
          closest-side,
          var(--ripple-pressed-color, var(--color-on-surface)) max(calc(100% - 70px), 65%),
          transparent 100%
        );
        transform-origin: center center;
        transition: opacity 375ms linear;
      }
    }

    .hovered::before {
      opacity: 0.08;
    }

    .pressed::after {
      opacity: 0.12;
      transition-duration: 105ms;
    }
  `;

  /**
   * Disables the ripple.
   */
  @property({ type: Boolean, reflect: true }) disabled = false;

  @state() private hovered = false;
  
  @state() private pressed = false;

  @query('.surface') private readonly mdRoot!: HTMLElement | null;

  private rippleSize = '';

  private rippleScale = '';

  private initialSize = 0;

  private growAnimation?: Animation;

  private state = State.INACTIVE;

  private rippleStartEvent?: PointerEvent;

  override connectedCallback() {
    super.connectedCallback();
    // Needed for VoiceOver, which will create a "group" if the element is a
    // sibling to other content.
    this.setAttribute('aria-hidden', 'true');
    // Attach to parent
    this.attach(this.parentElement!);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.detach();
  }

  attach(control: HTMLElement) {
    if (!control) return;
    EVENTS.forEach(event => {
      control.addEventListener(event, this.handleEvent.bind(this));
    });
  }

  detach() {
    const control = this.parentElement;
    if (!control) return;
    EVENTS.forEach(event => {
      control.removeEventListener(event, this.handleEvent.bind(this));
    });
  }

  protected override render() {
    const classes = {
      'hovered': this.hovered,
      'pressed': this.pressed,
    };

    return html`<div class="surface ${classMap(classes)}"></div>`;
  }

  protected override update(changedProps: PropertyValues<Ripple>) {
    if (changedProps.has('disabled') && this.disabled) {
      this.hovered = false;
      this.pressed = false;
    }
    super.update(changedProps);
  }

  handlePointerenter(event: PointerEvent) {
    if (!this.shouldReactToEvent(event)) {
      return;
    }

    this.hovered = true;
  }

  handlePointerleave(event: PointerEvent) {
    if (!this.shouldReactToEvent(event)) {
      return;
    }

    this.hovered = false;

    // release a held mouse or pen press that moves outside the element
    if (this.state !== State.INACTIVE) {
      this.endPressAnimation();
    }
  }

  private handlePointerup(event: PointerEvent) {
    if (!this.shouldReactToEvent(event)) {
      return;
    }

    if (this.state === State.HOLDING) {
      this.state = State.WAITING_FOR_CLICK;
      return;
    }

    if (this.state === State.TOUCH_DELAY) {
      this.state = State.WAITING_FOR_CLICK;
      this.startPressAnimation(this.rippleStartEvent);
      return;
    }
  }

  private async handlePointerdown(event: PointerEvent) {
    if (!this.shouldReactToEvent(event)) {
      return;
    }

    this.rippleStartEvent = event;
    if (!this.isTouch(event)) {
      this.state = State.WAITING_FOR_CLICK;
      this.startPressAnimation(event);
      return;
    }

    // Wait for a hold after touch delay
    this.state = State.TOUCH_DELAY;
    await new Promise((resolve) => {
      setTimeout(resolve, TOUCH_DELAY_MS);
    });

    if (this.state !== State.TOUCH_DELAY) {
      return;
    }

    this.state = State.HOLDING;
    this.startPressAnimation(event);
  }

  private handleClick() {
    if (this.disabled) {
      return;
    }

    if (this.state === State.WAITING_FOR_CLICK) {
      this.endPressAnimation();
      return;
    }

    if (this.state === State.INACTIVE) {
      // keyboard synthesized click event
      this.startPressAnimation();
      this.endPressAnimation();
    }
  }

  private handlePointercancel(event: PointerEvent) {
    if (!this.shouldReactToEvent(event)) {
      return;
    }

    this.endPressAnimation();
  }

  private handleContextmenu() {
    if (this.disabled) {
      return;
    }

    this.endPressAnimation();
  }

  private determineRippleSize() {
    const { height, width } = this.getBoundingClientRect();
    const maxDim = Math.max(height, width);
    const softEdgeSize = Math.max(
      SOFT_EDGE_CONTAINER_RATIO * maxDim,
      SOFT_EDGE_MINIMUM_SIZE,
    );

    const initialSize = Math.floor(maxDim * INITIAL_ORIGIN_SCALE);
    const hypotenuse = Math.sqrt(width ** 2 + height ** 2);
    const maxRadius = hypotenuse + PADDING;

    this.initialSize = initialSize;
    const maybeZoomedScale = (maxRadius + softEdgeSize) / initialSize;
    this.rippleScale = `${maybeZoomedScale}`;
    this.rippleSize = `${initialSize}px`;
  }

  private getTranslationCoordinates(positionEvent?: Event) {
    const { height, width } = this.getBoundingClientRect();
    // end in the center
    const endPoint = {
      x: (width - this.initialSize) / 2,
      y: (height - this.initialSize) / 2,
    };

    let startPoint;
    if (positionEvent instanceof PointerEvent) {
      startPoint = this.getNormalizedPointerEventCoords(positionEvent);
    } else {
      startPoint = {
        x: width / 2,
        y: height / 2,
      };
    }

    // center around start point
    startPoint = {
      x: startPoint.x - this.initialSize / 2,
      y: startPoint.y - this.initialSize / 2,
    };

    return { startPoint, endPoint };
  }

  private startPressAnimation(positionEvent?: Event) {
    if (!this.mdRoot) {
      return;
    }

    this.pressed = true;
    this.growAnimation?.cancel();
    this.determineRippleSize();
    const { startPoint, endPoint } =
      this.getTranslationCoordinates(positionEvent);
    const translateStart = `${startPoint.x}px, ${startPoint.y}px`;
    const translateEnd = `${endPoint.x}px, ${endPoint.y}px`;

    this.growAnimation = this.mdRoot.animate(
      {
        top: [0, 0],
        left: [0, 0],
        height: [this.rippleSize, this.rippleSize],
        width: [this.rippleSize, this.rippleSize],
        transform: [
          `translate(${translateStart}) scale(1)`,
          `translate(${translateEnd}) scale(${this.rippleScale})`,
        ],
      },
      {
        pseudoElement: PRESS_PSEUDO,
        duration: PRESS_GROW_MS,
        easing: 'cubic-bezier(0.2, 0, 0, 1)',
        fill: ANIMATION_FILL,
      },
    );
  }

  private async endPressAnimation() {
    this.rippleStartEvent = undefined;
    this.state = State.INACTIVE;
    const animation = this.growAnimation;
    let pressAnimationPlayState = Infinity;
    if (typeof animation?.currentTime === 'number') {
      pressAnimationPlayState = animation.currentTime;
    } else if (animation?.currentTime) {
      pressAnimationPlayState = animation.currentTime.to('ms').value;
    }

    if (pressAnimationPlayState >= MINIMUM_PRESS_MS) {
      this.pressed = false;
      return;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, MINIMUM_PRESS_MS - pressAnimationPlayState);
    });

    if (this.growAnimation !== animation) {
      // A new press animation was started. The old animation was canceled and
      // should not finish the pressed state.
      return;
    }

    this.pressed = false;
  }

  /**
   * Returns `true` if
   *  - the ripple element is enabled
   *  - the pointer is primary for the input type
   *  - the pointer is the pointer that started the interaction, or will start
   * the interaction
   *  - the pointer is a touch, or the pointer state has the primary button
   * held, or the pointer is hovering
   */
  private shouldReactToEvent(event: PointerEvent) {
    if (this.disabled || !event.isPrimary) {
      return false;
    }

    if (
      this.rippleStartEvent &&
      this.rippleStartEvent.pointerId !== event.pointerId
    ) {
      return false;
    }

    if (event.type === 'pointerenter' || event.type === 'pointerleave') {
      return !this.isTouch(event);
    }

    const isPrimaryButton = event.buttons === 1;
    return this.isTouch(event) || isPrimaryButton;
  }

  private isTouch({ pointerType }: PointerEvent) {
    return pointerType === 'touch';
  }

  async handleEvent(event: Event) {
    if (FORCED_COLORS?.matches) {
      // Skip event logic since the ripple is `display: none`.
      return;
    }

    switch (event.type) {
      case 'click':
        this.handleClick();
        break;
      case 'contextmenu':
        this.handleContextmenu();
        break;
      case 'pointercancel':
        this.handlePointercancel(event as PointerEvent);
        break;
      case 'pointerdown':
        await this.handlePointerdown(event as PointerEvent);
        break;
      case 'pointerenter':
        this.handlePointerenter(event as PointerEvent);
        break;
      case 'pointerleave':
        this.handlePointerleave(event as PointerEvent);
        break;
      case 'pointerup':
        this.handlePointerup(event as PointerEvent);
        break;
      default:
        break;
    }
  }

  private getNormalizedPointerEventCoords(pointerEvent: PointerEvent): {
    x: number;
    y: number;
  } {
    const { scrollX, scrollY } = window;
    const { left, top } = this.getBoundingClientRect();
    const documentX = scrollX + left;
    const documentY = scrollY + top;
    const { pageX, pageY } = pointerEvent;
    return {
      x: pageX - documentX,
      y: pageY - documentY,
    };
  }
}
