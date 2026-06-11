function throttle(func, delay, options = { leading: true, trailing: true }) {
    let timerId;
    let lastExec = 0;
    return function (...args) {
        // @ts-ignore
        const context = this;
        const now = Date.now();
        const shouldCallNow = options.leading && now - lastExec >= delay;
        if (shouldCallNow) {
            func.apply(context, args);
            lastExec = now;
        }
        else if (options.trailing && !timerId) {
            timerId = setTimeout(() => {
                func.apply(context, args);
                lastExec = Date.now();
                timerId = null;
            }, delay);
        }
    };
}

export { throttle as t };
//# sourceMappingURL=throttle-C7ZAPqtu.js.map
