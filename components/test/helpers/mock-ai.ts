import type {
  AiCompleteRequest,
  AiParseRequest,
  AiSummarizeRequest,
  AiTransformRequest,
  PeacockAiProvider,
} from '../../src/__internal/ai/types.js';

/** What a mock provider method does when called. */
export interface MockScript {
  /** Text pieces a stream yields, or the single answer of `complete`. */
  chunks?: string[];
  /** Milliseconds before each piece. */
  delay?: number;
  /** Fail with this error after the pieces. */
  error?: Error;
  /** The value `parse` resolves with. */
  value?: unknown;
}

/** A provider for tests: scripted answers, a log of requests, and which of them were aborted. */
export interface MockAiProvider extends PeacockAiProvider {
  requests: Array<{
    method: keyof PeacockAiProvider;
    request:
      | AiCompleteRequest
      | AiTransformRequest
      | AiSummarizeRequest
      | AiParseRequest;
  }>;
  /** How many requests saw their signal abort. */
  aborted: number;
}

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });

/**
 * A scripted provider. Pass a script per method; methods without one are left out, so components
 * see the capability as missing.
 */
export function mockAi(
  scripts: Partial<Record<keyof PeacockAiProvider, MockScript>>,
): MockAiProvider {
  const provider: MockAiProvider = { requests: [], aborted: 0 };

  const track = (signal: AbortSignal) =>
    signal.addEventListener(
      'abort',
      () => {
        provider.aborted += 1;
      },
      { once: true },
    );

  async function* stream(
    script: MockScript,
    signal: AbortSignal,
  ): AsyncIterable<string> {
    for (const chunk of script.chunks ?? []) {
      // eslint-disable-next-line no-await-in-loop
      await wait(script.delay ?? 0, signal);
      yield chunk;
    }
    if (script.error) throw script.error;
  }

  if (scripts.complete) {
    const script = scripts.complete;
    provider.complete = async request => {
      provider.requests.push({ method: 'complete', request });
      track(request.signal);
      await wait(script.delay ?? 0, request.signal);
      if (script.error) throw script.error;
      return (script.chunks ?? []).join('') || null;
    };
  }
  if (scripts.transform) {
    const script = scripts.transform;
    provider.transform = request => {
      provider.requests.push({ method: 'transform', request });
      track(request.signal);
      return stream(script, request.signal);
    };
  }
  if (scripts.summarize) {
    const script = scripts.summarize;
    provider.summarize = request => {
      provider.requests.push({ method: 'summarize', request });
      track(request.signal);
      return stream(script, request.signal);
    };
  }
  if (scripts.parse) {
    const script = scripts.parse;
    provider.parse = async request => {
      provider.requests.push({ method: 'parse', request });
      track(request.signal);
      await wait(script.delay ?? 0, request.signal);
      if (script.error) throw script.error;
      return script.value;
    };
  }
  return provider;
}
