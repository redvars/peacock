# ADR-030002: AI-native components

- **Status:** Proposed
- **Date:** 2026-11-07
- **Packages:** `@redvars/peacock`
- **Links:** engineering [ADR-000007](../../../engineering/docs/adr/000007-ai-native-never-ai-only.md) (AI native, never AI only); the "With AI" boards in `engineering/design/home-admin-store`; [ADR-030001](030001-component-api-conventions.md) (component API conventions)

## Context

ADR-000007 makes every Redvars feature AI native and never AI only: the assistant acts as the person using it, reads freely, writes only drafts the person confirms, and every page also works completely without AI. Apps build those pages with Peacock, so Peacock decides how suggested values, drafts, generated text, citations and streaming answers look and behave, and whether turning AI off really removes them.

Peacock has none of this today. Each app would otherwise invent its own "suggested" marker and its own way to stream text, and the marking and off-switch rules of ADR-000007 (rules 9 and 10) would be met differently, or not at all, on every page.

## Options considered

1. **Leave it to apps.** Nothing to build, but every app draws its own markers and reaches its own model, which ADR-000007 rule 6 forbids.
2. **AI-specific components that call a model themselves** (an `endpoint` property, a built-in client). Quick demos, but a second way to reach a model beside the platform's model service, with its own credentials and no access checks.
3. **Model-free components with one registered provider.** Components show AI state the app passes in, and the few interactive features (ghost text, rewrite, summarize, sentence to filters) call one provider the app registers, which in Redvars calls the platform's model service.

## Decision

Option 3.

### Peacock never calls a model
- **Presentation state** is pushed in by the app: a field's `suggestion`, a summary's `value` while `streaming`, `citations`, a draft card's `state`. This works with any backend and needs no provider.
- **Interactive features** call the provider registered with `setPeacockAi({ provider })`. Each capability is an optional method (`complete`, `transform`, `summarize`, `parse`); every call gets an `AbortSignal` and a context holding only the text the component owns. Streams are `AsyncIterable<string>`.

### Turning AI off removes it cleanly
`setPeacockAi({ enabled: false })` turns AI off for the page; `features: { summarize: false }` turns off one capability. An element with `no-ai` or `sensitive` opts out on its own. When AI is off for an element:
- anything that refers to the assistant renders nothing: `wc-ai-badge`, "Ask" buttons and rows, AI menu groups, AI strings;
- interactive features are not offered;
- neutral pieces keep working, because they are not about AI: `wc-typing-indicator` (also used for people typing), `wc-citation` (a reference to a record), `wc-markdown`'s streaming.

AI is on by default with no provider, so presentation components work as soon as an app uses them, and interactive features appear only once a provider supplies them.

### AI output is visible as such
`wc-ai-badge` is the one marker: `suggested` (a value the person hasn't accepted), `draft` (a record or text waiting for confirmation), `generated` (read-only output such as a summary). It carries text, never only color; it can show why (`reason`) and can clear in one action (`dismissible`, `dismiss`).

### Writes are drafts
No component turns AI output into a committed value without the person's action: ghost text needs Tab, a rewrite needs Accept, a draft card needs Confirm, and an irreversible draft asks again.

### Suggested values are filled in and marked
Every form control takes `suggestion = { value, reason }`. The control holds the value, shows a Suggested badge and the reason in place of its helper text, and remembers the value it replaced. Editing the value, or submitting the form, accepts it (`accept`, with `cause`); the badge's clear button puts the previous value back (`dismiss`, then `input` and `change`). `wc-form`'s `suggest()` fills a whole form this way, shows a draft banner while any field is still suggested, and lists those fields in `submit`'s `detail.suggested` so the change can be recorded as made through the assistant. While AI is off, suggestions are ignored.

### Writing assistance
- **Ghost text** (`ai-completion`, opt-in per field) appears after a pause at the end of a line or paragraph, in `wc-textarea`, the rich-text editors and `wc-code-editor` (through Monaco's inline completions). Tab takes it, Mod+→ takes a word, Escape or typing dismisses it.
- **Actions** on the selection (Improve, Shorten, Fix, Translate, Tell it what to change) open from the selection bubble or the toolbar, and Continue writing and Summarize above from the slash menu. The answer streams into a preview with Accept, Discard, Try again and a Changes diff; the document changes only on Accept, in one undoable step.
- Model text enters a document as plain text paragraphs, never parsed as HTML or Markdown.

### Conversation
`wc-assistant-panel` frames a conversation: a header that says whose access the assistant uses, a `wc-chat-thread` of `wc-chat-message`s, a `wc-prompt-input`, and a reminder to check drafts. An answer shows its lookups in `wc-assistant-steps` (a step the person's access did not allow says so) and its writes only as `wc-draft-card`s, which do nothing until the person confirms; an irreversible draft asks again. The thread announces an answer once it is complete, never word by word. The panel, steps and draft cards render nothing while AI is off; the thread, messages and prompt input are neutral and can serve conversations between people too.

### Ask and summarize
- `wc-ai-summary` is the assistant's summary: marked, citing its sources, with Try again, Hide and a rating; `variant="inline"` is a one-line insight for the `insight` slots of `wc-stat` and the charts. Discussions have a `summary` slot and `suggestReply()`; the notification center has a `summary` slot.
- `wc-search ask` and `wc-command-palette ask` let people ask the assistant where they would search; Enter still searches, and with AI off they are plain search.
- A sentence becomes structure through the provider's `parse`: `wc-filter-bar` keeps only known filters with valid values and marks them until edited, with one action to put the previous filters back; `wc-condition-builder` hands the answer to the app as `describe`, and the app builds rules marked `suggested`. The provider gets field definitions, never record values.

### Generative view
`wc-generative-view` shows an answer as Peacock components from JSON nodes (`{"type", "props", "children", "slot", "action", "payload"}`), for answers that read better as numbers, charts, tables or lists than as text. The data comes from the platform; the model only lays it out.
- It renders only its catalog: the components and props of a hand-kept allow-list, with each prop's JSON kind, enum values and description generated from the component manifest. A test fails when the committed catalog is stale, or when it allows a prop that can navigate, load an address or run code (`href`, `src`, callbacks, templates). Form controls are not in it.
- Everything else is dropped and listed in `issues`: an unknown node shows as its text, an ill-typed prop is left out, icon names must be plain names and colors plain colors or tokens (so a model cannot spell data into a URL), and a view stops at 12 levels and 500 nodes. Text is never parsed as HTML.
- A node with an `action` id fires `action` when pressed or selected, and does nothing else. The app decides what follows; a write is still a draft the person confirms.
- While `streaming`, the view reads cut-off JSON and keeps the elements it rendered, updating them in place.
- `generativeViewSchema()` returns the catalog as a JSON Schema for the model service's structured output. The view renders nothing while AI is off.

### Data boundaries
`sensitive` on a field keeps its value out of every provider call and hides its AI features. Password and PIN fields are always sensitive.

### Model text is untrusted
Model output is shown only through `wc-markdown` (raw HTML as text, safe links only) or the allow-listed `wc-generative-view`. Nothing executes or auto-submits it. Citations are links of the form `[1](cite:record-id)`, resolved by the app's `citations`, never by following model-written URLs.

### Accessibility
Streaming text sets `aria-busy` and is announced when complete, not per chunk. Indicators use `role="status"`, and motion stops under `prefers-reduced-motion`.

## Consequences

- Easier: every app marks AI output the same way; the off switch is one call; the model provider changes in the platform only; components are testable with a scripted provider.
- Harder: each AI-enhanced component is designed and tested twice, with AI on and off. The provider contract is public API and follows the deprecation rules of ADR-030001.
- Risks: text inside records can steer the model (prompt injection). Peacock limits the damage to drafts the person must confirm and to text rendered without HTML; the assistant's own defences are the platform's.
- Follow-up: field suggestions and form drafts; writing assistance; the conversation components; summaries and ask; the generative view. Each is a phase of the AI-native plan.
