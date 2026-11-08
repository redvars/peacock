// A canned answer for the wc-generative-view demos (ADR-030002): what the assistant might return,
// as JSON nodes, for "How are incidents going this week?". In Redvars the numbers come from the
// platform and the model only chooses how to lay them out.
// Usage: <script is:inline src="/assets/js/generative-demo.js"></script>, then
// window.peacockGenerativeDemo.answer, .citations and .stream(view, onDone).
(function () {
  if (window.peacockGenerativeDemo) return;

  const answer = [
    { type: 'text', props: { variant: 'title' }, children: ['Incidents this week'] },
    {
      type: 'grid',
      props: { columns: 3, gap: '150' },
      children: [
        { type: 'stat', props: { label: 'Open', value: 42, previous: 31, positive: 'down', comparison: 'vs last week' } },
        { type: 'stat', props: { label: 'Resolved', value: 58, previous: 49, comparison: 'vs last week' } },
        { type: 'stat', props: { label: 'Breached SLA', value: 3, previous: 5, positive: 'down', comparison: 'vs last week' } },
      ],
    },
    {
      type: 'chart-bar',
      props: {
        label: 'Opened and resolved per day',
        height: 200,
        categoryKey: 'day',
        data: [
          { day: 'Mon', opened: 12, resolved: 9 },
          { day: 'Tue', opened: 15, resolved: 11 },
          { day: 'Wed', opened: 9, resolved: 14 },
          { day: 'Thu', opened: 7, resolved: 13 },
          { day: 'Fri', opened: 6, resolved: 11 },
        ],
        config: { opened: { label: 'Opened' }, resolved: { label: 'Resolved' } },
      },
      action: 'show-day',
    },
    {
      type: 'markdown',
      props: {
        size: 'sm',
        value: 'Most of the new ones on Monday and Tuesday are the export failure[1](cite:prb_77), fixed on Wednesday.',
      },
    },
    {
      type: 'table',
      props: {
        label: 'Oldest open incidents',
        keyField: 'number',
        density: 'compact',
        columns: [
          { name: 'number', label: 'Number', width: 8 },
          { name: 'short', label: 'Short description', flex: 1 },
          { name: 'priority', label: 'Priority', width: 7 },
          { name: 'age', label: 'Open for', width: 7 },
        ],
        data: [
          { number: 'INC-2290', short: 'VPN drops every hour in Pune', priority: '2 · High', age: '9 days' },
          { number: 'INC-2301', short: 'Q3 export stuck at 80%', priority: '1 · Critical', age: '7 days' },
          { number: 'INC-2318', short: 'Cracked screen on LT-0412', priority: '3 · Medium', age: '6 days' },
        ],
      },
      action: 'open-incident',
    },
    {
      type: 'stack',
      props: { direction: 'horizontal', gap: '100', wrap: true },
      children: [
        { type: 'button', props: { level: 'secondary' }, action: 'open-list', payload: { list: 'incident', query: 'active=true' }, children: ['Open the list'] },
        { type: 'button', props: { level: 'tertiary' }, action: 'draft-report', children: ['Draft a weekly report'] },
      ],
    },
  ];

  const citations = [{ id: 'prb_77', headline: 'PRB-77 · Exports fail after the 4.2 upgrade', supportingText: 'Problem · IT service desk' }];

  /** Streams the answer's JSON into `view` a few characters at a time, as a model would. */
  function stream(view, onDone) {
    const text = JSON.stringify(answer);
    clearInterval(view.__demoTimer);
    view.value = '';
    view.streaming = true;
    let shown = 0;
    setTimeout(() => {
      view.__demoTimer = setInterval(() => {
        shown = Math.min(text.length, shown + 24);
        view.value = text.slice(0, shown);
        if (shown >= text.length) {
          clearInterval(view.__demoTimer);
          view.streaming = false;
          if (onDone) onDone();
        }
      }, 30);
    }, 600);
  }

  window.peacockGenerativeDemo = { answer, citations, stream };
})();
