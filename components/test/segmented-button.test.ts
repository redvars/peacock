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
  it('fires change, and the deprecated segmented-button--change, when clicked', async () => {
    const el = await fixture<SegmentedButton>(
      html`<wc-segmented-button value="day">Day</wc-segmented-button>`,
    );

    let legacy: CustomEvent | undefined;
    el.addEventListener('segmented-button--change', event => {
      legacy = event as CustomEvent;
    });
    setTimeout(() => click(el));
    const event = (await oneEvent(el, 'change')) as CustomEvent<{
      value: string;
      selected: boolean;
    }>;

    expect(event.detail.value).to.equal('day');
    expect(event.detail.selected).to.be.true;
    expect(legacy?.detail.value).to.equal('day');
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

  it('toggles segments independently with multi-select', async () => {
    const group = await fixture<SegmentedButtonGroup>(html`
      <wc-segmented-button-group multi-select>
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
});
