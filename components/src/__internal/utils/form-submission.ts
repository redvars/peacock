/** Whether `el` is a submit button of a form: native, or a Peacock button with `type="submit"`. */
export function isSubmitButton(el: Element): boolean {
  if (el instanceof HTMLButtonElement) return el.type === 'submit';
  if (el instanceof HTMLInputElement) {
    return el.type === 'submit' || el.type === 'image';
  }
  return (
    el.localName.includes('-') &&
    (el as Element & { type?: unknown }).type === 'submit'
  );
}
