// Wires a wc-discussion demo to in-page data, the way an app would wire it to a server: new
// comments and replies are added, edits update the comment, deletes remove it, and mention
// searches are answered from a small directory. Used by the discussion docs and the Ticket block.
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

  let nextId = 1000;

  function find(discussion, id) {
    return discussion.querySelector(`wc-discussion-comment[comment-id="${id}"]`);
  }

  function wire(discussion, options = {}) {
    const author = options.author || 'You';

    discussion.addEventListener('search', event => {
      const { trigger, query } = event.detail;
      const source = trigger === '#' ? tickets : people;
      discussion.suggestionsLoading = true;
      // A real app would ask its server here.
      setTimeout(() => {
        discussion.suggestions = source.filter(item =>
          item.label.toLowerCase().includes(query.toLowerCase()),
        );
        discussion.suggestionsLoading = false;
      }, 120);
    });

    discussion.addEventListener('submit', event => {
      const { value, parentId } = event.detail;
      const id = `c${(nextId += 1)}`;
      const comment = document.createElement('wc-discussion-comment');
      comment.setAttribute('comment-id', id);
      comment.author = author;
      comment.datetime = new Date().toISOString();
      comment.value = value;
      comment.editable = true;
      comment.deletable = true;
      comment.href = `#${id}`;
      const badge = options.badge ? options.badge() : '';
      if (badge) {
        const tag = document.createElement('wc-tag');
        tag.slot = 'badge';
        tag.setAttribute('intent', 'warning');
        tag.textContent = badge;
        comment.append(tag);
      }
      if (parentId) {
        comment.slot = 'replies';
        find(discussion, parentId)?.append(comment);
      } else if (options.newestFirst) {
        discussion.prepend(comment);
      } else {
        const composer = discussion.querySelector('[slot="composer"]');
        discussion.insertBefore(comment, composer);
      }
      if (options.onChange) options.onChange();
    });

    discussion.addEventListener('edit', event => {
      const comment = find(discussion, event.detail.commentId);
      if (!comment) return;
      comment.value = event.detail.value;
      comment.edited = true;
    });

    discussion.addEventListener('delete', event => {
      find(discussion, event.detail.commentId)?.remove();
      if (options.onChange) options.onChange();
    });
  }

  window.peacockDiscussionDemo = wire;
})();
