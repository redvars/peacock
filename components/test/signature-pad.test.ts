/// <reference types="mocha" />
import { html, type TemplateResult } from 'lit';
import { expect, fixtureSync, waitUntil } from '@open-wc/testing';
import {
  dataUrlToFile,
  SignaturePad,
  type SignaturePadChangeDetail,
} from '../src/signature-pad/index.js';
import { IconButton } from '../src/button/index.js';

for (const [tag, element] of [
  ['wc-icon-button', IconButton],
  ['wc-signature-pad', SignaturePad],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

function canvas(el: SignaturePad) {
  return el.shadowRoot!.querySelector('canvas')!;
}

function button(el: SignaturePad, name: string) {
  return el.shadowRoot!.querySelector<IconButton>(`.${name}-button`);
}

/** Draws a stroke through `points`, given as fractions of the pad's width and height. */
async function draw(
  el: SignaturePad,
  points: [number, number][],
  pointerType = 'mouse',
  pressure = 0.5,
) {
  const target = canvas(el);
  const rect = target.getBoundingClientRect();
  const init = ([x, y]: [number, number]) => ({
    pointerId: 7,
    pointerType,
    pressure,
    button: 0,
    clientX: rect.left + rect.width * x,
    clientY: rect.top + rect.height * y,
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(new PointerEvent('pointerdown', init(points[0])));
  for (const point of points.slice(1)) {
    target.dispatchEvent(new PointerEvent('pointermove', init(point)));
  }
  target.dispatchEvent(
    new PointerEvent('pointerup', init(points[points.length - 1])),
  );
  await el.updateComplete;
}

/** The RGBA of the pixel at fractions `x`, `y` of an image. */
async function pixelAt(dataUrl: string, x: number, y: number) {
  const image = new Image();
  image.src = dataUrl;
  await image.decode();
  const scratch = document.createElement('canvas');
  scratch.width = image.naturalWidth;
  scratch.height = image.naturalHeight;
  const context = scratch.getContext('2d')!;
  context.drawImage(image, 0, 0);
  return Array.from(
    context.getImageData(
      Math.floor(image.naturalWidth * x),
      Math.floor(image.naturalHeight * y),
      1,
      1,
    ).data,
  );
}

async function create(template: TemplateResult) {
  const el = fixtureSync(template) as SignaturePad;
  await el.updateComplete;
  return el;
}

const LINE: [number, number][] = [
  [0.1, 0.5],
  [0.3, 0.5],
  [0.5, 0.5],
  [0.7, 0.5],
  [0.9, 0.5],
];

describe('SignaturePad', () => {
  it('starts empty and names its drawing', async () => {
    const el = await create(
      html`<wc-signature-pad label="Sign below"></wc-signature-pad>`,
    );
    expect(el.value).to.equal('');
    expect(el.empty).to.be.true;
    expect(canvas(el).getAttribute('role')).to.equal('img');
    expect(canvas(el).getAttribute('aria-label')).to.equal('Sign below, empty');
    expect(el.shadowRoot!.querySelector('.hint')?.textContent).to.equal(
      'Sign here',
    );
  });

  it('sizes the canvas at the device pixel ratio', async () => {
    const el = await create(
      html`<wc-signature-pad style="width: 300px"></wc-signature-pad>`,
    );
    const ratio = window.devicePixelRatio || 1;
    expect(canvas(el).width).to.equal(Math.round(300 * ratio));
  });

  it('records a stroke and fires change with a PNG data URL', async () => {
    const el = await create(html`<wc-signature-pad></wc-signature-pad>`);
    const values: string[] = [];
    el.addEventListener('change', event =>
      values.push(
        (event as CustomEvent<SignaturePadChangeDetail>).detail.value,
      ),
    );
    await draw(el, LINE);
    expect(el.value).to.match(/^data:image\/png;base64,/);
    expect(values).to.deep.equal([el.value]);
    expect(canvas(el).getAttribute('aria-label')).to.equal('Signature, signed');
    expect(el.shadowRoot!.querySelector('.hint')).to.equal(null);
  });

  it('exports with the export ink on a transparent background', async () => {
    const el = await create(
      html`<wc-signature-pad
        style="--signature-pad-ink-color: rgb(255, 255, 255)"
      ></wc-signature-pad>`,
    );
    await draw(el, LINE);
    const ink = await pixelAt(el.value, 0.5, 0.5);
    expect(ink[3]).to.be.greaterThan(200);
    expect(ink[0] + ink[1] + ink[2]).to.be.lessThan(60);
    const background = await pixelAt(el.value, 0.5, 0.1);
    expect(background[3]).to.equal(0);
  });

  it('undoes the last stroke and clears', async () => {
    const el = await create(html`<wc-signature-pad></wc-signature-pad>`);
    expect(button(el, 'undo')?.disabled).to.be.true;
    await draw(el, LINE);
    const one = el.value;
    await draw(el, [
      [0.5, 0.1],
      [0.5, 0.9],
    ]);
    expect(el.value).to.not.equal(one);
    expect(button(el, 'undo')?.getAttribute('aria-label')).to.equal(
      'Undo last stroke',
    );
    button(el, 'undo')!.click();
    await el.updateComplete;
    expect(el.value).to.equal(one);
    const changes: string[] = [];
    el.addEventListener('change', event =>
      changes.push(
        (event as CustomEvent<SignaturePadChangeDetail>).detail.value,
      ),
    );
    button(el, 'clear')!.click();
    await el.updateComplete;
    expect(el.value).to.equal('');
    expect(changes).to.deep.equal(['']);
    expect(button(el, 'clear')?.getAttribute('shape')).to.equal('round');
  });

  it('draws a dot for a tap and pen strokes by pressure', async () => {
    const el = await create(html`<wc-signature-pad></wc-signature-pad>`);
    await draw(el, [[0.5, 0.5]]);
    expect(el.value).to.not.equal('');
    el.clear();
    await draw(el, LINE, 'pen', 1);
    const heavy = await pixelAt(el.value, 0.5, 0.5 + 1.5 / 160);
    el.clear();
    await draw(el, LINE, 'pen', 0.1);
    const light = await pixelAt(el.value, 0.5, 0.5 + 1.5 / 160);
    expect(heavy[3]).to.be.greaterThan(light[3]);
  });

  it('keeps strokes when it resizes', async () => {
    const el = await create(
      html`<wc-signature-pad style="width: 300px"></wc-signature-pad>`,
    );
    await draw(el, LINE);
    el.style.width = '200px';
    const ratio = window.devicePixelRatio || 1;
    await waitUntil(
      () => canvas(el).width === Math.round(200 * ratio),
      'resizes the canvas',
    );
    const context = canvas(el).getContext('2d')!;
    // Strokes scale with the width: the line drawn halfway down a 300px-wide pad is now at
    // two thirds of that height.
    const { width, height } = canvas(el);
    const pixel = context.getImageData(
      Math.floor(width / 2),
      Math.floor((height / 2) * (200 / 300)),
      1,
      1,
    ).data;
    expect(pixel[3]).to.be.greaterThan(0);
  });

  it('takes a typed name instead, by keyboard', async () => {
    const el = await create(html`<wc-signature-pad></wc-signature-pad>`);
    const mode = button(el, 'mode')!;
    expect(mode.getAttribute('aria-label')).to.equal('Type your name instead');
    mode.click();
    await el.updateComplete;
    const input =
      el.shadowRoot!.querySelector<HTMLInputElement>('.name-input')!;
    expect(input).to.exist;
    expect(
      el.shadowRoot!.querySelector(`label[for="${input.id}"]`)?.textContent,
    ).to.equal('Your name');
    expect(button(el, 'mode')?.getAttribute('aria-label')).to.equal(
      'Draw instead',
    );
    expect(button(el, 'undo')).to.equal(null);

    const events: string[] = [];
    el.addEventListener('input', () => events.push('input'));
    el.addEventListener('change', () => events.push('change'));
    input.value = 'Ada Lovelace';
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(el.value).to.match(/^data:image\/png/);
    input.dispatchEvent(new Event('change', { bubbles: true }));
    expect(events).to.deep.equal(['input', 'change']);

    // Back to drawing: the empty drawing is the value again.
    button(el, 'mode')!.click();
    await el.updateComplete;
    expect(el.value).to.equal('');
  });

  it('loads an image with fromDataURL and value', async () => {
    const source = await create(html`<wc-signature-pad></wc-signature-pad>`);
    await draw(source, LINE);
    const el = await create(html`<wc-signature-pad></wc-signature-pad>`);
    await el.fromDataURL(source.value);
    await el.updateComplete;
    expect(el.value).to.equal(source.value);
    expect(el.empty).to.be.false;
    el.value = '';
    await el.updateComplete;
    expect(el.empty).to.be.true;
  });

  it('exports a blob', async () => {
    const el = await create(html`<wc-signature-pad></wc-signature-pad>`);
    await draw(el, LINE);
    const blob = await el.toBlob();
    expect(blob?.type).to.equal('image/png');
    expect(el.toDataURL('image/jpeg')).to.match(/^data:image\/jpeg/);
  });

  it('submits a PNG file, validates and resets with its form', async () => {
    const form = fixtureSync(
      html`<form>
        <wc-signature-pad name="signature" required></wc-signature-pad>
      </form>`,
    ) as HTMLFormElement;
    const el = form.querySelector('wc-signature-pad') as SignaturePad;
    await el.updateComplete;
    expect(el.checkValidity()).to.be.false;
    expect(el.validationMessage).to.equal('Please sign.');
    expect(new FormData(form).has('signature')).to.be.false;

    await draw(el, LINE);
    const file = new FormData(form).get('signature') as File;
    expect(file).to.be.instanceOf(File);
    expect(file.name).to.equal('signature.png');
    expect(file.type).to.equal('image/png');
    expect(file.size).to.be.greaterThan(0);
    expect(el.checkValidity()).to.be.true;

    form.reset();
    await el.updateComplete;
    expect(el.value).to.equal('');
    expect(el.empty).to.be.true;
  });

  it('does not draw while disabled or read-only', async () => {
    const el = await create(
      html`<wc-signature-pad disabled></wc-signature-pad>`,
    );
    await draw(el, LINE);
    expect(el.value).to.equal('');
    expect(button(el, 'mode')?.disabled).to.be.true;
    el.disabled = false;
    el.readonly = true;
    await el.updateComplete;
    await draw(el, LINE);
    expect(el.value).to.equal('');
    expect(el.shadowRoot!.querySelector('.toolbar')).to.equal(null);
  });

  it('decodes data URLs into files', () => {
    const file = dataUrlToFile('data:text/plain;base64,aGk=', 'a.txt');
    expect(file?.type).to.equal('text/plain');
    expect(file?.size).to.equal(2);
    expect(dataUrlToFile('nope', 'a')).to.equal(null);
  });
});
