# ADR-030001: Component API conventions

- **Status:** Proposed
- **Date:** 2026-11-06
- **Packages:** `@redvars/peacock` (all components)
- **Links:** Peacock enterprise roadmap (phases 1–13)

## Context

Peacock has about 85 components written over several years. An audit found the same idea spelled many ways: "close" has eight event names (`closed`, `modal-close`, `side-sheet-close`, `snackbar-close`, `notification-dismiss`, `tag--dismiss`, ...), fields fire three different event shapes, `variant` means visual style on buttons and intent on alerts, and modes such as `wc-input type="password"` or `wc-date-field range` add options that are dead in the other modes. Every inconsistency is something a consumer has to look up. The roadmap adds about 46 components and reworks most existing ones, so the rules need to be written down before that work starts.

## Options considered

1. **Fix case by case.** No upfront cost, but each phase re-decides the same questions and the drift continues.
2. **Adopt an external design system's API wholesale** (Material Web, Shoelace). Consistent, but their names clash with Peacock's existing ones and would break more than they fix.
3. **Write Peacock's own conventions, based on what most components already do, and migrate the rest with deprecations.**

## Decision

Option 3. Every new or changed component follows these rules.

### Separate component or option
A mode becomes its own component when it changes the value the consumer reads or writes, or adds options that do nothing in the other modes. It stays an option only when it mirrors a native HTML attribute (`multiple`, `disabled`, `required`) and every other option still applies. Examples: `wc-password-field` and `wc-date-range-field` are components; `wc-select multiple` stays an option.

### Events
- Value controls fire `input` while the value changes and `change` when it is committed, both `CustomEvent<{ value }>` (multi-value controls add `values`). Events from inner native controls are stopped at the shadow boundary.
- Overlays and disclosures fire `open` and `close`; `close` carries `detail.reason` (`'escape' | 'light-dismiss' | 'action' | 'timeout' | 'api'`).
- Names are unprefixed kebab-case verbs (`change`, `select`, `dismiss`, `sort`), never `component-name-verb`, `block--modifier` or `a:b`.
- Custom events bubble and are composed.

### Vocabulary
| Concept | Name |
|:--|:--|
| Visual style | `variant` |
| Meaning | `intent`: `info`, `success`, `warning`, `danger` |
| Chosen item | `selected` (`aria-selected`/`aria-checked`/`aria-pressed`) |
| Current location | `current` (`aria-current`) |
| Visible titles | `headline`, `supporting-text` |
| Accessible name | `label` |
| Overlay position | `placement`, logical: `top`, `bottom`, `start`, `end` (+ `-start`/`-end`) |
| Can be closed by the user | `dismissible`; `no-light-dismiss` to keep it open on outside click |
| Open state | `open`; methods `show()`, `hide()`, `toggle()` |
| Busy | `loading` |
| Leading/trailing content | slots `start`, `end` |
| Size | one scale, `sm`, `md`, `lg` (`xs`/`xl` only on buttons); the same name is the same height on buttons and fields (`sm` 2.5rem, `md` 3.5rem); buttons and fields default to `sm`, so a default button lines up with a default field |
| Attributes | kebab-case (`disabled-reason`, `throttle-delay`) |

Booleans default to `false`, so any of them can be switched on from HTML; a feature that is on by default is spelled as its opposite (`hide-toolbar`).

### Deprecation
Renamed or removed APIs keep working through the 3.x line. The old name logs one console warning per page through `deprecate()` (`src/__internal/utils/deprecate.ts`) and the docs page lists it. 4.0.0 removes them, with a migration guide.

## Consequences

- Easier: a consumer who learned one component can guess the next; reviews check against a list instead of taste.
- Harder: existing components need renames and deprecation shims, and consumers see warnings until they migrate.
- Follow-up: each roadmap phase brings the components it touches in line; phase 13 removes the shims in 4.0.0.
