import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Prop,
  Watch,
} from '@stencil/core';

/**
 * @name Modal
 * @description  Modals are used to display content in a layer above the app.
 * @category Informational
 * @subcategory Modal
 * @tags controls
 * @img /assets/img/modal.webp
 * @imgDark /assets/img/modal-dark.webp
 */
@Component({
  tag: 'goat-modal',
  styleUrl: 'modal.scss',
  shadow: true,
})
export class Modal {
  @Element() elm!: HTMLElement;

  /**
   * Specify whether the Modal is currently open
   */
  @Prop({ reflect: true }) open: boolean = false;

  /**
   * Specify whether the Modal is managed by the parent component
   */
  @Prop() managed: boolean = false;

  /*
   * Specify the content of the modal heading.
   */
  @Prop({ reflect: true }) heading: string;

  /*
   * Specify the content of the modal subheading.
   */
  @Prop({ reflect: true }) subheading: string;

  @Prop({ reflect: true }) hideClose: boolean = false;

  @Prop({ reflect: true }) size: 'sm' | 'md' | 'lg' = 'md';

  @Prop({ reflect: true }) showLoader: boolean = false;

  /**
   * On click of button, a CustomEvent 'goat-modal--close' will be triggered.
   */
  @Event({ eventName: 'goat-modal--close' }) goatModalClose: EventEmitter;

  @Watch('open')
  watchHandler(newValue: boolean) {
    if (newValue) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'visible';
    }
  }

  closeModal() {
    if (!this.managed) {
      this.open = false;
    }
    this.goatModalClose.emit();
  }

  render() {
    if (this.open)
      return (
        <Host>
          <div
            class="modal-container"
            aria-labelledby="modal-heading"
            role="dialog"
            aria-modal="true"
          >
            <pc-elevation></pc-elevation>
            <div class="modal-overlay" />
            <div
              class="modal--wrapper"
              onClick={event => {
                if (
                  (event.target as HTMLElement).classList.contains(
                    'modal--wrapper',
                  )
                )
                  this.closeModal();
              }}
            >
              <div
                class={{
                  'modal': true,
                  'show-loader': this.showLoader,
                  [`size-${this.size}`]: true,
                }}
              >
                <div class="modal-body">
                  <div class="modal-header">
                    <div class="modal-heading-section">
                      {this.subheading && (
                        <span
                          class="modal-subheading text-label"
                          color="secondary"
                        >
                          {this.subheading}
                        </span>
                      )}

                      {this.heading && (
                        <span class="modal-heading text-headline">
                          {this.heading}
                        </span>
                      )}
                    </div>
                    <div class="action-container">
                      {!this.hideClose && (
                        <pc-button
                          title="Close"
                          class="close-icon cancel-button"
                          color="black"
                          variant="text"
                          onGoat-button--click={() => {
                            this.closeModal();
                          }}
                        >
                          <pc-icon name="close" />
                        </pc-button>
                      )}
                    </div>
                  </div>

                  <div class="modal__content">
                    <slot />
                  </div>

                  {this.showLoader && (
                    <div class="modal__loading">
                      <div class="modal__loading-background"></div>
                      <goat-spinner size="2rem"></goat-spinner>
                    </div>
                  )}
                </div>

                <div class="modal__footer">
                  <slot name="footer"></slot>
                </div>
              </div>
            </div>
          </div>
        </Host>
      );
  }
}
