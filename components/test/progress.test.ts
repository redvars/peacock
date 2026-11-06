/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { LinearProgress } from '../src/progress/linear-progress/linear-progress.js';
import { CircularProgress } from '../src/progress/circular-progress/circular-progress.js';

if (!customElements.get('wc-linear-progress')) {
  customElements.define('wc-linear-progress', LinearProgress);
}
if (!customElements.get('wc-circular-progress')) {
  customElements.define('wc-circular-progress', CircularProgress);
}

function bar(el: HTMLElement) {
  return el.shadowRoot!.querySelector('[role="progressbar"]')!;
}

describe('LinearProgress', () => {
  it('exposes its value and label to assistive technology', async () => {
    const el = await fixture<LinearProgress>(
      html`<wc-linear-progress
        value="30"
        label="Uploading"
      ></wc-linear-progress>`,
    );
    expect(bar(el).getAttribute('aria-valuenow')).to.equal('30');
    expect(bar(el).getAttribute('aria-label')).to.equal('Uploading');
  });

  it('omits aria-valuenow while indeterminate', async () => {
    const el = await fixture<LinearProgress>(
      html`<wc-linear-progress indeterminate></wc-linear-progress>`,
    );
    expect(bar(el).hasAttribute('aria-valuenow')).to.be.false;
  });
});

describe('CircularProgress', () => {
  it('exposes its value, and omits it while indeterminate', async () => {
    const el = await fixture<CircularProgress>(
      html`<wc-circular-progress value="40"></wc-circular-progress>`,
    );
    expect(bar(el).getAttribute('aria-valuenow')).to.equal('40');

    el.indeterminate = true;
    await el.updateComplete;
    expect(bar(el).hasAttribute('aria-valuenow')).to.be.false;
  });
});
