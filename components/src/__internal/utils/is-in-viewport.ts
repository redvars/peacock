export function isInViewport(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top !== 0 || rect.left !== 0 || rect.bottom !== 0 || rect.right !== 0
  );
}