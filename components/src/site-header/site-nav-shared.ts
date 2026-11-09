/** Tags of the site header's navigation parts. */
export const NAV_PARTS = {
  header: 'wc-site-header',
  menu: 'wc-site-nav-menu',
  group: 'wc-site-nav-group',
  link: 'wc-site-nav-link',
} as const;

/** Attribute a header sets on its navigation parts while it is collapsed into a drawer. */
export const COLLAPSED_ATTRIBUTE = 'data-collapsed';

/** Marks every navigation part inside `header` as collapsed or not. */
export function syncCollapsed(header: Element, collapsed: boolean) {
  header
    .querySelectorAll(
      `${NAV_PARTS.menu}, ${NAV_PARTS.group}, ${NAV_PARTS.link}`,
    )
    .forEach(part => part.toggleAttribute(COLLAPSED_ATTRIBUTE, collapsed));
}

/** For a part connected after its header rendered: take the header's collapsed state. */
export function adoptCollapsed(part: Element) {
  const header = part.closest(NAV_PARTS.header) as
    | (Element & { collapsed?: boolean })
    | null;
  part.toggleAttribute(COLLAPSED_ATTRIBUTE, !!header?.collapsed);
}
