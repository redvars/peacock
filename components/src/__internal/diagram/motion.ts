/** Whether the person asked for less motion. Diagram animations jump to their end state when true. */
export function prefersReducedMotion(): boolean {
  return (
    typeof matchMedia === 'function' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export const easeInOutCubic = (p: number) =>
  p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2;

export const easeOutCubic = (p: number) => 1 - (1 - p) ** 3;

export interface TweenOptions {
  duration: number;
  easing?: (p: number) => number;
  /** Called every frame with the eased progress, 0 to 1. */
  onUpdate: (p: number) => void;
  onDone?: () => void;
}

/**
 * Runs `onUpdate` every animation frame for `duration` milliseconds. Under reduced motion it
 * calls `onUpdate(1)` and `onDone` straight away. Returns a function that stops the tween without
 * calling `onDone`.
 */
export function tween({
  duration,
  easing = easeInOutCubic,
  onUpdate,
  onDone,
}: TweenOptions): () => void {
  if (duration <= 0 || prefersReducedMotion()) {
    onUpdate(1);
    onDone?.();
    return () => {};
  }
  let frame = 0;
  let stopped = false;
  const start = performance.now();
  const step = (now: number) => {
    if (stopped) return;
    const p = Math.min(1, (now - start) / duration);
    onUpdate(easing(p));
    if (p < 1) {
      frame = requestAnimationFrame(step);
    } else {
      onDone?.();
    }
  };
  frame = requestAnimationFrame(step);
  return () => {
    stopped = true;
    cancelAnimationFrame(frame);
  };
}

/**
 * Fades and shrinks elements before they are removed, then calls `done`. Resolves at once under
 * reduced motion or when the Web Animations API is missing.
 */
export function animateOut(
  elements: Element[],
  done: () => void,
  duration = 160,
) {
  if (elements.length === 0 || prefersReducedMotion()) {
    done();
    return;
  }
  const animations = elements
    .filter(el => typeof (el as HTMLElement).animate === 'function')
    .map(el =>
      (el as HTMLElement).animate(
        [
          { opacity: 1, transform: 'scale(1)' },
          { opacity: 0, transform: 'scale(0.95)' },
        ],
        { duration, easing: 'ease-in', fill: 'forwards' },
      ),
    );
  if (animations.length === 0) {
    done();
    return;
  }
  Promise.all(animations.map(a => a.finished.catch(() => undefined))).then(
    done,
  );
}
