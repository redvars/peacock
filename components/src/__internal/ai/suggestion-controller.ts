import {
  html,
  nothing,
  type ReactiveController,
  type ReactiveControllerHost,
  type TemplateResult,
} from 'lit';

import { AiController } from './ai-controller.js';
import type { AiSuggestion } from './types.js';

/** What accepted a suggestion: the person edited the value, the form was submitted, or the app. */
export type SuggestionAcceptCause = 'edit' | 'submit' | 'action';

/** `detail` of a field's `accept`. */
export interface SuggestionAcceptDetail {
  /** The value the field holds now. */
  value: unknown;
  cause: SuggestionAcceptCause;
}

/** `detail` of a field's `dismiss`. */
export interface SuggestionDismissDetail {
  /** The suggested value that was cleared. */
  value: unknown;
}

/** Fired, bubbling and composed, whenever a field starts or stops holding a suggestion. */
export const SUGGESTION_CHANGE_EVENT = 'wc-suggestion-change';

/** A field that can hold a suggestion. */
export interface SuggestionHost extends ReactiveControllerHost, HTMLElement {
  sensitive?: boolean;
  noAi?: boolean;
}

/** How the controller reads, writes and announces the host's value. */
export interface SuggestionValueAccess {
  read(): unknown;
  write(value: unknown): void;
  /** Fires the host's `input` and `change` after the person cleared a suggestion. */
  emit(): void;
}

/**
 * The "filled in, marked" behaviour of a suggested value (ADR-030002). Setting a suggestion fills
 * the field with its value and remembers what was there; the field shows a Suggested badge and the
 * reason until the suggestion is accepted (the person edits the value, the form is submitted, or
 * `accept()` is called) or dismissed (the badge's clear button, or `dismiss()`), which puts the
 * previous value back.
 *
 * While AI is off, or the field is `sensitive`, suggestions are ignored and nothing is marked.
 */
export class SuggestionController implements ReactiveController {
  private readonly host: SuggestionHost;

  private readonly access: SuggestionValueAccess;

  private readonly ai: AiController;

  /** The suggestion the field holds, until accepted or dismissed. */
  private held: AiSuggestion | null = null;

  /** The value before the suggestion filled the field. */
  private previous: unknown = undefined;

  /** Set while the controller itself changes the value, so it isn't taken as an edit. */
  private writing = false;

  constructor(host: SuggestionHost, access: SuggestionValueAccess) {
    this.host = host;
    this.access = access;
    this.ai = new AiController(host);
    host.addController(this);
  }

  hostConnected() {
    this.host.addEventListener('input', this.onEdit);
    this.host.addEventListener('change', this.onEdit);
  }

  hostDisconnected() {
    this.host.removeEventListener('input', this.onEdit);
    this.host.removeEventListener('change', this.onEdit);
  }

  /** The suggestion the field holds, or `null`. */
  get suggestion(): AiSuggestion | null {
    return this.held;
  }

  /** Whether the field holds a suggestion and shows it as one. */
  get visible(): boolean {
    return !!this.held && this.ai.available;
  }

  /** Why the value was suggested, while the suggestion shows; else `''`. */
  get reason(): string {
    return this.visible ? (this.held?.reason ?? '') : '';
  }

  /**
   * Fills the field with a suggestion, or with `null` drops the marker and keeps the value. A new
   * suggestion over an unaccepted one keeps the value from before the first.
   */
  set(suggestion: AiSuggestion | null | undefined) {
    if (!suggestion) {
      if (!this.held) return;
      this.held = null;
      this.changed();
      return;
    }
    if (!this.ai.available) return;
    if (!this.held) this.previous = this.access.read();
    this.held = suggestion;
    this.write(suggestion.value);
    this.changed();
  }

  /** Accepts the suggestion: the value stays and the marker goes. Fires `accept`. */
  accept(cause: SuggestionAcceptCause = 'action') {
    if (!this.held) return;
    this.held = null;
    this.changed();
    this.host.dispatchEvent(
      new CustomEvent<SuggestionAcceptDetail>('accept', {
        detail: { value: this.access.read(), cause },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Clears the suggestion and puts the previous value back. Fires `dismiss`, `input` and `change`. */
  dismiss() {
    if (!this.held) return;
    const { value } = this.held;
    this.held = null;
    this.write(this.previous);
    this.changed();
    this.host.dispatchEvent(
      new CustomEvent<SuggestionDismissDetail>('dismiss', {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );
    this.writing = true;
    try {
      this.access.emit();
    } finally {
      this.writing = false;
    }
  }

  /**
   * The Suggested badge with its clear button, while the suggestion shows. With `withReason` the
   * badge carries the reason in its tooltip, for controls that have no helper text to show it in.
   */
  badge(
    options: { slot?: string; withReason?: boolean } = {},
  ): TemplateResult | typeof nothing {
    if (!this.visible) return nothing;
    return html`<wc-ai-badge
      class="suggestion-badge"
      part="suggestion-badge"
      slot=${options.slot ?? nothing}
      reason=${options.withReason ? this.reason : ''}
      dismissible
      @click=${this.onBadgeClick}
      @dismiss=${this.onBadgeDismiss}
    ></wc-ai-badge>`;
  }

  private write(value: unknown) {
    this.writing = true;
    try {
      this.access.write(value);
    } finally {
      this.writing = false;
    }
  }

  private changed() {
    this.host.requestUpdate();
    this.host.dispatchEvent(
      new Event(SUGGESTION_CHANGE_EVENT, { bubbles: true, composed: true }),
    );
  }

  /** A press on the badge is not a press on the control: no toggling, no label activation. */
  private onBadgeClick = (event: Event) => {
    event.stopPropagation();
    event.preventDefault();
  };

  private onBadgeDismiss = (event: Event) => {
    // The badge's own `dismiss` stays inside; the field fires its own, with the value.
    event.stopPropagation();
    this.dismiss();
  };

  private onEdit = (event: Event) => {
    if (event.target !== this.host || this.writing || !this.held) return;
    this.accept('edit');
  };
}
