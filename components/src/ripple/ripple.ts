import { LitElement, html, css } from 'lit';

export class Ripple extends LitElement {
  static styles = css`
    :host {
      position: absolute;
      inset: 0; /* top/left/bottom/right: 0 */
      pointer-events: none; /* Let clicks pass through to parent */
      overflow: hidden;
      border-radius: inherit; /* Inherit parent's rounded corners */
      z-index: 0;
      --ripple-state-opacity: 0;
      --ripple-pressed-color: var(--color-on-surface);
    }

    .ripple:before {
      content: '';
      opacity: var(--ripple-state-opacity);
      pointer-events: none;
      position: absolute;

      background-color: var(--ripple-pressed-color);
      inset: 0;
      transition:
        opacity 15ms linear,
        background-color 15ms linear;
    }

    .ripple:after {
      content: '';
      opacity: var(--ripple-state-opacity);
      pointer-events: none;
      position: absolute;
      background: radial-gradient(
        closest-side,
        var(--ripple-pressed-color) max(100% - 70px, 65%),
        transparent 100%
      );
      transform-origin: center center;
      transition: opacity 375ms linear;

      width: 25px;
      top: 0px;
      transform: translate(51.4375px, 7.5px) scale(8.75941);
      left: 0px;
      height: 25px;
    }

    .ripple-effect {
      position: absolute;
      border-radius: 50%;
      background-color: var(--ripple-pressed-color);
      opacity: 0.12; /* Material 3 State Layer Opacity */
      transform: scale(0);
      animation: ripple-anim 600ms linear forwards;
    }

    @keyframes ripple-anim {
      to {
        transform: scale(1);
        opacity: 0;
      }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    // We defer slightly to ensure the parent DOM is ready
    requestAnimationFrame(() => {
      this._setupParent();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.parentElement) {
      this.parentElement.removeEventListener('pointerdown', this._createRipple);
    }
  }

  _setupParent() {
    const parent = this.parentElement;
    if (!parent) return;

    // 1. Force parent to be relative so we can position absolutely inside it
    const style = window.getComputedStyle(parent);
    if (style.position === 'static') {
      parent.style.position = 'relative';
    }

    // 2. Attach listener to the parent
    parent.addEventListener('pointerdown', this._createRipple);
  }

  // Arrow function to bind 'this' automatically
  _createRipple = (event: PointerEvent) => {
    const parent = this.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();

    // 1. Calculate diameter (furthest corner)
    const diameter = Math.max(rect.width, rect.height) * 2.5;
    const radius = diameter / 2;

    // 2. Calculate position relative to the parent
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 3. Create the ripple element
    // We create this manually to avoid triggering a full Lit render cycle
    // for a transient, fire-and-forget animation.
    const ripple = document.createElement('div');
    ripple.classList.add('ripple-effect');

    ripple.style.width = `${diameter}px`;
    ripple.style.height = `${diameter}px`;
    ripple.style.left = `${x - radius}px`;
    ripple.style.top = `${y - radius}px`;

    // 4. Append to Shadow DOM
    this.renderRoot.appendChild(ripple);

    // 5. Cleanup
    ripple.addEventListener('animationend', () => {
      ripple.remove();
    });
  };

  render() {
    // No HTML needed in the template, we inject ripples dynamically
    return html`<div class="ripple"></div>`;
  }
}
