const observeThemeChange = (() => {
    const callbacks = new Set();
    const observer = new MutationObserver((records) => {
        const changed = records.some((r) => r.type === "attributes" && r.attributeName === "data-theme");
        if (!changed)
            return;
        for (const callback of callbacks) {
            try {
                callback();
            }
            catch (err) {
                console.error("[observeThemeChange] callback threw:", err);
            }
        }
    });
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
    });
    return (callback) => {
        callbacks.add(callback);
        return () => callbacks.delete(callback);
    };
})();

export { observeThemeChange as o };
//# sourceMappingURL=observe-theme-change-DCifz1uv.js.map
