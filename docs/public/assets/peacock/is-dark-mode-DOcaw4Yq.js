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

function isDarkMode() {
    return document.documentElement.dataset.theme === 'dark';
}

export { isDarkMode as i, observeThemeChange as o };
//# sourceMappingURL=is-dark-mode-DOcaw4Yq.js.map
