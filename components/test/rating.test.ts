/// <reference types="mocha" />
import { html, type TemplateResult } from 'lit';
import { expect, fixtureSync } from '@open-wc/testing';
import { Rating, type RatingChangeDetail } from '../src/rating/index.js';

if (!customElements.get('wc-rating'))
  customElements.define('wc-rating', Rating);

function stars(el: Rating) {
  return el.shadowRoot!.querySelector<HTMLElement>('.stars')!;
}

function starElements(el: Rating) {
  return Array.from(el.shadowRoot!.querySelectorAll<HTMLElement>('.star'));
}

function fills(el: Rating) {
  return starElements(el).map(star => star.style.getPropertyValue('--_fill'));
}

async function press(el: Rating, key: string) {
  stars(el).dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
  );
  await el.updateComplete;
}

/** Points at star `index`, `fraction` of the way across from its left edge. */
function pointerInit(el: Rating, index: number, fraction: number) {
  const rect = starElements(el)[index].getBoundingClientRect();
  return {
    clientX: rect.left + rect.width * fraction,
    clientY: rect.top + rect.height / 2,
    bubbles: true,
  };
}

async function click(el: Rating, index: number, fraction = 0.75) {
  starElements(el)[index].dispatchEvent(
    new MouseEvent('click', pointerInit(el, index, fraction)),
  );
  await el.updateComplete;
}

async function create(template: TemplateResult) {
  const el = fixtureSync(template) as Rating;
  await el.updateComplete;
  return el;
}

describe('Rating', () => {
  it('is a slider with value text', async () => {
    const el = await create(
      html`<wc-rating label="Your rating" value="3"></wc-rating>`,
    );
    const slider = stars(el);
    expect(slider.getAttribute('role')).to.equal('slider');
    expect(slider.getAttribute('tabindex')).to.equal('0');
    expect(slider.getAttribute('aria-valuemin')).to.equal('0');
    expect(slider.getAttribute('aria-valuemax')).to.equal('5');
    expect(slider.getAttribute('aria-valuenow')).to.equal('3');
    expect(slider.getAttribute('aria-valuetext')).to.equal('3 out of 5');
    const labelId = slider.getAttribute('aria-labelledby')!;
    expect(el.shadowRoot!.getElementById(labelId)?.textContent).to.contain(
      'Your rating',
    );
    expect(starElements(el)).to.have.length(5);
    expect(fills(el)).to.deep.equal(['100%', '100%', '100%', '0%', '0%']);
  });

  it('says "No rating" without a value and names itself by default', async () => {
    const el = await create(html`<wc-rating></wc-rating>`);
    expect(stars(el).getAttribute('aria-valuetext')).to.equal('No rating');
    expect(stars(el).getAttribute('aria-label')).to.equal('Rating');
  });

  it('changes with the arrow keys, Home, End and digits', async () => {
    const el = await create(html`<wc-rating value="2"></wc-rating>`);
    const values: number[] = [];
    el.addEventListener('change', event =>
      values.push((event as CustomEvent<RatingChangeDetail>).detail.value),
    );
    await press(el, 'ArrowRight');
    await press(el, 'ArrowUp');
    await press(el, 'ArrowLeft');
    await press(el, 'ArrowDown');
    await press(el, 'End');
    await press(el, 'Home');
    await press(el, '4');
    await press(el, '9');
    expect(values).to.deep.equal([3, 4, 3, 2, 5, 1, 4]);
    expect(el.value).to.equal(4);
  });

  it('does not go back to no rating without clearable', async () => {
    const el = await create(html`<wc-rating value="1"></wc-rating>`);
    await press(el, 'ArrowLeft');
    await press(el, 'Home');
    await press(el, '0');
    expect(el.value).to.equal(1);
  });

  it('clears with the keys and by choosing the value again when clearable', async () => {
    const el = await create(html`<wc-rating clearable value="1"></wc-rating>`);
    await press(el, 'ArrowLeft');
    expect(el.value).to.equal(0);
    await click(el, 2);
    expect(el.value).to.equal(3);
    await click(el, 2);
    expect(el.value).to.equal(0);
  });

  it('mirrors the arrow keys in right-to-left layouts', async () => {
    const wrapper = fixtureSync(
      html`<div dir="rtl"><wc-rating value="2"></wc-rating></div>`,
    );
    const el = wrapper.querySelector('wc-rating') as Rating;
    await el.updateComplete;
    await press(el, 'ArrowLeft');
    expect(el.value).to.equal(3);
    await press(el, 'ArrowRight');
    expect(el.value).to.equal(2);
  });

  it('picks half stars from the start half of a star', async () => {
    const el = await create(html`<wc-rating precision="0.5"></wc-rating>`);
    await click(el, 2, 0.25);
    expect(el.value).to.equal(2.5);
    expect(fills(el)).to.deep.equal(['100%', '100%', '50%', '0%', '0%']);
    await press(el, 'ArrowRight');
    expect(el.value).to.equal(3);
    expect(stars(el).getAttribute('aria-valuetext')).to.equal('3 out of 5');
  });

  it('picks the start half from the right in right-to-left layouts', async () => {
    const wrapper = fixtureSync(
      html`<div dir="rtl"><wc-rating precision="0.5"></wc-rating></div>`,
    );
    const el = wrapper.querySelector('wc-rating') as Rating;
    await el.updateComplete;
    await click(el, 0, 0.75);
    expect(el.value).to.equal(0.5);
  });

  it('previews on hover without changing the value', async () => {
    const el = await create(html`<wc-rating value="1"></wc-rating>`);
    let fired = 0;
    el.addEventListener('input', () => {
      fired += 1;
    });
    starElements(el)[3].dispatchEvent(
      new PointerEvent('pointermove', pointerInit(el, 3, 0.5)),
    );
    await el.updateComplete;
    expect(fills(el)).to.deep.equal(['100%', '100%', '100%', '100%', '0%']);
    expect(el.value).to.equal(1);
    stars(el).dispatchEvent(new PointerEvent('pointerleave'));
    await el.updateComplete;
    expect(fills(el)[1]).to.equal('0%');
    expect(fired).to.equal(0);
  });

  it('fires input and change with the value when committed', async () => {
    const el = await create(html`<wc-rating></wc-rating>`);
    const events: string[] = [];
    for (const type of ['input', 'change']) {
      el.addEventListener(type, event => {
        const { detail, bubbles, composed } = event as CustomEvent;
        expect(bubbles && composed).to.be.true;
        events.push(`${type}:${detail.value}`);
      });
    }
    await click(el, 3);
    expect(events).to.deep.equal(['input:4', 'change:4']);
  });

  it('shows a read-only average as one image with partial fill', async () => {
    const el = await create(html`<wc-rating readonly value="4.3"></wc-rating>`);
    const display = stars(el);
    expect(display.getAttribute('role')).to.equal('img');
    expect(display.getAttribute('aria-label')).to.equal('Rated 4.3 out of 5');
    expect(display.hasAttribute('tabindex')).to.be.false;
    const fill = fills(el)[4];
    expect(parseFloat(fill)).to.be.closeTo(30, 0.01);
    await press(el, 'End');
    expect(el.value).to.equal(4.3);
  });

  it('honours max and a custom icon', async () => {
    const el = await create(
      html`<wc-rating max="10" icon="favorite" value="7"></wc-rating>`,
    );
    expect(starElements(el)).to.have.length(10);
    const icons = starElements(el)[0].querySelectorAll('wc-icon');
    expect(icons[0].getAttribute('name')).to.equal('favorite');
    expect(icons[1].getAttribute('name')).to.equal('favorite-fill');
    expect(stars(el).getAttribute('aria-valuetext')).to.equal('7 out of 10');
  });

  it('does nothing while disabled', async () => {
    const el = await create(html`<wc-rating disabled value="2"></wc-rating>`);
    expect(stars(el).getAttribute('tabindex')).to.equal('-1');
    expect(stars(el).getAttribute('aria-disabled')).to.equal('true');
    await press(el, 'ArrowRight');
    await click(el, 4);
    expect(el.value).to.equal(2);
  });

  it('submits, validates and resets with its form', async () => {
    const form = fixtureSync(
      html`<form>
        <wc-rating name="score" required></wc-rating>
      </form>`,
    ) as HTMLFormElement;
    const el = form.querySelector('wc-rating') as Rating;
    await el.updateComplete;
    expect(new FormData(form).has('score')).to.be.false;
    expect(el.checkValidity()).to.be.false;
    expect(el.validationMessage).to.equal('Please choose a rating.');
    form.requestSubmit();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.helper')?.textContent).to.contain(
      'Please choose a rating.',
    );
    expect(stars(el).getAttribute('aria-invalid')).to.equal('true');

    await click(el, 3);
    expect(new FormData(form).get('score')).to.equal('4');
    expect(el.checkValidity()).to.be.true;

    form.reset();
    await el.updateComplete;
    expect(el.value).to.equal(0);
  });
});
