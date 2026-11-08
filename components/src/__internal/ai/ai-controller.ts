import type { ReactiveController, ReactiveControllerHost } from 'lit';

import { resolveLocale } from '../i18n/locale.js';
import { isAiAvailable, onPeacockAiChange, peacockAi } from './config.js';
import type {
  AiCapability,
  AiRequestContext,
  PeacockAiProvider,
} from './types.js';

type Host = ReactiveControllerHost &
  HTMLElement & {
    /** The element opted out of AI with `no-ai`. */
    noAi?: boolean;
    /** The element holds data that must never reach a model. */
    sensitive?: boolean;
    name?: string;
    label?: string;
    locale?: string;
  };

/**
 * Marks a component class whose data is always sensitive, such as passwords and PINs:
 * `static [ALWAYS_SENSITIVE] = true`. AI is never available to its instances, whatever their
 * `sensitive` says.
 */
export const ALWAYS_SENSITIVE = Symbol('peacock.alwaysSensitive');

/** Whether an error is the abort of a request, which is not a failure. */
export function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  );
}

/**
 * Gives a component its AI availability and runs its provider requests (ADR-030002).
 *
 * `available` is false when AI is off for the page, the capability is missing or turned off, or
 * the host has `no-ai` or `sensitive`; the component then renders nothing that refers to AI. The
 * host re-renders when the page's AI settings change.
 *
 * `run()` aborts the previous request before starting the next one, aborts when the host leaves
 * the page, and turns an abort into `undefined` rather than an error.
 *
 * @example
 * private readonly ai = new AiController(this, 'summarize');
 * // render(): this.ai.available ? html`<button>…</button>` : nothing
 */
export class AiController implements ReactiveController {
  /** Whether a request is running. */
  busy = false;

  /** The last request's error, cleared when the next one starts. */
  error: unknown = undefined;

  private readonly host: Host;

  private readonly capability?: AiCapability;

  private controller?: AbortController;

  private stopListening?: () => void;

  constructor(host: Host, capability?: AiCapability) {
    this.host = host;
    this.capability = capability;
    host.addController(this);
  }

  hostConnected() {
    this.stopListening = onPeacockAiChange(() => this.host.requestUpdate());
  }

  hostDisconnected() {
    this.stopListening?.();
    this.stopListening = undefined;
    this.abort();
  }

  /** Whether the host may show and offer AI. */
  get available(): boolean {
    if (this.host.noAi || this.host.sensitive) return false;
    const type = this.host.constructor as { [ALWAYS_SENSITIVE]?: boolean };
    if (type[ALWAYS_SENSITIVE]) return false;
    return isAiAvailable(this.capability);
  }

  /** The registered provider, when AI is available to the host. */
  get provider(): PeacockAiProvider | undefined {
    return this.available ? peacockAi().provider : undefined;
  }

  /** The request context for the host, with optional overrides. */
  context(extra: Partial<AiRequestContext> = {}): AiRequestContext {
    const { host } = this;
    return {
      component: host.localName,
      ...(host.name ? { name: host.name } : {}),
      ...(host.label ? { label: host.label } : {}),
      locale: resolveLocale(host.locale, host),
      ...extra,
    };
  }

  /**
   * Runs a provider request. The previous one is aborted first. Resolves with the task's result, or
   * `undefined` when it was aborted or failed; a failure is kept in `error`.
   */
  async run<T>(
    task: (signal: AbortSignal) => Promise<T>,
  ): Promise<T | undefined> {
    this.abort();
    const controller = new AbortController();
    this.controller = controller;
    this.busy = true;
    this.error = undefined;
    this.host.requestUpdate();
    try {
      const result = await task(controller.signal);
      return controller.signal.aborted ? undefined : result;
    } catch (error) {
      if (!controller.signal.aborted && !isAbortError(error)) {
        this.error = error;
      }
      return undefined;
    } finally {
      if (this.controller === controller) {
        this.controller = undefined;
        this.busy = false;
        this.host.requestUpdate();
      }
    }
  }

  /** Aborts the running request, if any. */
  abort() {
    if (!this.controller) return;
    this.controller.abort();
    this.controller = undefined;
    this.busy = false;
  }
}
