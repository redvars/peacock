import { css, unsafeCSS, CSSResult } from 'lit';
import { focusRing } from '../styleMixins.css.js';

export const createLinkStyles = (prefix: string): CSSResult => css`
  .${unsafeCSS(prefix)}-link {
    border-radius: inherit;
    corner-shape: inherit;

    color: var(--color-primary);
    --icon-color: var(--color-primary);
  }

  .${unsafeCSS(prefix)}-link:hover {
    color: var(--color-on-primary-container);
    --icon-color: var(--color-on-primary-container);
  }

  .${unsafeCSS(prefix)}-link:focus {
    text-decoration: none;
    ${focusRing()}
  }

  .${unsafeCSS(prefix)}-link.no-style {
    color: var(--color-on-surface);
    --icon-color: var(--color-on-surface);
    text-decoration: none !important;
  }

  .${unsafeCSS(prefix)}-link.no-decoration {
    text-decoration: none !important;
  }

  .${unsafeCSS(prefix)}-link.inline {
    text-decoration: var(--link-decoration, underline);
  }
`;
