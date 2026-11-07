/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import {
  SegmentedButton,
  SegmentedButtonGroup,
} from '../src/segmented-button/index.js';

for (const [tag, element] of [
  ['wc-segmented-button', SegmentedButton],
  ['wc-segmented-button-group', SegmentedButtonGroup],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

function segment(group: HTMLElement, value: string) {
  return group.querySelector<SegmentedButton>(
    `wc-segmented-button[value="${value}"]`,
  )!;
}

function click(button: SegmentedButton) {
  button.shadowRoot!.querySelector<HTMLElement>('.segment')!.click();
}

describe('SegmentedButton', () => {
  it('fires change when clicked', async () => {
    const el = await fixture<SegmentedButton>(
      html`<wc-segmented-button value="day">Day</wc-segmented-button>`,
    );

    setTimeout(() => click(el));
    const event = (await oneEvent(el, 'change')) as CustomEvent<{
      value: string;
      selected: boolean;
    }>;

    expect(event.detail.value).to.equal('day');
    expect(event.detail.selected).to.be.true;
  });

  it('does nothing while disabled', async () => {
    const el = await fixture<SegmentedButton>(
      html`<wc-segmented-button disabled>Day</wc-segmented-button>`,
    );
    let fired = false;
    el.addEventListener('change', () => {
      fired = true;
    });
    click(el);
    expect(fired).to.be.false;
  });
});

describe('SegmentedButtonGroup', () => {
  it('selects one segment at a time and fires a single change', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div>
        <wc-segmented-button-group>
          <wc-segmented-button value="day" selected>Day</wc-segmented-button>
          <wc-segmented-button value="week">Week</wc-segmented-button>
        </wc-segmented-button-group>
      </div>
    `);
    const group = wrapper.querySelector<SegmentedButtonGroup>(
      'wc-segmented-button-group',
    )!;

    const events: CustomEvent[] = [];
    wrapper.addEventListener('change', event =>
      events.push(event as CustomEvent),
    );
    click(segment(group, 'week'));

    expect(segment(group, 'week').selected).to.be.true;
    expect(segment(group, 'day').selected).to.be.false;
    expect(events).to.have.length(1);
    expect(events[0].target).to.equal(group);
    expect(events[0].detail).to.deep.equal({
      value: 'week',
      values: ['week'],
    });
  });

  it('keeps the selection when the selected segment is clicked again', async () => {
    const group = await fixture<SegmentedButtonGroup>(html`
      <wc-segmented-button-group>
        <wc-segmented-button value="day" selected>Day</wc-segmented-button>
        <wc-segmented-button value="week">Week</wc-segmented-button>
      </wc-segmented-button-group>
    `);
    click(segment(group, 'day'));
    expect(segment(group, 'day').selected).to.be.true;
  });

  it('allows an empty selection when nullable', async () => {
    const group = await fixture<SegmentedButtonGroup>(html`
      <wc-segmented-button-group nullable>
        <wc-segmented-button value="day" selected>Day</wc-segmented-button>
      </wc-segmented-button-group>
    `);
    click(segment(group, 'day'));
    expect(segment(group, 'day').selected).to.be.false;
  });

  it('toggles segments independently with multiple', async () => {
    const group = await fixture<SegmentedButtonGroup>(html`
      <wc-segmented-button-group multiple>
        <wc-segmented-button value="a">A</wc-segmented-button>
        <wc-segmented-button value="b">B</wc-segmented-button>
      </wc-segmented-button-group>
    `);

    click(segment(group, 'a'));
    setTimeout(() => click(segment(group, 'b')));
    const event = (await oneEvent(group, 'change')) as CustomEvent<{
      values: string[];
    }>;

    expect(event.detail.values).to.deep.equal(['a', 'b']);
  });

  function control(button: SegmentedButton) {
    return button.shadowRoot!.querySelector<HTMLElement>('.segment')!;
  }

  function press(button: SegmentedButton, key: string) {
    control(button).dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, composed: true }),
    );
  }

  async function settle(group: SegmentedButtonGroup) {
    await group.updateComplete;
    await Promise.all(
      Array.from(
        group.querySelectorAll<SegmentedButton>('wc-segmented-button'),
      ).map(s => s.updateComplete),
    );
  }

  it('toggles segments with multiple, in segment order', async () => {
    const group = await fixture<SegmentedButtonGroup>(html`
      <wc-segmented-button-group multiple>
        <wc-segmented-button value="a">A</wc-segmented-button>
        <wc-segmented-button value="b">B</wc-segmented-button>
      </wc-segmented-button-group>
    `);
    click(segment(group, 'b'));
    click(segment(group, 'a'));
    expect(group.values).to.deep.equal(['a', 'b']);
    await settle(group);
    expect(
      group
        .shadowRoot!.querySelector('.segmented-button-group')!
        .getAttribute('role'),
    ).to.equal('group');
    expect(control(segment(group, 'a')).getAttribute('aria-pressed')).to.equal(
      'true',
    );
  });

  it('reports an empty selection as an empty string', async () => {
    const group = await fixture<SegmentedButtonGroup>(html`
      <wc-segmented-button-group nullable>
        <wc-segmented-button value="day" selected>Day</wc-segmented-button>
      </wc-segmented-button-group>
    `);
    setTimeout(() => click(segment(group, 'day')));
    const event = (await oneEvent(group, 'change')) as CustomEvent;
    expect(event.detail).to.deep.equal({ value: '', values: [] });
    expect(group.value).to.equal('');
  });

  it('selects segments from value and values', async () => {
    const group = await fixture<SegmentedButtonGroup>(html`
      <wc-segmented-button-group value="week">
        <wc-segmented-button value="day">Day</wc-segmented-button>
        <wc-segmented-button value="week">Week</wc-segmented-button>
      </wc-segmented-button-group>
    `);
    await settle(group);
    expect(segment(group, 'week').selected).to.be.true;

    group.value = 'day';
    await settle(group);
    expect(segment(group, 'day').selected).to.be.true;
    expect(segment(group, 'week').selected).to.be.false;

    group.multiple = true;
    group.values = ['day', 'week'];
    await settle(group);
    expect(segment(group, 'week').selected).to.be.true;
    expect(segment(group, 'day').selected).to.be.true;
  });

  it('is a radiogroup with one tab stop and arrow-key selection', async () => {
    const group = await fixture<SegmentedButtonGroup>(html`
      <wc-segmented-button-group label="View">
        <wc-segmented-button value="day">Day</wc-segmented-button>
        <wc-segmented-button value="week" selected>Week</wc-segmented-button>
        <wc-segmented-button value="month">Month</wc-segmented-button>
      </wc-segmented-button-group>
    `);
    await settle(group);
    const root = group.shadowRoot!.querySelector('.segmented-button-group')!;
    expect(root.getAttribute('role')).to.equal('radiogroup');
    expect(root.getAttribute('aria-label')).to.equal('View');

    const week = segment(group, 'week');
    expect(control(week).getAttribute('role')).to.equal('radio');
    expect(control(week).getAttribute('aria-checked')).to.equal('true');
    expect(control(week).hasAttribute('aria-pressed')).to.be.false;
    expect(control(week).getAttribute('tabindex')).to.equal('0');
    expect(control(segment(group, 'day')).getAttribute('tabindex')).to.equal(
      '-1',
    );

    const changes: string[] = [];
    group.addEventListener('change', e =>
      changes.push((e as CustomEvent).detail.value),
    );
    press(week, 'ArrowRight');
    await settle(group);
    expect(group.value).to.equal('month');
    expect(control(segment(group, 'month')).getAttribute('tabindex')).to.equal(
      '0',
    );
    press(segment(group, 'month'), 'ArrowRight');
    press(segment(group, 'day'), 'End');
    expect(changes).to.deep.equal(['month', 'day', 'month']);
  });

  it('submits its value with a form and restores it on reset', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <wc-segmented-button-group name="view">
          <wc-segmented-button value="day" selected>Day</wc-segmented-button>
          <wc-segmented-button value="week">Week</wc-segmented-button>
        </wc-segmented-button-group>
        <wc-segmented-button-group name="days" multiple>
          <wc-segmented-button value="mo" selected>Mo</wc-segmented-button>
          <wc-segmented-button value="tu" selected>Tu</wc-segmented-button>
        </wc-segmented-button-group>
      </form>
    `);
    const [view] = Array.from(
      form.querySelectorAll<SegmentedButtonGroup>('wc-segmented-button-group'),
    );
    await settle(view);
    expect(new FormData(form).get('view')).to.equal('day');
    expect(new FormData(form).getAll('days')).to.deep.equal(['mo', 'tu']);

    click(segment(view, 'week'));
    expect(new FormData(form).get('view')).to.equal('week');
    form.reset();
    expect(view.value).to.equal('day');
  });

  it('follows segments selected from outside until value is set', async () => {
    const group = await fixture<SegmentedButtonGroup>(html`
      <wc-segmented-button-group>
        <wc-segmented-button value="day" selected>Day</wc-segmented-button>
        <wc-segmented-button value="week">Week</wc-segmented-button>
      </wc-segmented-button-group>
    `);
    click(segment(group, 'week'));
    // A host template moves the selection back by binding `selected`.
    segment(group, 'week').selected = false;
    segment(group, 'day').selected = true;
    expect(group.value).to.equal('day');

    setTimeout(() => click(segment(group, 'week')));
    const event = (await oneEvent(group, 'change')) as CustomEvent;
    expect(event.detail.value).to.equal('week');
  });

  it('disables every segment', async () => {
    const group = await fixture<SegmentedButtonGroup>(html`
      <wc-segmented-button-group disabled size="md">
        <wc-segmented-button value="a">A</wc-segmented-button>
      </wc-segmented-button-group>
    `);
    await settle(group);
    expect(segment(group, 'a').disabled).to.be.true;
    expect(group.getAttribute('size')).to.equal('md');
    group.disabled = false;
    await settle(group);
    expect(segment(group, 'a').disabled).to.be.false;
  });
});
