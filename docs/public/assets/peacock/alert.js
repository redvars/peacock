import { i, _ as __decorate, I as IndividualComponent, a as i$1, A, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { e } from './class-map-DG7CA1et.js';
import './directive-ZPhl09Yt.js';

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  display: none !important;
}

[hidden] {
  display: none !important;
}

:host {
  display: block;
}

.alert {
  align-items: flex-start;
  background: var(--alert-container-color);
  border-radius: var(--alert-border-radius);
  display: grid;
  gap: var(--spacing-100);
  grid-template-columns: auto 1fr;
  padding: var(--spacing-200);
}

.alert-icon {
  align-items: center;
  color: var(--alert-icon-color);
  display: inline-flex;
  justify-content: center;
  --icon-size: 1.5rem;
}

.alert-content .alert-label {
  display: inline;
  font-family: var(--typography-label-large-font-family) !important;
  font-size: var(--typography-label-large-font-size) !important;
  font-weight: var(--typography-label-large-font-weight) !important;
  line-height: var(--typography-label-large-line-height) !important;
  letter-spacing: var(--typography-label-large-letter-spacing) !important;
  color: var(--alert-label-text-color);
  margin-inline-end: var(--spacing-050);
}
.alert-content .alert-description {
  display: inline;
  font-family: var(--typography-body-medium-font-family) !important;
  font-size: var(--typography-body-medium-font-size) !important;
  font-weight: var(--typography-body-medium-font-weight) !important;
  line-height: var(--typography-body-medium-line-height) !important;
  letter-spacing: var(--typography-body-medium-letter-spacing) !important;
  color: var(--alert-description-text-color);
}

:host {
  --alert-container-color: var(--color-tertiary-container);
  --alert-label-text-color: var(--color-on-tertiary-container);
  --alert-description-text-color: var(--color-on-tertiary-container);
  --alert-icon-color: var(--color-on-tertiary-container);
  --alert-border-radius: var(--shape-corner-small);
}

.alert.info,
.alert-content.info {
  --alert-container-color: var(--color-primary-container);
  --alert-label-text-color: var(--color-on-primary-container);
  --alert-description-text-color: var(--color-on-primary-container);
  --alert-icon-color: var(--color-on-primary-container);
}

.alert.success,
.alert-content.success {
  --alert-container-color: var(--color-success-container);
  --alert-label-text-color: var(--color-on-success-container);
  --alert-description-text-color: var(--color-on-success-container);
  --alert-icon-color: var(--color-on-success-container);
}

.alert.warning,
.alert-content.warning {
  --alert-container-color: var(--color-warning-container);
  --alert-label-text-color: var(--color-on-warning-container);
  --alert-description-text-color: var(--color-on-warning-container);
  --alert-icon-color: var(--color-on-warning-container);
}

.alert.error,
.alert-content.error {
  --alert-container-color: var(--color-error-container);
  --alert-label-text-color: var(--color-on-error-container);
  --alert-description-text-color: var(--color-on-error-container);
  --alert-icon-color: var(--color-on-error-container);
}`;

const VARIANT_LABELS = {
    note: 'Note',
    info: 'Info',
    success: 'Success',
    warning: 'Warning',
    error: 'Error',
};
const VARIANT_ICONS = {
    note: 'star',
    info: 'info',
    success: 'check_circle',
    warning: 'warning',
    error: 'error',
};
/**
 * @label Alert
 * @tag wc-alert
 * @rawTag alert
 * @summary Alerts show short, prominent contextual messages with optional icon and description.
 *
 * @cssprop --alert-container-color - Background color of the alert container.
 * @cssprop --alert-label-text-color - Label text color.
 * @cssprop --alert-description-text-color - Description text color.
 * @cssprop --alert-icon-color - Icon color.
 * @cssprop --alert-border-radius - Border radius of the alert surface.
 *
 * @example
 * ```html
 * <wc-alert variant="note" description="Use semantic roles that preserve a 3:1 contrast ratio."></wc-alert>
 * ```
 * @tags display, feedback
 */
let Alert = class Alert extends i$1 {
    constructor() {
        super(...arguments);
        /**
         * Visual intent of the alert.
         */
        this.variant = 'note';
        /**
         * Optional description text when a default slot is not provided.
         */
        this.description = '';
    }
    get resolvedLabel() {
        return this.label || VARIANT_LABELS[this.variant];
    }
    get resolvedIcon() {
        return this.icon || VARIANT_ICONS[this.variant];
    }
    render() {
        return b `
      <div class=${e({ 'alert': true, [this.variant]: true })} role="status" aria-live="polite">
        <div class="alert-icon" aria-hidden="true">
          <slot name="icon">
            <wc-icon name=${this.resolvedIcon}></wc-icon>
          </slot>
        </div>

        <div class=${e({ 'alert-content': true, [this.variant]: true })}>
          <div class="alert-label">
            <slot name="label">${this.resolvedLabel}:</slot>
          </div>

          <div class="alert-description">
            <slot>${this.description || A}</slot>
          </div>
        </div>
      </div>
    `;
    }
};
Alert.styles = [css_248z];
__decorate([
    n({ type: String, reflect: true })
], Alert.prototype, "variant", void 0);
__decorate([
    n({ type: String })
], Alert.prototype, "label", void 0);
__decorate([
    n({ type: String })
], Alert.prototype, "icon", void 0);
__decorate([
    n({ type: String })
], Alert.prototype, "description", void 0);
Alert = __decorate([
    IndividualComponent
], Alert);

export { Alert };
//# sourceMappingURL=alert.js.map
