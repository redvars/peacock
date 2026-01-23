import { css, unsafeCSS, CSSResult } from 'lit';

export const focusRing = (
  color = 'var(--border-interactive)',
): CSSResult => css`
  outline: 2px solid ${unsafeCSS(color)};
`;

export const getTypography = (name: string): CSSResult => css`
  font-family: var(--typography-${unsafeCSS(name)}-font-family) !important;
  font-size: var(--typography-${unsafeCSS(name)}-font-size) !important;
  font-weight: var(--typography-${unsafeCSS(name)}-font-weight) !important;
  line-height: var(--typography-${unsafeCSS(name)}-line-height) !important;
  letter-spacing: var(
    --typography-${unsafeCSS(name)}-letter-spacing
  ) !important;
`;

export const getTypographyNotImportant = (name: string): CSSResult => css`
  font-family: var(--typography-${unsafeCSS(name)}-font-family);
  font-size: var(--typography-${unsafeCSS(name)}-font-size);
  font-weight: var(--typography-${unsafeCSS(name)}-font-weight);
  line-height: var(--typography-${unsafeCSS(name)}-line-height);
  letter-spacing: var(--typography-${unsafeCSS(name)}-letter-spacing);
`;

export const forPhoneOnly = (content: CSSResult): CSSResult => css`
  @media (max-width: 671px) {
    ${content}
  }
`;

export const forTabletPortraitUp = (content: CSSResult): CSSResult => css`
  @media (min-width: 672px) {
    ${content}
  }
`;

export const forTabletLandscapeUp = (content: CSSResult): CSSResult => css`
  @media (min-width: 1056px) {
    ${content}
  }
`;

export const forDesktopUp = (content: CSSResult): CSSResult => css`
  @media (min-width: 1312px) {
    ${content}
  }
`;

export const forBigDesktopUp = (content: CSSResult): CSSResult => css`
  @media (min-width: 1584px) {
    ${content}
  }
`;
