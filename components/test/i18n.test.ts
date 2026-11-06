/// <reference types="mocha" />
import { html, LitElement } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import {
  defaultStrings,
  peacockString,
  setPeacockStrings,
  type PeacockStrings,
} from '../src/__internal/i18n/strings.js';
import { I18nController } from '../src/__internal/i18n/i18n-controller.js';
import { isRtl, resolveLocale } from '../src/__internal/i18n/locale.js';

class I18nHost extends LitElement {
  static properties = { strings: { attribute: false }, locale: {} };

  strings?: Partial<PeacockStrings>;

  locale?: string;

  readonly i18n = new I18nController(this);

  render() {
    return html`<button aria-label=${this.i18n.t('dismiss')}></button>`;
  }
}
if (!customElements.get('test-i18n-host')) {
  customElements.define('test-i18n-host', I18nHost);
}

class ShadowParent extends LitElement {
  render() {
    return html`<test-i18n-host></test-i18n-host>`;
  }
}
if (!customElements.get('test-shadow-parent')) {
  customElements.define('test-shadow-parent', ShadowParent);
}

function label(el: I18nHost) {
  return el.shadowRoot!.querySelector('button')!.getAttribute('aria-label');
}

describe('Peacock strings', () => {
  afterEach(() => setPeacockStrings({}));

  it('uses the English defaults', async () => {
    const el = await fixture<I18nHost>(html`<test-i18n-host></test-i18n-host>`);
    expect(label(el)).to.equal('Dismiss');
  });

  it('re-renders connected components when the app sets strings', async () => {
    const el = await fixture<I18nHost>(html`<test-i18n-host></test-i18n-host>`);
    setPeacockStrings({ dismiss: 'Fermer' });
    await el.updateComplete;
    expect(label(el)).to.equal('Fermer');
  });

  it('keeps defaults for entries left out, and resets on a new call', () => {
    setPeacockStrings({ dismiss: 'Fermer' });
    expect(peacockString('close')).to.equal(defaultStrings.close);
    setPeacockStrings({ close: 'Schließen' });
    expect(peacockString('dismiss')).to.equal('Dismiss');
  });

  it('prefers a per-instance override', async () => {
    setPeacockStrings({ dismiss: 'Fermer' });
    const el = await fixture<I18nHost>(
      html`<test-i18n-host .strings=${{ dismiss: 'Cerrar' }}></test-i18n-host>`,
    );
    expect(label(el)).to.equal('Cerrar');
  });

  it('formats strings with values', () => {
    expect(peacockString('selectedCount')('3')).to.equal('3 selected');
    expect(peacockString('pageRange')('1', '10', '42')).to.equal('1–10 of 42');
    expect(peacockString('pageRange')('1', '10')).to.equal('1–10');
  });
});

describe('resolveLocale', () => {
  it('prefers the explicit locale', () => {
    expect(resolveLocale('fr-FR')).to.equal('fr-FR');
  });

  it('uses the nearest lang, across shadow roots', async () => {
    const wrapper = await fixture<HTMLDivElement>(
      html`<div lang="de-DE"><test-shadow-parent></test-shadow-parent></div>`,
    );
    const parent = wrapper.querySelector<ShadowParent>('test-shadow-parent')!;
    await parent.updateComplete;
    const host = parent.shadowRoot!.querySelector<I18nHost>('test-i18n-host')!;

    expect(host.i18n.locale).to.equal('de-DE');
    host.locale = 'ja-JP';
    expect(host.i18n.locale).to.equal('ja-JP');
  });

  it('falls back to the document or browser language', () => {
    const expected = document.documentElement.lang || navigator.language;
    expect(resolveLocale(undefined, document.body)).to.equal(expected);
  });
});

describe('isRtl', () => {
  it('reads the computed direction', async () => {
    const el = await fixture<HTMLDivElement>(
      html`<div dir="rtl"><span></span></div>`,
    );
    expect(isRtl(el.querySelector('span')!)).to.be.true;
    expect(isRtl(document.body)).to.be.false;
  });
});
