import { css } from 'lit';
import { getTypography } from '../styleMixins.css.js';

export const styles = css`
  :host {
    display: inline-block;
    pointer-events: none;
    --avatar-size: 2rem;
    --avatar-background-color: var(--color-primary);
    --avatar-text-color: var(--color-on-primary);
    --avatar-border-radius: var(--global-avatar-border-radius);
  }

  .avatar-container {
    display: flex;
    align-items: center;
    gap: var(--spacing-050);
    line-height: 0;
  }

  .avatar {
    border-radius: var(--avatar-border-radius);
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--avatar-text-color);
    width: var(--avatar-size);
    height: var(--avatar-size);
    ${getTypography('body-large-emphasized')}
    background-color: var(--avatar-background-color);

    font-size: calc(var(--avatar-size) * 0.4);

    .image {
      width: 100%;
      height: 100%;
      overflow: hidden;
      border-radius: inherit;
    }
  }
`;
