// A scripted conversation for the assistant panel demos (ADR-030002): the panel, a thread and a
// prompt answer one request ("my laptop screen cracked and I'm off on Friday") with steps, a
// streamed answer and two draft cards. A real app would send the prompt to the platform's
// assistant and render what comes back the same way.
// Usage: <script is:inline src="/assets/js/assistant-demo.js"></script>, then
// window.peacockAssistantDemo(panel, thread, prompt).
(function () {
  function wire(panel, thread, prompt) {
    if (!panel || panel.dataset.assistantDemo) return;
    panel.dataset.assistantDemo = 'true';
    let timers = [];
    const log = text => window.myConsole?.log(text);
    thread.suggestions = [
      'My laptop screen cracked and I’m off on Friday',
      'What’s waiting for me?',
      'How are incidents going this week?',
    ];

    const later = (ms, fn) => timers.push(setTimeout(fn, ms));

    function message(attrs) {
      const el = document.createElement('wc-chat-message');
      Object.assign(el, attrs);
      thread.append(el);
      return el;
    }

    function streamInto(el, text, done) {
      let shown = 0;
      el.streaming = true;
      const timer = setInterval(() => {
        shown = Math.min(text.length, shown + 4);
        el.value = text.slice(0, shown);
        if (shown >= text.length) {
          clearInterval(timer);
          el.streaming = false;
          done?.();
        }
      }, 40);
      timers.push(timer);
    }

    function mark(text, color) {
      const span = document.createElement('span');
      span.slot = 'start';
      span.textContent = text;
      span.style.cssText = `display:grid;place-items:center;inline-size:2rem;block-size:2rem;border-radius:var(--shape-corner-small);font-weight:700;font-size:0.75rem;background:var(--color-${color}-container);color:var(--color-on-${color}-container)`;
      return span;
    }

    function draft(attrs, fields, badge) {
      const card = document.createElement('wc-draft-card');
      Object.assign(card, attrs);
      card.fields = fields;
      card.append(badge);
      card.addEventListener('confirm', () => {
        card.state = 'submitting';
        later(900, () => {
          card.state = 'done';
          card.resultText = attrs.done;
          card.resultHref = '#';
        });
      });
      card.addEventListener('edit', () => log('edit: open the app’s form with form.suggest()'));
      return card;
    }

    function answerLaptop() {
      prompt.loading = true;
      const reply = message({ streaming: true, status: 'Looking up your laptop and your leave…' });
      reply.citations = [
        { id: 'lt_0412', headline: 'LT-0412 · 14-inch laptop', supportingText: 'Asset management', href: '#' },
      ];
      const steps = document.createElement('wc-assistant-steps');
      steps.slot = 'steps';
      steps.label = 'Looking up your laptop and your leave…';
      steps.innerHTML =
        '<wc-assistant-step status="running" app="Asset management">finding the laptop assigned to you</wc-assistant-step>' +
        '<wc-assistant-step status="pending" app="Human resources">reading your leave balance</wc-assistant-step>';
      reply.append(steps);
      later(900, () => {
        steps.children[0].status = 'done';
        steps.children[0].textContent = 'found LT-0412 assigned to you';
        steps.children[1].status = 'running';
      });
      later(1700, () => {
        steps.children[1].status = 'done';
        steps.children[1].textContent = 'leave balance 6 of 25 days';
        steps.label = 'Looked up your laptop in Asset management and your leave balance in Human resources.';
        streamInto(
          reply,
          'I can do both: an incident for the cracked screen on LT-0412[1](cite:lt_0412) and a day of leave on Friday. Nothing goes out until you say so.',
          () => {
            reply.append(
              draft(
                { headline: 'New incident', supportingText: 'IT service desk', confirmLabel: 'Raise incident', done: 'Raised INC-2318 in IT service desk' },
                [
                  { label: 'Short description', value: 'Cracked screen on laptop LT-0412' },
                  { label: 'Asset', value: 'LT-0412, assigned to you' },
                  { label: 'Urgency', value: '3 · Medium', suggested: true, reason: 'You didn’t say you can’t work. Make it High if you can’t.' },
                ],
                mark('IT', 'blue'),
              ),
              draft(
                { headline: 'Leave request', supportingText: 'Human resources', confirmLabel: 'Send request', done: 'Sent to Ada Lovelace for approval' },
                [
                  { label: 'Dates', value: 'Friday 30 October, full day' },
                  { label: 'Approver', value: 'Ada Lovelace, your manager' },
                  { label: 'Left afterwards', value: '5 of 25 days' },
                ],
                mark('HR', 'red'),
              ),
            );
            prompt.loading = false;
          },
        );
      });
    }

    function answerWaiting() {
      prompt.loading = true;
      const reply = message({ streaming: true, status: 'Checking your apps…' });
      later(1200, () =>
        streamInto(
          reply,
          'Two things need you today:\n\n- **Ada Lovelace** asked for your timesheet.\n- **INC-2318** is waiting for your reply.',
          () => {
            prompt.loading = false;
          },
        ),
      );
    }

    /** Runs `fn` with the canned generated answer, loading generative-demo.js first if needed. */
    function withGenerative(fn) {
      if (window.peacockGenerativeDemo) return fn(window.peacockGenerativeDemo);
      const script = document.createElement('script');
      script.src = '/assets/js/generative-demo.js';
      script.onload = () => fn(window.peacockGenerativeDemo);
      document.head.append(script);
      return undefined;
    }

    function answerIncidents() {
      prompt.loading = true;
      const reply = message({ streaming: true, status: 'Counting incidents in IT service desk…' });
      later(1000, () =>
        streamInto(reply, 'Here is the week in IT service desk. Press a bar or a row to open it.', () =>
          withGenerative(demo => {
            const view = document.createElement('wc-generative-view');
            view.hideBadge = true;
            view.citations = demo.citations;
            view.addEventListener('action', event => log(`action: ${JSON.stringify(event.detail)}`));
            reply.append(view);
            demo.stream(view, () => {
              prompt.loading = false;
            });
          }),
        ),
      );
    }

    function ask(text) {
      message({ from: 'user', value: text });
      if (/incidents|week/i.test(text)) answerIncidents();
      else if (/waiting|today/i.test(text)) answerWaiting();
      else answerLaptop();
    }

    prompt.addEventListener('submit', event => ask(event.detail.value));
    prompt.addEventListener('stop', () => {
      timers.forEach(clearTimeout);
      timers.forEach(clearInterval);
      timers = [];
      prompt.loading = false;
      thread.querySelectorAll('wc-chat-message[streaming]').forEach(el => {
        el.streaming = false;
        if (!el.value) el.error = true;
      });
    });
    thread.addEventListener('suggestion-select', event => ask(event.detail.value));
    thread.addEventListener('regenerate', () => log('regenerate'));
    thread.addEventListener('feedback', event => log(`feedback: ${event.detail.value || 'none'}`));
    panel.addEventListener('new-conversation', () => {
      timers.forEach(clearTimeout);
      timers = [];
      thread.querySelectorAll('wc-chat-message').forEach(el => el.remove());
      prompt.loading = false;
    });
    panel.addEventListener('close', event => log(`close: ${event.detail.reason}`));
  }

  window.peacockAssistantDemo = wire;
})();
