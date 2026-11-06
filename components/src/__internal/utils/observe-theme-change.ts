type ThemeChangeCallback = () => void;

/**
 * Calls back when the theme may have changed: `data-theme` on the root element changed, or the
 * system `prefers-color-scheme` flipped. Returns a function that stops the callback.
 */
export const observeThemeChange = (() => {
  const callbacks = new Set<ThemeChangeCallback>();

  const notify = () => {
    for (const callback of callbacks) {
      try {
        callback();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[observeThemeChange] callback threw:', err);
      }
    }
  };

  const observer = new MutationObserver(records => {
    const changed = records.some(
      r => r.type === 'attributes' && r.attributeName === 'data-theme',
    );
    if (changed) notify();
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  window
    .matchMedia?.('(prefers-color-scheme: dark)')
    .addEventListener('change', notify);

  return (callback: ThemeChangeCallback): (() => void) => {
    callbacks.add(callback);
    return () => callbacks.delete(callback);
  };
})();
