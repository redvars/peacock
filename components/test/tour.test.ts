/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixtureSync } from '@open-wc/testing';
import { Tour, type TourStep } from '../src/tour/index.js';
import { resetWarnOnce } from '../src/__internal/utils/warn-once.js';

if (!customElements.get('wc-tour')) customElements.define('wc-tour', Tour);

const STEPS: TourStep[] = [
  { target: 'tour-a', headline: 'First', body: 'The first target.' },
  { target: '#tour-b', headline: 'Second', placement: 'end' },
  { target: '[data-tour="c"]', headline: 'Third', body: 'Last one.' },
];

interface Setup {
  tour: Tour;
  page: HTMLElement;
}

async function setup(steps: TourStep[] = STEPS): Promise<Setup> {
  const page = fixtureSync<HTMLElement>(
    html`<div>
      <button id="tour-a">A</button>
      <button id="tour-b">B</button>
      <button data-tour="c">C</button>
      <wc-tour .steps=${steps}></wc-tour>
    </div>`,
  );
  const tour = page.querySelector('wc-tour') as Tour;
  await tour.updateComplete;
  return { tour, page };
}

function q(tour: Tour, selector: string) {
  return tour.shadowRoot!.querySelector<HTMLElement>(selector);
}

function record(el: Element, type: string) {
  const events: CustomEvent[] = [];
  el.addEventListener(type, e => events.push(e as CustomEvent));
  return events;
}

async function settle(tour: Tour) {
  await tour.updateComplete;
  await tour.updateComplete;
}

describe('wc-tour', () => {
  afterEach(() => {
    document.querySelectorAll<Tour>('wc-tour').forEach(tour => tour.end());
  });

  it('starts on the first step and shows the popup', async () => {
    const { tour } = await setup();
    const opens = record(tour, 'open');
    const changes = record(tour, 'step-change');
    tour.start();
    await settle(tour);
    expect(tour.open).to.be.true;
    expect(opens).to.have.length(1);
    expect(changes.map(e => e.detail.index)).to.deep.equal([0]);
    expect(changes[0].detail.step.headline).to.equal('First');
    expect(q(tour, '.layer')!.matches(':popover-open')).to.be.true;
    const popup = q(tour, '.popup')!;
    expect(popup.getAttribute('role')).to.equal('dialog');
    expect(popup.getAttribute('aria-labelledby')).to.equal('headline');
    expect(popup.getAttribute('aria-describedby')).to.equal('body');
    expect(popup.hasAttribute('aria-modal')).to.be.false;
    expect(q(tour, '.progress')!.textContent).to.equal('Step 1 of 3');
    expect(q(tour, '.headline')!.textContent).to.equal('First');
    expect(q(tour, '.back')).to.be.null;
    expect(q(tour, '.next')!.textContent!.trim()).to.equal('Next');
  });

  it('puts the spotlight over the target and leaves clicks to the page', async () => {
    const { tour, page } = await setup();
    tour.start();
    await settle(tour);
    const target = page.querySelector('#tour-a')!;
    const spotlight = q(tour, '.spotlight')!;
    const rect = target.getBoundingClientRect();
    expect(spotlight.style.getPropertyValue('--_x')).to.equal(`${rect.left}px`);
    expect(getComputedStyle(q(tour, '.layer')!).pointerEvents).to.equal('none');
    expect(getComputedStyle(q(tour, '.popup')!).pointerEvents).to.equal('auto');
  });

  it('moves with next, previous and the buttons, then completes', async () => {
    const { tour } = await setup();
    const changes = record(tour, 'step-change');
    const closes = record(tour, 'close');
    tour.start();
    await settle(tour);
    tour.next();
    await settle(tour);
    expect(tour.current).to.equal(1);
    expect(q(tour, '.progress')!.textContent).to.equal('Step 2 of 3');
    tour.previous();
    await settle(tour);
    expect(tour.current).to.equal(0);
    q(tour, '.next')!.click();
    await settle(tour);
    q(tour, '.next')!.click();
    await settle(tour);
    expect(tour.current).to.equal(2);
    expect(q(tour, '.next')!.textContent!.trim()).to.equal('Done');
    q(tour, '.back')!.click();
    await settle(tour);
    expect(tour.current).to.equal(1);
    tour.next();
    await settle(tour);
    q(tour, '.next')!.click();
    await settle(tour);
    expect(tour.open).to.be.false;
    expect(changes.map(e => e.detail.index)).to.deep.equal([
      0, 1, 0, 1, 2, 1, 2,
    ]);
    expect(closes.map(e => e.detail)).to.deep.equal([
      { reason: 'action', completed: true },
    ]);
  });

  it('skip closes without completing', async () => {
    const { tour } = await setup();
    const closes = record(tour, 'close');
    tour.start(1);
    await settle(tour);
    expect(tour.current).to.equal(1);
    expect(q(tour, '.skip')!.getAttribute('aria-label')).to.equal('Skip tour');
    q(tour, '.skip')!.click();
    await settle(tour);
    expect(closes[0].detail).to.deep.equal({
      reason: 'action',
      completed: false,
    });
    expect(q(tour, '.layer')!.matches(':popover-open')).to.be.false;
  });

  it('Escape closes with reason escape; end() with api', async () => {
    const { tour } = await setup();
    const closes = record(tour, 'close');
    tour.start();
    await settle(tour);
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await settle(tour);
    expect(closes[0].detail).to.deep.equal({
      reason: 'escape',
      completed: false,
    });
    tour.start();
    await settle(tour);
    tour.end();
    await settle(tour);
    expect(closes[1].detail).to.deep.equal({ reason: 'api', completed: false });
  });

  it('next() on the last step completes with reason api', async () => {
    const { tour } = await setup();
    const closes = record(tour, 'close');
    tour.start(2);
    await settle(tour);
    tour.next();
    await settle(tour);
    expect(closes[0].detail).to.deep.equal({ reason: 'api', completed: true });
  });

  it('arrow keys move between steps, mirrored in RTL', async () => {
    const { tour } = await setup();
    tour.start();
    await settle(tour);
    const press = (key: string) =>
      q(tour, '.popup')!.dispatchEvent(
        new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
      );
    press('ArrowRight');
    await settle(tour);
    expect(tour.current).to.equal(1);
    press('ArrowLeft');
    await settle(tour);
    expect(tour.current).to.equal(0);
    tour.setAttribute('dir', 'rtl');
    press('ArrowLeft');
    await settle(tour);
    expect(tour.current).to.equal(1);
  });

  it('skips a step whose target is missing, warning once', async () => {
    resetWarnOnce();
    const warnings: string[] = [];
    const { warn } = console;
    console.warn = (message: string) => warnings.push(message);
    try {
      const { tour } = await setup([
        { target: 'nope', headline: 'Missing' },
        { target: 'tour-a', headline: 'A' },
        { target: '.also-missing', headline: 'Missing too' },
        { target: 'tour-b', headline: 'B' },
      ]);
      const closes = record(tour, 'close');
      tour.start();
      await settle(tour);
      expect(tour.current).to.equal(1);
      tour.next();
      await settle(tour);
      expect(tour.current).to.equal(3);
      tour.previous();
      await settle(tour);
      expect(tour.current).to.equal(1);
      tour.previous();
      await settle(tour);
      expect(tour.current).to.equal(1);
      expect(warnings.filter(w => w.includes('"nope"'))).to.have.length(1);
      expect(warnings.some(w => w.includes('.also-missing'))).to.be.true;
      tour.end();
      await settle(tour);
      expect(closes).to.have.length(1);
    } finally {
      console.warn = warn;
    }
  });

  it('does not open when no step can be shown', async () => {
    resetWarnOnce();
    const { warn } = console;
    console.warn = () => undefined;
    try {
      const { tour } = await setup([{ target: 'nope', headline: 'Missing' }]);
      const opens = record(tour, 'open');
      tour.start();
      await settle(tour);
      expect(tour.open).to.be.false;
      expect(opens).to.have.length(0);
    } finally {
      console.warn = warn;
    }
  });

  it('centers a step without a target', async () => {
    const { tour } = await setup([
      { headline: 'Welcome', body: 'Hi' },
      { target: 'tour-a', headline: 'A' },
    ]);
    tour.start();
    await settle(tour);
    expect(q(tour, '.popup')!.classList.contains('centered')).to.be.true;
    expect(q(tour, '.spotlight')!.classList.contains('full')).to.be.true;
    tour.next();
    await settle(tour);
    expect(q(tour, '.popup')!.classList.contains('centered')).to.be.false;
  });

  it('moves focus into the popup', async () => {
    const { tour } = await setup();
    tour.start();
    await settle(tour);
    expect(tour.shadowRoot!.activeElement).to.equal(q(tour, '.popup'));
  });
});
