/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixture } from '@open-wc/testing';
import { RedvarsLoader } from '../src/redvars-loader/index.js';
import { setPeacockStrings } from '../src/__internal/i18n/strings.js';

if (!customElements.get('wc-redvars-loader')) {
  customElements.define('wc-redvars-loader', RedvarsLoader);
}

function bar(el: RedvarsLoader): HTMLElement {
  return el.shadowRoot!.querySelector('[role="progressbar"]') as HTMLElement;
}

describe('RedvarsLoader', () => {
  afterEach(() => setPeacockStrings({ loading: 'Loading' }));

  it('loops with the build variant by default and is named "Loading"', async () => {
    const el = await fixture<RedvarsLoader>(
      html`<wc-redvars-loader></wc-redvars-loader>`,
    );
    expect(el.variant).to.equal('build');
    expect(bar(el).classList.contains('build')).to.be.true;
    expect(bar(el).getAttribute('aria-label')).to.equal('Loading');
    expect(bar(el).hasAttribute('aria-valuenow')).to.be.false;
    expect(el.shadowRoot!.querySelector('.stem')).to.exist;
    expect(el.shadowRoot!.querySelector('.arm')).to.exist;
  });

  it('draws each variant', async () => {
    const el = await fixture<RedvarsLoader>(
      html`<wc-redvars-loader></wc-redvars-loader>`,
    );
    for (const variant of ['trace', 'fill', 'pulse', 'orbit'] as const) {
      el.variant = variant;
      // eslint-disable-next-line no-await-in-loop
      await el.updateComplete;
      expect(bar(el).classList.contains(variant)).to.be.true;
    }
    expect(el.shadowRoot!.querySelector('.runner')).to.exist;
    expect(
      el.shadowRoot!.querySelector('svg')!.getAttribute('viewBox'),
    ).to.equal('-40 -40 336 336');
  });

  it('fills to value as a determinate progress bar, clamped to 0–100', async () => {
    const el = await fixture<RedvarsLoader>(
      html`<wc-redvars-loader variant="orbit" value="40"></wc-redvars-loader>`,
    );
    expect(bar(el).classList.contains('progress')).to.be.true;
    expect(bar(el).getAttribute('aria-valuenow')).to.equal('40');
    expect(bar(el).getAttribute('aria-valuemin')).to.equal('0');
    expect(bar(el).getAttribute('aria-valuemax')).to.equal('100');
    expect(bar(el).style.getPropertyValue('--_progress')).to.equal('0.4');
    expect(el.shadowRoot!.querySelector('.runner')).to.not.exist;

    el.value = 140;
    await el.updateComplete;
    expect(bar(el).getAttribute('aria-valuenow')).to.equal('100');
  });

  it('takes its name from label or the translated loading string', async () => {
    const el = await fixture<RedvarsLoader>(
      html`<wc-redvars-loader label="Starting Redvars"></wc-redvars-loader>`,
    );
    expect(bar(el).getAttribute('aria-label')).to.equal('Starting Redvars');

    el.label = '';
    setPeacockStrings({ loading: 'Chargement' });
    await el.updateComplete;
    expect(bar(el).getAttribute('aria-label')).to.equal('Chargement');
  });

  it('plays the full animation by default and reflects respect-reduced-motion', async () => {
    const el = await fixture<RedvarsLoader>(
      html`<wc-redvars-loader></wc-redvars-loader>`,
    );
    expect(el.respectReducedMotion).to.be.false;
    expect(el.hasAttribute('respect-reduced-motion')).to.be.false;
    el.respectReducedMotion = true;
    await el.updateComplete;
    expect(el.hasAttribute('respect-reduced-motion')).to.be.true;
  });
});
