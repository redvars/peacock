// Answers mention searches in the editor demos from a small in-page directory, the way an app
// would answer them from its server: `@` looks up people and `#` looks up tickets.
// Usage: <script is:inline src="/assets/js/mention-demo.js"></script>, then
// window.peacockMentionDemo(editor) for each editor.
(function () {
  const people = [
    { id: 'usr_142', label: 'Ana Lima', description: 'Billing', avatar: '' },
    { id: 'usr_7', label: 'Ravi Kumar', description: 'Support', avatar: '' },
    { id: 'usr_31', label: 'Mei Chen', description: 'Platform', avatar: '' },
    { id: 'usr_58', label: 'Jordan Lee', description: 'Security', avatar: '' },
  ];
  const tickets = [
    { id: 'inc_2041', label: 'INC-2041', description: 'Invoices fail to export' },
    { id: 'inc_2052', label: 'INC-2052', description: 'Slow ledger sync' },
    { id: 'chg_310', label: 'CHG-310', description: 'Raise retry limit' },
  ];

  function wire(editor) {
    if (!editor || editor.dataset.mentionDemo) return;
    editor.dataset.mentionDemo = 'true';
    let request = 0;
    editor.addEventListener('search', event => {
      const { trigger, query } = event.detail;
      const source = trigger === '#' ? tickets : people;
      const current = (request += 1);
      editor.suggestionsLoading = true;
      // A real app would ask its server here.
      setTimeout(() => {
        if (current !== request) return;
        editor.suggestions = source.filter(item =>
          item.label.toLowerCase().includes(query.toLowerCase()),
        );
        editor.suggestionsLoading = false;
      }, 120);
    });
  }

  window.peacockMentionDemo = wire;
})();
