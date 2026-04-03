import { LitElement, html } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import sliderStyles from './slider.scss';

/**
 * @label Slider
 * @tag wc-slider
 * @rawTag slider
 *
 * @summary Sliders allow users to make selections from a range of values.
 *
 * @fires {CustomEvent} input - Dispatched when the slider value changes during interaction.
 * @fires {CustomEvent} change - Dispatched when the slider interaction ends.
 *
 * @example
 * ```html
 * <wc-slider min="0" max="100" value="50"></wc-slider>
 * ```
 */
export class Slider extends LitElement {
  static styles = [sliderStyles];

  /**
   * The minimum value of the slider.
   */
  @property({ type: Number }) min = 0;

  /**
   * The maximum value of the slider.
   */
  @property({ type: Number }) max = 100;

  /**
   * The current value of the slider.
   */
  @property({ type: Number, reflect: true }) value = 50;

  /**
   * The step increment for the slider.
   */
  @property({ type: Number }) step = 1;

  /**
   * Whether the slider is disabled.
   */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /**
   * Whether to show labels on the slider.
   */
  @property({ type: Boolean }) labeled = true;

  /**
   * Whether to show the current value beside the slider.
   */
  @property({ type: Boolean, attribute: 'show-value' }) showValue = false;

  @state() private isDragging = false;

  @query('.slider-container') private container!: HTMLElement;
  
  @query('.thumb') private thumbElement!: HTMLElement;

  private handleInput(event: MouseEvent | TouchEvent) {
    if (this.disabled) return;
    
    const rect = this.container.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : (event as MouseEvent).clientX;
    
    // Calculate percentage relative to track width
    let percentage = (clientX - rect.left) / rect.width;
    percentage = Math.max(0, Math.min(1, percentage));
    
    const rawValue = this.min + percentage * (this.max - this.min);
    const steppedValue = Math.round(rawValue / this.step) * this.step;
    
    const oldValue = this.value;
    this.value = Math.max(this.min, Math.min(this.max, steppedValue));

    if (oldValue !== this.value) {
      this.dispatchEvent(new CustomEvent('input', { detail: { value: this.value }, bubbles: true, composed: true }));
    }
  }

  private onMouseDown(e: MouseEvent | TouchEvent) {
    if (this.disabled) return;
    
    e.preventDefault();
    this.isDragging = true;
    
    // Add dragging class for CSS state
    this.container.classList.add('dragging');
    this.thumbElement.classList.add('dragging');
    
    this.handleInput(e);
    
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('touchmove', this.onMouseMove, { passive: false });
    window.addEventListener('touchend', this.onMouseUp);
    window.addEventListener('touchcancel', this.onMouseUp);
  }

  private onMouseMove = (e: MouseEvent | TouchEvent) => {
    if (this.isDragging) {
      e.preventDefault();
      this.handleInput(e);
    }
  };

  private onMouseUp = () => {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    this.container.classList.remove('dragging');
    this.thumbElement.classList.remove('dragging');
    
    this.dispatchEvent(new CustomEvent('change', { detail: { value: this.value }, bubbles: true, composed: true }));
    
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('touchmove', this.onMouseMove);
    window.removeEventListener('touchend', this.onMouseUp);
    window.removeEventListener('touchcancel', this.onMouseUp);
  };

  private handleKeyDown(e: KeyboardEvent) {
    if (this.disabled) return;
    
    const increment = e.shiftKey ? this.step * 10 : this.step;
    let newValue = this.value;

    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      newValue = Math.min(this.max, this.value + increment);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      newValue = Math.max(this.min, this.value - increment);
      e.preventDefault();
    } else if (e.key === 'Home') {
      newValue = this.min;
      e.preventDefault();
    } else if (e.key === 'End') {
      newValue = this.max;
      e.preventDefault();
    }

    if (newValue !== this.value) {
      this.value = newValue;
      this.dispatchEvent(new CustomEvent('input', { detail: { value: this.value }, bubbles: true, composed: true }));
      this.dispatchEvent(new CustomEvent('change', { detail: { value: this.value }, bubbles: true, composed: true }));
    }
  }

  render() {
    const percentage = ((this.value - this.min) / (this.max - this.min)) * 100;

    return html`
      <div class="slider ${this.showValue ? 'with-value' : ''}">
        <div 
          class="slider-container ${this.disabled ? 'disabled' : ''}"
          @mousedown=${this.onMouseDown}
          @touchstart=${this.onMouseDown}
        >
          <div class="track">
            <div class="track-active" style=${styleMap({ width: `${percentage}%` })}></div>
          </div>

          <div 
            class="thumb" 
            role="slider"
            aria-label="Slider"
            tabindex="${this.disabled ? -1 : 0}"
            aria-valuemin=${this.min}
            aria-valuemax=${this.max}
            aria-valuenow=${this.value}
            aria-disabled=${this.disabled}
            style=${styleMap({ left: `calc(${percentage}% - var(--thumb-half))` })}
            @keydown=${this.handleKeyDown}
          >
            ${this.labeled ? html`<div class="value-label">${this.value}</div>` : ''}
          </div>
        </div>

        ${this.showValue ? html`<output class="value-display" aria-live="polite">${this.value}</output>` : ''}
      </div>
    `;
  }
}