import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Icon } from '../dist/src/icon/Icon.js';

describe('PcIcon', () => {
  it('passes the a11y audit', async () => {
    const el = await fixture<Icon>(html`<pc-icon></pc-icon>`);

    await expect(el).shadowDom.to.be.accessible();
  });
});
