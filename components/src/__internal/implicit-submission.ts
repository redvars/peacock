import { afterDispatch, setupDispatchHooks } from './events/dispatch-hooks.js';
import { isSubmitButton } from './utils/form-submission.js';

/**
 * Native input types that "block implicit submission" in the HTML standard: the single-line
 * fields in which Enter submits the form.
 */
const TEXT_INPUT_TYPES = new Set([
  'text',
  'search',
  'url',
  'tel',
  'email',
  'password',
  'date',
  'month',
  'week',
  'time',
  'datetime-local',
  'number',
]);

/**
 * Peacock's single-line text fields, registered with `registerTextField()`. They count as text
 * fields too, whether or not Enter in them submits the form.
 */
const textFields = new WeakSet<Element>();

/**
 * Counts a form-associated Peacock field as a single-line text field of its form, like a native
 * text input. A form without a submit button is submitted on Enter only while it has one such
 * field, so a field that leaves this out lets Enter in another field submit the form.
 *
 * `setupImplicitSubmission()` registers its field itself.
 */
export function registerTextField(host: Element) {
  textFields.add(host);
}

function blocksImplicitSubmission(el: Element) {
  if (el instanceof HTMLInputElement) return TEXT_INPUT_TYPES.has(el.type);
  return textFields.has(el);
}

/**
 * Submits `form` the way the browser does when Enter is pressed in one of its text inputs. The
 * default button (the form's first submit button) is clicked, so its own click handling runs and
 * it is the `submitter`; when it is disabled, nothing is submitted. Without a submit button, the
 * form is submitted only when it has a single text field.
 */
function submitImplicitly(form: HTMLFormElement) {
  const controls = Array.from(form.elements);
  const defaultButton = controls.find(isSubmitButton);
  if (defaultButton instanceof HTMLElement) {
    if (!defaultButton.matches(':disabled')) defaultButton.click();
    return;
  }
  if (controls.filter(blocksImplicitSubmission).length > 1) return;
  form.requestSubmit();
}

/**
 * Gives a form-associated text field the implicit submission of a native text input: Enter in the
 * field submits its form (see `submitImplicitly()`). Without it nothing happens, because the
 * native input lives in the shadow root and has no form owner of its own.
 *
 * It acts after the keydown has reached every listener, so `preventDefault()` on the keydown
 * cancels it. Only Enter typed in the text input counts, not Enter on a button inside the field;
 * Enter while an input method is composing, or with Ctrl, Alt or Meta, is ignored.
 *
 * Call it in the constructor, before other keydown listeners are added.
 *
 * @param host The field. Its `form` is the form it submits.
 * @param input The native text input inside the field.
 */
export function setupImplicitSubmission(
  host: HTMLElement & { readonly form: HTMLFormElement | null },
  input: () => HTMLInputElement | null | undefined,
) {
  registerTextField(host);
  setupDispatchHooks(host, 'keydown');
  host.addEventListener('keydown', (event: KeyboardEvent) => {
    if (
      event.key !== 'Enter' ||
      event.isComposing ||
      // Safari reports the Enter that ends a composition this way.
      event.keyCode === 229 ||
      event.ctrlKey ||
      event.altKey ||
      event.metaKey
    ) {
      return;
    }
    if (event.composedPath()[0] !== input()) return;
    const { form } = host;
    if (!form) return;

    afterDispatch(event, () => {
      if (!event.defaultPrevented) submitImplicitly(form);
    });
  });
}
