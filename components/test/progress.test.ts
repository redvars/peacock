/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { LinearProgress } from '../src/progress/linear-progress/linear-progress.js';
import { CircularProgress } from '../src/progress/circular-progress/circular-progress.js';
import { Spinner } from '../src/spinner/spinner.js';
import { resetDeprecationWarnings } from '../src/__internal/utils/deprecate.js';

if (!customElements.get('wc-spinner')) {
  customElements.define('wc-spinner', Spinner);
}
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
  it('exposes its value, and is named by its visible label', async () => {
    const el = await fixture<LinearProgress>(
      html`<wc-linear-progress
        value="30"
        label="Uploading"
      ></wc-linear-progress>`,
    );
    expect(bar(el).getAttribute('aria-valuenow')).to.equal('30');
    expect(bar(el).getAttribute('aria-valuemax')).to.equal('100');
    const labelId = bar(el).getAttribute('aria-labelledby')!;
    expect(el.shadowRoot!.getElementById(labelId)!.textContent).to.equal(
      'Uploading',
    );
    expect(bar(el).hasAttribute('aria-label')).to.be.false;
  });

  it('falls back to "Loading" without a label', async () => {
    const el = await fixture<LinearProgress>(
      html`<wc-linear-progress value="30"></wc-linear-progress>`,
    );
    expect(bar(el).getAttribute('aria-label')).to.equal('Loading');
    expect(bar(el).hasAttribute('aria-labelledby')).to.be.false;
  });

  it('takes max, and clamps value into 0..max', async () => {
    const el = await fixture<LinearProgress>(
      html`<wc-linear-progress value="3" max="8"></wc-linear-progress>`,
    );
    const indicator =
      el.shadowRoot!.querySelector<HTMLElement>('.active-indicator')!;
    expect(bar(el).getAttribute('aria-valuemax')).to.equal('8');
    expect(bar(el).getAttribute('aria-valuenow')).to.equal('3');
    expect(indicator.style.width).to.equal('37.5%');

    el.value = 20;
    await el.updateComplete;
    expect(bar(el).getAttribute('aria-valuenow')).to.equal('8');
    expect(indicator.style.width).to.equal('100%');

    el.value = -5;
    await el.updateComplete;
    expect(bar(el).getAttribute('aria-valuenow')).to.equal('0');
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

  it('takes max and clamps, and is named by its label', async () => {
    const el = await fixture<CircularProgress>(
      html`<wc-circular-progress
        value="12"
        max="10"
        label="Syncing"
      ></wc-circular-progress>`,
    );
    expect(bar(el).getAttribute('aria-valuemax')).to.equal('10');
    expect(bar(el).getAttribute('aria-valuenow')).to.equal('10');
    const labelId = bar(el).getAttribute('aria-labelledby')!;
    expect(el.shadowRoot!.getElementById(labelId)!.textContent).to.equal(
      'Syncing',
    );
  });
});

describe('Spinner', () => {
  let warn: typeof console.warn;
  let warnings: string[];

  beforeEach(() => {
    resetDeprecationWarnings();
    warnings = [];
    warn = console.warn;
    console.warn = (message: string) => {
      warnings.push(message);
    };
  });

  afterEach(() => {
    console.warn = warn;
  });

  it('is an indeterminate, named progressbar and warns once', async () => {
    const el = await fixture<Spinner>(html`<wc-spinner></wc-spinner>`);
    await fixture<Spinner>(html`<wc-spinner></wc-spinner>`);

    expect(el).to.be.instanceOf(CircularProgress);
    expect(el.indeterminate).to.be.true;
    expect(bar(el).getAttribute('aria-label')).to.equal('Loading');
    expect(bar(el).hasAttribute('aria-valuenow')).to.be.false;
    expect(warnings).to.deep.equal([
      '[peacock] wc-spinner: <wc-spinner> is deprecated and will be removed in 4.0. Use <wc-circular-progress indeterminate> instead.',
    ]);
  });
});
