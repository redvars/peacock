function hasMeaningfulContent(slotElement) {
    const nodes = slotElement?.assignedNodes({ flatten: true }) || [];
    for (const node of nodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            return true;
        }
        if (node.nodeType === Node.TEXT_NODE && node.textContent?.match(/\S/)) {
            return true;
        }
    }
    return false;
}
function observerSlotChangesWithCallback(slot, callback) {
    if (!slot)
        return () => { };
    // Keep track of observers for current assigned nodes so we can reconnect
    let observers = [];
    const observeAssignedNodes = () => {
        // disconnect previous observers
        observers.forEach(o => o.disconnect());
        observers = [];
        const assigned = slot.assignedNodes({ flatten: true }) || [];
        assigned.forEach(node => {
            const obs = new MutationObserver(() => {
                callback(hasMeaningfulContent(slot));
            });
            try {
                obs.observe(node, {
                    attributes: true,
                    childList: true,
                    characterData: true,
                    subtree: true,
                });
                observers.push(obs);
            }
            catch (e) {
                // ignore nodes that cannot be observed
            }
        });
        // initial check
        callback(hasMeaningfulContent(slot));
    };
    // When assigned nodes change (elements added/removed), the slot emits a slotchange
    // event — re-run observer setup so we track the new nodes. This fixes the case
    // where an element (e.g. <wc-icon>) is removed from light DOM: previously we
    // only observed the old node and wouldn't detect its removal.
    const onSlotChange = () => observeAssignedNodes();
    slot.addEventListener('slotchange', onSlotChange);
    // Start observing
    observeAssignedNodes();
    // Return a cleanup function so callers can disconnect observers when needed.
    return () => {
        observers.forEach(o => o.disconnect());
        slot.removeEventListener('slotchange', onSlotChange);
    };
}

export { hasMeaningfulContent as h, observerSlotChangesWithCallback as o };
//# sourceMappingURL=observe-slot-change-DPxaZrZF.js.map
