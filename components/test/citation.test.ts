/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import { Citation, type CitationSelectDetail } from '../src/citation/index.js';
import { setPeacockAi } from '../src/__internal/ai/config.js';

if (!customElements.get('wc-citation')) {
  customElements.define('wc-citation', Citation);
}

const chip = (el: Citation) =>
  el.shadowRoot!.querySelector('.chip') as HTMLElement;

describe('Citation', () => {
  afterEach(() => setPeacockAi({}));

  it('is a button without href and a link with one', async () => {
    const button = await fixture<Citation>(
      html`<wc-citation label="1" value="role_4"></wc-citation>`,
    );
    expect(chip(button).localName).to.equal('button');
    expect(chip(button).textContent?.trim()).to.equal('1');

    const link = await fixture<Citation>(
      html`<wc-citation label="2" href="/rules/88"></wc-citation>`,
    );
    expect(chip(link).localName).to.equal('a');
    expect(chip(link).getAttribute('href')).to.equal('/rules/88');
  });

  it('never follows an unsafe address', async () => {
    const el = await fixture<Citation>(
      html`<wc-citation label="1" href="javascript:alert(1)"></wc-citation>`,
    );
    expect(chip(el).localName).to.equal('button');
  });

  it('is named for the source, so it reads well out of context', async () => {
    const el = await fixture<Citation>(
      html`<wc-citation
        label="2"
        headline="Payroll integration reads Employee.Salary"
      ></wc-citation>`,
    );
    expect(chip(el).getAttribute('aria-label')).to.equal(
      'Source 2: Payroll integration reads Employee.Salary',
    );
    const bare = await fixture<Citation>(
      html`<wc-citation label="3"></wc-citation>`,
    );
    expect(chip(bare).getAttribute('aria-label')).to.equal('Source 3');
  });

  it('fires select, and cancelling it stops the link', async () => {
    const el = await fixture<Citation>(
      html`<wc-citation
        label="2"
        value="rule_88"
        href="#rule-88"
      ></wc-citation>`,
    );
    el.addEventListener('select', event => event.preventDefault());
    const clicked = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      composed: true,
    });
    setTimeout(() => chip(el).dispatchEvent(clicked));
    const event = (await oneEvent(
      el,
      'select',
    )) as CustomEvent<CitationSelectDetail>;
    expect(event.detail).to.deep.equal({
      value: 'rule_88',
      label: '2',
      href: '#rule-88',
    });
    expect(clicked.defaultPrevented).to.equal(true);
  });

  it('shows a preview only when there is something to preview', async () => {
    const bare = await fixture<Citation>(
      html`<wc-citation label="1"></wc-citation>`,
    );
    expect(bare.shadowRoot!.querySelector('wc-hover-card')).to.equal(null);

    const described = await fixture<Citation>(
      html`<wc-citation
        label="1"
        headline="HR manager"
        supporting-text="Role · Human resources"
      ></wc-citation>`,
    );
    const preview = described.shadowRoot!.querySelector('.preview');
    expect(preview?.querySelector('.headline')?.textContent).to.equal(
      'HR manager',
    );
    expect(preview?.querySelector('.supporting-text')?.textContent).to.equal(
      'Role · Human resources',
    );

    const slotted = await fixture<Citation>(
      html`<wc-citation label="1"><span>Granted 3 Oct</span></wc-citation>`,
    );
    await slotted.updateComplete;
    expect(slotted.shadowRoot!.querySelector('wc-hover-card')).to.not.equal(
      null,
    );
  });

  it('keeps working with AI off, because a source is a fact', async () => {
    setPeacockAi({ enabled: false });
    const el = await fixture<Citation>(
      html`<wc-citation label="1"></wc-citation>`,
    );
    expect(chip(el)).to.not.equal(null);
  });
});
