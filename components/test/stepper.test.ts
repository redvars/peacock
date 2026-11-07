/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixtureSync } from '@open-wc/testing';
import { Step, Stepper } from '../src/stepper/index.js';
import type { StepperChangeDetail } from '../src/stepper/index.js';

for (const [tag, element] of [
  ['wc-step', Step],
  ['wc-stepper', Stepper],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

function stepsOf(el: Stepper) {
  return Array.from(el.querySelectorAll<Step>('wc-step'));
}

/** Waits until the stepper and every step have rendered (steps re-render after the stepper). */
async function settle(el: Stepper) {
  for (let round = 0; round < 3; round += 1) {
    // eslint-disable-next-line no-await-in-loop
    await el.updateComplete;
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(stepsOf(el).map(step => step.updateComplete));
  }
}

async function stepper(template: ReturnType<typeof html>) {
  const el = fixtureSync<Stepper>(template);
  await settle(el);
  return { el, steps: stepsOf(el) };
}

function inner(step: Step) {
  return step.shadowRoot!.querySelector<HTMLElement>('.step')!;
}

function announcement(step: Step) {
  return step
    .shadowRoot!.querySelector('.screen-reader-only')!
    .textContent!.trim();
}

function press(target: Element, key: string) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    composed: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
  return event;
}

function checkout(navigation = 'none', current = 'shipping', dir = 'ltr') {
  return stepper(html`
    <wc-stepper navigation=${navigation} current=${current} dir=${dir}>
      <wc-step value="cart" label="Cart"></wc-step>
      <wc-step value="shipping" label="Shipping"></wc-step>
      <wc-step value="payment" label="Payment"></wc-step>
      <wc-step value="review" label="Review"></wc-step>
    </wc-stepper>
  `);
}

describe('Stepper', () => {
  describe('state', () => {
    it('derives complete, current and upcoming from current', async () => {
      const { steps } = await checkout();
      expect(steps.map(step => step.status)).to.deep.equal([
        'complete',
        'current',
        'upcoming',
        'upcoming',
      ]);
    });

    it('marks only the current step with aria-current="step"', async () => {
      const { steps } = await checkout();
      expect(inner(steps[1]).getAttribute('aria-current')).to.equal('step');
      for (const step of [steps[0], steps[2], steps[3]]) {
        expect(inner(step).hasAttribute('aria-current')).to.equal(false);
      }
    });

    it('shows a check on complete steps and numbers on the rest', async () => {
      const { steps } = await checkout();
      const icon = steps[0].shadowRoot!.querySelector('.status-icon')!;
      expect(icon.getAttribute('name')).to.equal('check');
      expect(
        steps[2].shadowRoot!.querySelector('.number')!.textContent!.trim(),
      ).to.equal('3');
    });

    it('falls back to the index when steps have no value', async () => {
      const { el, steps } = await stepper(html`
        <wc-stepper current="2">
          <wc-step label="One"></wc-step>
          <wc-step label="Two"></wc-step>
          <wc-step label="Three"></wc-step>
        </wc-stepper>
      `);
      expect(steps[2].status).to.equal('current');
      expect(steps[0].key).to.equal('0');
      el.current = '';
      await settle(el);
      expect(steps[0].status).to.equal('current');
    });

    it('treats an unknown current as the first step', async () => {
      const { steps } = await checkout('none', 'nope');
      expect(steps[0].status).to.equal('current');
    });

    it('updates when current changes', async () => {
      const { el, steps } = await checkout();
      el.current = 'review';
      await settle(el);
      expect(steps.map(step => step.status)).to.deep.equal([
        'complete',
        'complete',
        'complete',
        'current',
      ]);
    });
  });

  describe('overrides', () => {
    it('shows a warning icon and error text on an error step', async () => {
      const { el, steps } = await checkout();
      steps[0].error = true;
      steps[0].errorText = 'Cart is empty';
      await settle(el);
      const root = steps[0].shadowRoot!;
      expect(root.querySelector('.status-icon')!.getAttribute('name')).to.equal(
        'warning',
      );
      expect(root.querySelector('.error-text')!.textContent!.trim()).to.equal(
        'Cart is empty',
      );
      expect(announcement(steps[0])).to.equal(
        'Step 1 of 4, Cart, Error, Cart is empty',
      );
    });

    it('shows an Optional caption', async () => {
      const { el, steps } = await checkout();
      steps[2].optional = true;
      await settle(el);
      expect(
        steps[2].shadowRoot!.querySelector('.caption')!.textContent!.trim(),
      ).to.equal('Optional');
      expect(announcement(steps[2])).to.equal(
        'Step 3 of 4, Payment, Not started, Optional',
      );
    });

    it('never makes a disabled step clickable', async () => {
      const { el, steps } = await checkout('free');
      steps[2].disabled = true;
      await settle(el);
      expect(steps[2].clickable).to.equal(false);
      expect(inner(steps[2]).getAttribute('aria-disabled')).to.equal('true');
      expect(announcement(steps[2])).to.contain('Disabled');
    });
  });

  describe('accessibility', () => {
    it('is a list of list items with a name', async () => {
      const { el, steps } = await checkout();
      const list = el.shadowRoot!.querySelector('[role="list"]')!;
      expect(list.getAttribute('aria-label')).to.equal('Progress');
      expect(steps.every(step => step.getAttribute('role') === 'listitem')).to
        .be.true;
      el.label = 'Checkout';
      await settle(el);
      expect(list.getAttribute('aria-label')).to.equal('Checkout');
    });

    it('announces position, label and state', async () => {
      const { steps } = await checkout();
      expect(announcement(steps[0])).to.equal('Step 1 of 4, Cart, Completed');
      expect(announcement(steps[1])).to.equal('Step 2 of 4, Shipping');
      expect(announcement(steps[3])).to.equal(
        'Step 4 of 4, Review, Not started',
      );
    });

    it('renders no buttons and no tab stops without navigation', async () => {
      const { el, steps } = await checkout();
      expect(el.querySelector('[tabindex]')).to.equal(null);
      for (const step of steps) {
        expect(step.shadowRoot!.querySelector('button')).to.equal(null);
      }
    });
  });

  describe('navigation', () => {
    it('makes every step a button with navigation="free"', async () => {
      const { steps } = await checkout('free', 'cart');
      expect(steps.every(step => step.clickable)).to.be.true;
      expect(steps[3].shadowRoot!.querySelector('button')).to.not.equal(null);
    });

    it('blocks moving past the first unfinished step with navigation="linear"', async () => {
      const { steps } = await checkout('linear');
      expect(steps.map(step => step.clickable)).to.deep.equal([
        true,
        true,
        false,
        false,
      ]);
    });

    it('lets an optional step be skipped in a linear stepper', async () => {
      const { el, steps } = await checkout('linear');
      steps[1].optional = true;
      await settle(el);
      expect(steps.map(step => step.clickable)).to.deep.equal([
        true,
        true,
        true,
        false,
      ]);
    });

    it('stops a linear stepper at an earlier error step', async () => {
      const { el, steps } = await checkout('linear', 'payment');
      steps[0].error = true;
      await settle(el);
      expect(steps.map(step => step.clickable)).to.deep.equal([
        true,
        false,
        false,
        false,
      ]);
    });

    it('fires change and moves current on click', async () => {
      const { el, steps } = await checkout('free');
      let detail: StepperChangeDetail | undefined;
      el.addEventListener('change', event => {
        detail = (event as CustomEvent<StepperChangeDetail>).detail;
      });
      steps[3].shadowRoot!.querySelector('button')!.click();
      await settle(el);
      expect(detail).to.deep.equal({ value: 'review', index: 3 });
      expect(el.current).to.equal('review');
      expect(inner(steps[3]).getAttribute('aria-current')).to.equal('step');
    });

    it('keeps current when change is canceled', async () => {
      const { el, steps } = await checkout('free');
      el.addEventListener('change', event => event.preventDefault());
      steps[0].shadowRoot!.querySelector('button')!.click();
      await settle(el);
      expect(el.current).to.equal('shipping');
    });

    it('ignores clicks on blocked steps and on the current step', async () => {
      const { el, steps } = await checkout('linear');
      let fired = 0;
      el.addEventListener('change', () => {
        fired += 1;
      });
      inner(steps[3]).click();
      steps[1].shadowRoot!.querySelector('button')!.click();
      await settle(el);
      expect(fired).to.equal(0);
      expect(el.current).to.equal('shipping');
    });
  });

  describe('keyboard', () => {
    it('puts the one tab stop on the current step', async () => {
      const { steps } = await checkout('free');
      expect(steps.map(step => step.tabIndex)).to.deep.equal([-1, 0, -1, -1]);
    });

    it('moves focus with the arrow keys without activating', async () => {
      const { el, steps } = await checkout('free');
      steps[1].dispatchEvent(
        new FocusEvent('focusin', { bubbles: true, composed: true }),
      );
      press(steps[1], 'ArrowRight');
      await settle(el);
      expect(steps[2].tabIndex).to.equal(0);
      expect(el.current).to.equal('shipping');
      press(steps[2], 'End');
      await settle(el);
      expect(steps[3].tabIndex).to.equal(0);
      press(steps[3], 'Home');
      await settle(el);
      expect(steps[0].tabIndex).to.equal(0);
    });

    it('skips blocked steps in a linear stepper', async () => {
      const { el, steps } = await checkout('linear');
      press(steps[1], 'ArrowRight');
      await settle(el);
      // Wraps to the first step: the later ones are not reachable.
      expect(steps[0].tabIndex).to.equal(0);
    });

    it('mirrors the arrow keys in right-to-left layouts', async () => {
      const { el, steps } = await checkout('free', 'shipping', 'rtl');
      press(steps[1], 'ArrowLeft');
      await settle(el);
      expect(steps[2].tabIndex).to.equal(0);
    });

    it('uses Up and Down when vertical', async () => {
      const { el, steps } = await checkout('free');
      el.orientation = 'vertical';
      await settle(el);
      press(steps[1], 'ArrowDown');
      await settle(el);
      expect(steps[2].tabIndex).to.equal(0);
      expect(inner(steps[2]).classList.contains('vertical')).to.be.true;
    });
  });

  describe('methods', () => {
    it('next() and previous() move current without firing change', async () => {
      const { el, steps } = await checkout();
      let fired = 0;
      el.addEventListener('change', () => {
        fired += 1;
      });
      el.next();
      expect(el.current).to.equal('payment');
      el.previous();
      el.previous();
      expect(el.current).to.equal('cart');
      el.previous();
      expect(el.current).to.equal('cart');
      steps[1].disabled = true;
      await settle(el);
      el.next();
      expect(el.current).to.equal('payment');
      el.next();
      el.next();
      expect(el.current).to.equal('review');
      expect(fired).to.equal(0);
    });

    it('moves the tab stop with current', async () => {
      const { el, steps } = await checkout('free');
      el.next();
      await settle(el);
      expect(steps[2].tabIndex).to.equal(0);
    });
  });
});
