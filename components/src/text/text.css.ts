import { css, unsafeCSS, CSSResult } from 'lit';
import { getTypography } from '../styleMixins.css.js';

/**
 * Sass equivalents:
 * $types: "display", "headline", "body", "code", "label", "title";
 * $sizes: "large", "medium", "small";
 */
const TYPES = [
  'display',
  'headline',
  'body',
  'code',
  'label',
  'title',
] as const;

const SIZES = ['large', 'medium', 'small'] as const;

const createTagClass = (prefix: string, tag: string) => css`
  .${unsafeCSS(prefix)}-text-${unsafeCSS(tag)} {
    ${getTypography(tag)}
  }

  .${unsafeCSS(prefix)}-text-${unsafeCSS(tag)}-emphasized {
    ${getTypography(`${tag}-emphasized`)}
  }
`;

const createTypeClass = (prefix: string, type: string) => css`
  .${unsafeCSS(prefix)}-text-${unsafeCSS(type)} {
    ${getTypography(`${type}-medium`)}
  }

  .${unsafeCSS(prefix)}-text-${unsafeCSS(type)}-emphasized {
    ${getTypography(`${type}-medium-emphasized`)}
  }

  ${unsafeCSS(
    SIZES.map(size => createTagClass(prefix, `${type}-${size}`)).join(''),
  )}
`;

export const createTextStyles = (prefix: string): CSSResult => css`
  /* === Margin rules (manual groups from Sass) === */

  .${unsafeCSS(prefix)}-text-body,
    .${unsafeCSS(prefix)}-text-body-medium,
    .${unsafeCSS(prefix)}-text-body-large,
    .${unsafeCSS(prefix)}-text-body-small {
    margin-block-end: var(--spacing-200);
  }

  .${unsafeCSS(prefix)}-text-headline,
    .${unsafeCSS(prefix)}-text-headline-medium,
    .${unsafeCSS(prefix)}-text-headline-large,
    .${unsafeCSS(prefix)}-text-headline-small {
    margin-block-end: var(--spacing-400);
  }

  .${unsafeCSS(prefix)}-text-display,
    .${unsafeCSS(prefix)}-text-display-medium,
    .${unsafeCSS(prefix)}-text-display-large,
    .${unsafeCSS(prefix)}-text-display-small {
    margin-block-end: var(--spacing-400);
  }

  .${unsafeCSS(prefix)}-text-title,
    .${unsafeCSS(prefix)}-text-title-medium,
    .${unsafeCSS(prefix)}-text-title-large,
    .${unsafeCSS(prefix)}-text-title-small {
    margin-block-end: var(--spacing-400);
  }

  ${unsafeCSS(TYPES.map(type => createTypeClass(prefix, type)).join(''))}
`;
