/** Resolves after `ms` milliseconds (a macrotask, also for `0`). */
export function wait(ms = 0) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

/**
 * Clicks `host` twice, a macrotask apart, and returns how many times that activated the inner
 * control found by `selector` in its shadow root. With `throttle-delay` set, the second click
 * falls inside the delay and must not activate the control again. `settleMs` waits that long
 * after the second click before counting, so a click the throttle wrongly deferred shows up.
 */
export async function countActivations(
  host: HTMLElement,
  selector: string,
  settleMs = 0,
) {
  const control = host.shadowRoot?.querySelector(selector);
  if (!control) throw new Error(`No ${selector} in the shadow root`);

  let activations = 0;
  // Capture, so a listener the control has itself cannot hide the click from the count.
  control.addEventListener(
    'click',
    () => {
      activations += 1;
    },
    { capture: true },
  );

  host.click();
  // isActivationClick() ignores a second click within the same microtask.
  await wait();
  host.click();
  if (settleMs > 0) await wait(settleMs);
  return activations;
}
