import type { AiCapability, PeacockAiConfig } from './types.js';

const defaults: PeacockAiConfig = { enabled: true };

let current: PeacockAiConfig = { ...defaults };

const listeners = new Set<() => void>();

/**
 * Sets the page's AI settings. Fields left out keep their defaults: AI on, no provider, every
 * capability allowed. Every connected component that uses AI re-renders with the new settings.
 *
 * @example
 * setPeacockAi({ provider: { complete: request => api.complete(request) } });
 * setPeacockAi({ enabled: false }); // the instance turned the assistant off
 */
export function setPeacockAi(config: Partial<PeacockAiConfig>): void {
  current = { ...defaults, ...config };
  listeners.forEach(listener => listener());
}

/** The current AI settings. */
export function peacockAi(): Readonly<PeacockAiConfig> {
  return current;
}

/** Calls the listener whenever the AI settings change; returns a function that stops listening. */
export function onPeacockAiChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Whether AI is on for the page and, with a capability, whether the provider offers it and it is
 * not turned off.
 */
export function isAiAvailable(capability?: AiCapability): boolean {
  if (!current.enabled) return false;
  if (!capability) return true;
  if (current.features?.[capability] === false) return false;
  return typeof current.provider?.[capability] === 'function';
}
