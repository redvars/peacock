function hasMeaningfulContent(slotElement: HTMLSlotElement | null) {
  const nodes = slotElement?.assignedNodes({ flatten: true }) || [];

  for (const node of nodes) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      return true;
    }
    if (
      node.nodeType === Node.TEXT_NODE &&
      (node.textContent?.trim().length || 0) > 0
    ) {
      return true;
    }
  }

  return false;
}

export function observerSlotChangesWithCallback(
  slot: HTMLSlotElement | null,
  callback: (hasContent: boolean) => void,
) {
  const observer = new MutationObserver(() => {
    callback(hasMeaningfulContent(slot));
  });

  const assignedNodes = slot?.assignedNodes({ flatten: true }) || [];
  assignedNodes.forEach(node => {
    observer.observe(node, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
    });
  });

  callback(hasMeaningfulContent(slot));
}