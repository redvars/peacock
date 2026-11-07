/// <reference types="mocha" />
import { html, svg } from 'lit';
import { fixtureSync, expect, waitUntil } from '@open-wc/testing';
import { Illustration } from '../src/illustration/illustration.js';
import {
  illustrationNames,
  registerIllustration,
} from '../src/illustration/index.js';
import { resetWarnOnce } from '../src/__internal/utils/warn-once.js';

if (!customElements.get('wc-illustration')) {
  customElements.define('wc-illustration', Illustration);
}

async function render(template: ReturnType<typeof html>) {
  const el = fixtureSync<Illustration>(template);
  await el.updateComplete;
  return el;
}

function art(el: Illustration) {
  return el.shadowRoot?.querySelector('svg.art') ?? null;
}

describe('Illustration', () => {
  it('ships eighteen illustrations', () => {
    expect(illustrationNames).to.have.length(18);
  });

  for (const name of illustrationNames) {
    it(`renders "${name}" as an svg with drawn shapes`, async () => {
      const el = await render(
        html`<wc-illustration name=${name}></wc-illustration>`,
      );
      const node = art(el);
      expect(node, name).to.exist;
      expect(node?.getAttribute('viewBox')).to.equal('0 0 240 180');
      expect(
        node?.querySelectorAll('path, circle, rect, ellipse').length,
      ).to.be.greaterThan(3);
    });
  }

  it('is decorative without a label', async () => {
    const el = await render(
      html`<wc-illustration name="empty"></wc-illustration>`,
    );
    const node = art(el);
    expect(node?.getAttribute('aria-hidden')).to.equal('true');
    expect(node?.hasAttribute('role')).to.equal(false);
    expect(node?.hasAttribute('aria-label')).to.equal(false);
  });

  it('is a named image with a label', async () => {
    const el = await render(
      html`<wc-illustration
        name="success"
        label="Payment complete"
      ></wc-illustration>`,
    );
    const node = art(el);
    expect(node?.getAttribute('role')).to.equal('img');
    expect(node?.getAttribute('aria-label')).to.equal('Payment complete');
    expect(node?.hasAttribute('aria-hidden')).to.equal(false);
  });

  it('renders nothing and warns once for an unknown name', async () => {
    resetWarnOnce();
    const warnings: string[] = [];
    const original = console.warn;
    console.warn = (message: string) => warnings.push(message);
    try {
      const el = await render(
        html`<wc-illustration name="no-such-art"></wc-illustration>`,
      );
      await render(
        html`<wc-illustration name="no-such-art"></wc-illustration>`,
      );
      expect(art(el)).to.equal(null);
      expect(warnings).to.have.length(1);
      expect(warnings[0]).to.contain('no-such-art');
    } finally {
      console.warn = original;
    }
  });

  it('switches art when the name changes', async () => {
    const el = await render(
      html`<wc-illustration name="error"></wc-illustration>`,
    );
    expect(art(el)?.querySelector('.error-soft')).to.exist;
    el.name = 'success';
    await el.updateComplete;
    expect(art(el)?.querySelector('.error-soft')).to.equal(null);
    expect(art(el)?.querySelector('.success-soft')).to.exist;
  });

  it('draws art added with registerIllustration', async () => {
    registerIllustration(
      'test-custom',
      svg`<circle class="backdrop test-mark" cx="120" cy="90" r="60"/>`,
    );
    const el = await render(
      html`<wc-illustration name="test-custom"></wc-illustration>`,
    );
    expect(art(el)?.querySelector('.test-mark')).to.exist;
  });

  it('loads registered art lazily and updates elements already shown', async () => {
    resetWarnOnce();
    const original = console.warn;
    console.warn = () => {};
    let el: Illustration;
    try {
      el = await render(
        html`<wc-illustration name="test-late"></wc-illustration>`,
      );
    } finally {
      console.warn = original;
    }
    expect(art(el)).to.equal(null);
    registerIllustration('test-late', () =>
      Promise.resolve(svg`<rect class="test-late" width="10" height="10"/>`),
    );
    await waitUntil(() => art(el)?.querySelector('.test-late'));
  });

  it('sizes with size, and a CSS width wins', async () => {
    const sm = await render(
      html`<wc-illustration name="empty" size="sm"></wc-illustration>`,
    );
    const md = await render(
      html`<wc-illustration name="empty"></wc-illustration>`,
    );
    const lg = await render(
      html`<wc-illustration name="empty" size="lg"></wc-illustration>`,
    );
    const custom = await render(
      html`<wc-illustration
        name="empty"
        style="width: 300px"
      ></wc-illustration>`,
    );
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    expect(sm.getBoundingClientRect().width).to.be.closeTo(6 * rem, 1);
    expect(md.getBoundingClientRect().width).to.be.closeTo(10 * rem, 1);
    expect(lg.getBoundingClientRect().width).to.be.closeTo(15 * rem, 1);
    expect(custom.getBoundingClientRect().width).to.be.closeTo(300, 1);
    expect(custom.getBoundingClientRect().height).to.be.closeTo(225, 1);
  });
});
