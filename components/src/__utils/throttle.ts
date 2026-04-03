export function throttle(
  func: Function,
  delay: number,
  options = { leading: true, trailing: true },
) {
  let timerId: any;
  let lastExec = 0;

  return function (...args: any[]) {
    // @ts-ignore
    const context = this;
    const now = Date.now();

    const shouldCallNow = options.leading && now - lastExec >= delay;

    if (shouldCallNow) {
      func.apply(context, args);
      lastExec = now;
    } else if (options.trailing && !timerId) {
      timerId = setTimeout(() => {
        func.apply(context, args);
        lastExec = Date.now();
        timerId = null;
      }, delay);
    }
  };
}