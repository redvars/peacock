import { css } from 'lit';
import { getTypography } from '../styleMixins.css.js';

export const styles = css`
  :host {
    display: inline-block;
  }

  .current-time {
    ${getTypography('body-medium')}
  }
`;
