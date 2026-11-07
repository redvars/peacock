// A scripted AI provider for the docs demos (ADR-030002). In Redvars the provider calls the
// platform's model service; here every answer is canned, so the demos work offline and show the
// same thing every time.
// Usage: <script type="module" src="/assets/js/ai-demo.js"></script>. It registers the provider
// with the Peacock loader already on the page.
(async function () {
  if (window.__peacockAiDemo) return;
  window.__peacockAiDemo = true;

  // Import the loader the page already runs, so the provider reaches the same components.
  const script = document.querySelector('script[src*="loader"][type="module"]');
  if (!script) return;
  const { setPeacockAi } = await import(script.src);

  const wait = (ms, signal) =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, ms);
      signal?.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    });

  /** Streams `text` a few characters at a time, as a model would. */
  async function* stream(text, signal) {
    await wait(350, signal);
    for (let i = 0; i < text.length; ) {
      const step = 3 + Math.floor(Math.random() * 5);
      yield text.slice(i, i + step);
      i += step;
      await wait(35, signal);
    }
  }

  const firstSentence = text => (text.match(/^[^.!?]+[.!?]?/) || [text])[0].trim();
  const words = text => text.trim().split(/\s+/);

  function rewrite(action, text, extra) {
    const plain = text.replace(/\s+/g, ' ').trim();
    switch (action) {
      case 'improve':
        return 'The export job failed for three days because its retry limit was set to 0. No alert fired, so customers didn’t receive their reports.';
      case 'shorten':
        return firstSentence(plain);
      case 'fix': {
        const fixed = plain.charAt(0).toUpperCase() + plain.slice(1);
        return /[.!?]$/.test(fixed) ? fixed : `${fixed}.`;
      }
      case 'translate':
        return `[${extra || 'translated'}] ${plain}`;
      case 'custom':
        return `${plain} (rewritten: ${extra})`;
      case 'continue':
        return ' The fix ships in 4.2.1, and the missed reports will be sent again tonight.';
      case 'summarize':
        return `In short: ${words(plain).slice(-14).join(' ')}…`;
      default:
        return plain;
    }
  }

  setPeacockAi({
    provider: {
      async complete({ before, language, signal }) {
        await wait(250, signal);
        if (language) {
          return 'for (let attempt = 1; attempt <= 5; attempt += 1) {\n    if (job.run()) return true;\n  }\n  return false;\n}';
        }
        if (/laptop|screen/i.test(before)) return ' The laptop was returned to its owner on Thursday.';
        if (/\.\s*$/.test(before)) return ' Let me know if anything else comes up.';
        return ' and checked that everything works again.';
      },
      transform({ action, text, instruction, targetLocale, signal }) {
        return stream(rewrite(action, text, instruction || targetLocale), signal);
      },
      // Sentences to structured values: a few keyword rules stand in for a model.
      async parse({ target, text, signal }) {
        await wait(700, signal);
        const t = text.toLowerCase();
        if (target === 'filter-bar') {
          const value = {};
          if (/urgent|critical|p1|high/.test(t)) value.urgency = '1';
          if (/hardware|laptop|screen/.test(t)) value.category = ['hardware'];
          if (/software|app/.test(t)) value.category = [...(value.category || []), 'software'];
          if (/pune/.test(t)) value.location = 'pune';
          if (/london/.test(t)) value.location = 'london';
          if (/mine|my /.test(t)) value.mine = true;
          return value;
        }
        if (target === 'condition-builder') {
          const rules = [];
          if (/p1|critical/.test(t)) rules.push({ field: 'priority', operator: 'is', value: '1 · Critical' });
          if (/no assignment group|unassigned/.test(t)) rules.push({ field: 'assignment_group', operator: 'is empty', value: '' });
          const minutes = t.match(/(\d+)\s*min/);
          if (minutes) rules.push({ field: 'opened', operator: 'more than', value: `${minutes[1]} minutes ago` });
          return rules.length ? { operator: 'and', rules } : null;
        }
        return null;
      },
    },
  });
})();
