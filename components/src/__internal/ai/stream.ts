/** Waits for the next frame, or a macrotask where frames don't run (hidden pages, tests). */
function nextFrame(): Promise<void> {
  return new Promise(resolve => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(finish);
    }
    // A hidden page runs no frames; don't let a stream stall behind one.
    setTimeout(finish, 50);
  });
}

/**
 * Reads a text stream into one growing string. `onText` gets the whole text so far at most once a
 * frame, so a fast stream causes one render per frame rather than one per chunk, and once more with
 * `done` at the end. Stops early when `signal` aborts. Resolves with the whole text.
 *
 * @example
 * await readStream(provider.summarize(request), (text, done) => {
 *   summary.value = text;
 *   summary.streaming = !done;
 * }, signal);
 */
export async function readStream(
  source: AsyncIterable<string>,
  onText: (text: string, done: boolean) => void,
  signal?: AbortSignal,
): Promise<string> {
  let text = '';
  let pending = false;
  let flushing: Promise<void> | undefined;

  const flush = () => {
    if (pending || signal?.aborted) return;
    pending = true;
    flushing = nextFrame().then(() => {
      pending = false;
      if (!signal?.aborted) onText(text, false);
    });
  };

  for await (const chunk of source) {
    if (signal?.aborted) break;
    text += chunk;
    flush();
  }
  await flushing;
  if (!signal?.aborted) onText(text, true);
  return text;
}
