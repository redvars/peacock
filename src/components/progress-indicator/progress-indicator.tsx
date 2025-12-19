import { Component, Prop, Event, EventEmitter, h } from '@stencil/core';

/**
 * @name Progress indicator
 * @description Progress indicators express an unspecified wait time or display the length of a process.
 * @category Informational
 * @tags feedback, loading, progress, spinner
 * @example <goat-progress-indicator value="40" label="Progress" width="100%" helper-text="Optional helper text goes here..."></goat-progress-indicator>
 */
@Component({
  tag: 'goat-linear-progress',
  styleUrl: 'progress-indicator.scss',
  shadow: true,
})
export class LinearProgress {
  /**
   * Total number of steps. Ignored if `labels` is provided.
   */
  @Prop() total: number = 3;

  /**
   * Current active step (1-based).
   */
  @Prop({ mutable: true }) current: number = 1;

  /**
   * Comma separated labels, e.g. "Start,Details,Confirm".
   * If omitted, generic "Step 1", "Step 2", ... labels are used.
   */
  @Prop() labels?: string;

  /**
   * If true, steps are clickable and component emits `goatStepSelect`.
   */
  @Prop() clickable: boolean = false;

  /**
   * Emitted when a step is clicked (1-based index).
   */
  @Event() goatStepSelect!: EventEmitter<number>;

  private getSteps(): string[] {
    if (this.labels && this.labels.trim().length) {
      return this.labels
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    }
    return Array.from({ length: this.total }, (_, i) => `Step ${i + 1}`);
  }

  private onStepClick(step: number) {
    if (!this.clickable) return;
    this.current = step;
    this.goatStepSelect.emit(step);
  }

  render() {
    const steps = this.getSteps();
    return (
      <nav class="goat-progress" aria-label="Progress">
        <ol class="goat-progress__list" role="list">
          {steps.map((label, i) => {
            const index = i + 1;
            const completed = index < this.current;
            const active = index === this.current;
            const stateClass = completed
              ? 'is-complete'
              : active
              ? 'is-active'
              : '';
            return (
              <li
                class={`goat-progress__step ${stateClass}`}
                key={index}
                aria-current={active ? 'step' : null}
              >
                <button
                  class="goat-progress__button"
                  type="button"
                  disabled={!this.clickable}
                  onClick={() => this.onStepClick(index)}
                  aria-pressed={active ? 'true' : 'false'}
                >
                  <span
                    class={`goat-progress__marker ${
                      completed ? 'marker-complete' : ''
                    }`}
                  >
                    <span class="goat-progress__number">{index}</span>
                  </span>
                  <span class="goat-progress__label">{label}</span>
                </button>
                {i !== steps.length - 1 ? (
                  <span class="goat-progress__connector" aria-hidden="true" />
                ) : null}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
}
