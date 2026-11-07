/// <reference types="mocha" />
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { fixture, expect } from '@open-wc/testing';
import {
  isAiAvailable,
  onPeacockAiChange,
  peacockAi,
  setPeacockAi,
} from '../src/__internal/ai/config.js';
import {
  AiController,
  isAbortError,
} from '../src/__internal/ai/ai-controller.js';
import { readStream } from '../src/__internal/ai/stream.js';
import { mockAi } from './helpers/mock-ai.js';

class AiHost extends LitElement {
  @property({ type: Boolean, attribute: 'no-ai' }) noAi = false;

  @property({ type: Boolean }) sensitive = false;

  @property({ type: String }) label = '';

  readonly ai = new AiController(this, 'summarize');

  render() {
    return html`${this.ai.available ? 'on' : 'off'}`;
  }
}
if (!customElements.get('test-ai-host')) {
  customElements.define('test-ai-host', AiHost);
}

async function* chunks(parts: string[], gap = 0) {
  for (const part of parts) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise(resolve => {
      setTimeout(resolve, gap);
    });
    yield part;
  }
}

describe('AI config', () => {
  afterEach(() => setPeacockAi({}));

  it('is on with no provider by default', () => {
    expect(peacockAi().enabled).to.equal(true);
    expect(peacockAi().provider).to.equal(undefined);
    expect(isAiAvailable()).to.equal(true);
    expect(isAiAvailable('summarize')).to.equal(false);
  });

  it('offers a capability only when the provider has it and it is not turned off', () => {
    setPeacockAi({ provider: mockAi({ summarize: { chunks: ['x'] } }) });
    expect(isAiAvailable('summarize')).to.equal(true);
    expect(isAiAvailable('complete')).to.equal(false);

    setPeacockAi({
      provider: mockAi({ summarize: { chunks: ['x'] } }),
      features: { summarize: false },
    });
    expect(isAiAvailable('summarize')).to.equal(false);
    expect(isAiAvailable()).to.equal(true);
  });

  it('offers nothing when AI is off', () => {
    setPeacockAi({
      enabled: false,
      provider: mockAi({ summarize: { chunks: ['x'] } }),
    });
    expect(isAiAvailable()).to.equal(false);
    expect(isAiAvailable('summarize')).to.equal(false);
  });

  it('notifies listeners and resets left-out fields to their defaults', () => {
    let calls = 0;
    const stop = onPeacockAiChange(() => {
      calls += 1;
    });
    setPeacockAi({ enabled: false });
    setPeacockAi({});
    stop();
    setPeacockAi({ enabled: false });
    expect(calls).to.equal(2);
    expect(peacockAi().enabled).to.equal(false);
  });
});

describe('AiController', () => {
  afterEach(() => setPeacockAi({}));

  it('re-renders the host when the settings change', async () => {
    const el = await fixture<AiHost>(html`<test-ai-host></test-ai-host>`);
    expect(el.shadowRoot!.textContent).to.equal('off');
    setPeacockAi({ provider: mockAi({ summarize: { chunks: ['x'] } }) });
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.equal('on');
  });

  it('is unavailable on hosts with no-ai or sensitive', async () => {
    setPeacockAi({ provider: mockAi({ summarize: { chunks: ['x'] } }) });
    const optedOut = await fixture<AiHost>(
      html`<test-ai-host no-ai></test-ai-host>`,
    );
    const sensitive = await fixture<AiHost>(
      html`<test-ai-host sensitive></test-ai-host>`,
    );
    expect(optedOut.ai.available).to.equal(false);
    expect(optedOut.ai.provider).to.equal(undefined);
    expect(sensitive.ai.available).to.equal(false);
  });

  it('builds a request context from the host', async () => {
    const el = await fixture<AiHost>(
      html`<div lang="pt-BR">
        <test-ai-host label="Notes"></test-ai-host>
      </div>`,
    );
    const host = el.querySelector('test-ai-host') as AiHost;
    expect(host.ai.context({ name: 'notes' })).to.deep.equal({
      component: 'test-ai-host',
      label: 'Notes',
      locale: 'pt-BR',
      name: 'notes',
    });
  });

  it('aborts the previous request when a new one starts', async () => {
    const el = await fixture<AiHost>(html`<test-ai-host></test-ai-host>`);
    let firstSignal: AbortSignal | undefined;
    const first = el.ai.run(
      signal =>
        new Promise<string>((resolve, reject) => {
          firstSignal = signal;
          signal.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          );
        }),
    );
    expect(el.ai.busy).to.equal(true);
    const second = el.ai.run(async () => 'second');
    expect(await first).to.equal(undefined);
    expect(firstSignal?.aborted).to.equal(true);
    expect(await second).to.equal('second');
    expect(el.ai.busy).to.equal(false);
    expect(el.ai.error).to.equal(undefined);
  });

  it('keeps a failure in error and resolves with undefined', async () => {
    const el = await fixture<AiHost>(html`<test-ai-host></test-ai-host>`);
    const failure = new Error('provider down');
    const result = await el.ai.run(async () => {
      throw failure;
    });
    expect(result).to.equal(undefined);
    expect(el.ai.error).to.equal(failure);
    await el.ai.run(async () => 'ok');
    expect(el.ai.error).to.equal(undefined);
  });

  it('aborts when the host leaves the page', async () => {
    const el = await fixture<AiHost>(html`<test-ai-host></test-ai-host>`);
    let signal: AbortSignal | undefined;
    el.ai.run(
      s =>
        new Promise(() => {
          signal = s;
        }),
    );
    el.remove();
    expect(signal?.aborted).to.equal(true);
    expect(el.ai.busy).to.equal(false);
  });

  it('recognises abort errors', () => {
    expect(isAbortError(new DOMException('x', 'AbortError'))).to.equal(true);
    expect(isAbortError(new Error('x'))).to.equal(false);
  });
});

describe('readStream', () => {
  it('reports the growing text and finishes with done', async () => {
    const seen: Array<[string, boolean]> = [];
    const text = await readStream(chunks(['Hel', 'lo', ' world']), (t, d) =>
      seen.push([t, d]),
    );
    expect(text).to.equal('Hello world');
    expect(seen[seen.length - 1]).to.deep.equal(['Hello world', true]);
    expect(seen.filter(([, done]) => done).length).to.equal(1);
    // Fast chunks are batched: fewer calls than chunks plus the final one.
    expect(seen.length).to.be.at.most(4);
  });

  it('stops when the signal aborts', async () => {
    const controller = new AbortController();
    const seen: string[] = [];
    const text = await readStream(
      chunks(['a', 'b', 'c', 'd'], 20),
      t => {
        seen.push(t);
        if (t.includes('b')) controller.abort();
      },
      controller.signal,
    );
    expect(text.length).to.be.lessThan(4);
    expect(seen.every(t => !t.includes('d'))).to.equal(true);
  });
});
