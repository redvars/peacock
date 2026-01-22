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

  /* === Typography rules (Sass @each equivalent) === */

  ${unsafeCSS(
    TYPES.map(
      type => css`
        .${unsafeCSS(prefix)}-text-${unsafeCSS(type)} {
          ${unsafeCSS(getTypography(`${type}-medium`))}
        }

        .${unsafeCSS(prefix)}-text-${unsafeCSS(type)}-emphasized {
          ${unsafeCSS(getTypography(`${type}-medium-emphasized`))}
        }

        ${unsafeCSS(
          SIZES.map(
            size => css`
              .${unsafeCSS(prefix)}-text-${unsafeCSS(type)}-${unsafeCSS(size)} {
                ${unsafeCSS(getTypography(`${type}-${size}`))}
              }

              .${unsafeCSS(prefix)}-text-${unsafeCSS(type)}-${unsafeCSS(
                size,
              )}-emphasized {
                ${unsafeCSS(getTypography(`${type}-${size}-emphasized`))}
              }
            `,
          ),
        )}
      `,
    ),
  )}
`;
