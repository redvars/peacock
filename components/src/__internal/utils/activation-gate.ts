/**
 * Gate for `throttle-delay`: the returned function says whether an activation may go ahead now.
 * The first activation opens a window of `getDelay()` milliseconds, and every activation inside
 * that window is refused, never deferred, so nothing runs later with a stale event. With no
 * delay (unset, zero or negative) every activation goes ahead. The delay is read on each call, so
 * a later change to it takes effect.
 */
export function createActivationGate(
  getDelay: () => number | undefined,
): () => boolean {
  let windowStart = Number.NEGATIVE_INFINITY;
  return () => {
    const delay = getDelay();
    if (typeof delay !== 'number' || !(delay > 0)) return true;
    const now = performance.now();
    if (now - windowStart < delay) return false;
    windowStart = now;
    return true;
  };
}
