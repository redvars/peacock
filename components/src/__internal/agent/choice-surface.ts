import { createChange, definePrimitive } from '@ui-sdk/core';
import { createParts, wrappedChild } from '@ui-sdk/web';

/**
 * Agent surfaces let an agent read and drive a Peacock component through ui-sdk's agent bridge
 * (`createAgent` from `@ui-sdk/web/agent`) while the component keeps its own rendering and
 * behavior. The surface element wraps the component's focusable control in its shadow root, takes
 * its accessible name from it, mirrors the component's state through properties, and reports an
 * agent's change as `valuechange`; the component applies it as if the person had made it.
 *
 * Spike for ADR-030002's agent work: only used by `wc-select` so far.
 */

/** One choice, as the bridge lists it. */
export interface AgentChoiceItem {
  value: string;
  label: string;
  disabled?: boolean;
}

/** A single value, or every value of a multi-select. */
export type AgentChoiceValue = string | string[];

interface ChoiceOptions {
  value?: AgentChoiceValue;
  items?: AgentChoiceItem[];
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  onValueChange?: (value: AgentChoiceValue) => void;
}

const fromOptions = (options: ChoiceOptions) => ({
  value: options.value ?? '',
  items: options.items ?? [],
  disabled: !!options.disabled,
  readOnly: !!options.readOnly,
  required: !!options.required,
});

/** A pick-from-a-list control: its value is always one of its items (or several). */
const choice = definePrimitive({
  name: 'select',
  options: {
    value: 'value',
    items: 'value',
    disabled: 'boolean',
    readOnly: 'boolean',
    required: 'boolean',
    onValueChange: 'callback',
  },
  controlled: ['value'],
  state: fromOptions,
  sync: fromOptions,
  api: context => {
    const change = createChange(context);
    const empty = () =>
      Array.isArray(context.store.get().value) ? [] : ('' as AgentChoiceValue);
    return {
      setValue: (value: AgentChoiceValue) =>
        change('value', value, { reason: 'imperative' }),
      clear: () => change('value', empty(), { reason: 'imperative' }),
    };
  },
  slots: slot => ({
    root: slot({ attrs: () => ({}) }),
  }),
  agent: { actions: ['setValue', 'clear'], closed: true },
});

/** The tag Peacock components render around a combobox-like control. */
export const AGENT_CHOICE_TAG = 'peacock-agent-choice';

if (
  typeof customElements !== 'undefined' &&
  !customElements.get(AGENT_CHOICE_TAG)
) {
  createParts(choice, {
    root: {
      tag: AGENT_CHOICE_TAG,
      display: 'contents',
      target: wrappedChild('[role="combobox"]'),
    },
  });
}

/** What a `valuechange` from the surface carries. */
export type AgentChoiceChangeEvent = CustomEvent<{ value: AgentChoiceValue }>;
