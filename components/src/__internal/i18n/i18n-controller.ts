import type { ReactiveController, ReactiveControllerHost } from 'lit';
import {
  onPeacockStringsChange,
  peacockString,
  type PeacockStringKey,
  type PeacockStrings,
} from './strings.js';
import { resolveLocale } from './locale.js';

type Host = ReactiveControllerHost &
  HTMLElement & {
    /** Per-instance string overrides, on components that render many strings. */
    strings?: Partial<PeacockStrings>;
    /** The component's own locale, on components that format numbers or dates. */
    locale?: string;
  };

/**
 * Gives a component its strings and locale, and re-renders it when the app calls
 * `setPeacockStrings()`.
 *
 * @example
 * private readonly i18n = new I18nController(this);
 * // in render(): aria-label=${this.i18n.t('dismiss')}
 */
export class I18nController implements ReactiveController {
  private readonly host: Host;

  private stopListening?: () => void;

  constructor(host: Host) {
    this.host = host;
    host.addController(this);
  }

  hostConnected() {
    this.stopListening = onPeacockStringsChange(() =>
      this.host.requestUpdate(),
    );
  }

  hostDisconnected() {
    this.stopListening?.();
    this.stopListening = undefined;
  }

  /** The string for `key`: the instance's override, else the app's, else the English default. */
  t<K extends PeacockStringKey>(key: K): PeacockStrings[K] {
    const override = this.host.strings?.[key];
    return (override ?? peacockString(key)) as PeacockStrings[K];
  }

  /** The locale to format with: the host's `locale`, else the nearest `lang`, else the browser's. */
  get locale(): string {
    return resolveLocale(this.host.locale, this.host);
  }
}
