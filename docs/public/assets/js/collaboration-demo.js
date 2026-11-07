// Connects document editors on one page as if they were people on different computers: each has
// its own Y.Doc, and updates and awareness are relayed between them in memory. A real app uses a
// provider (y-websocket, Hocuspocus, WebRTC) instead. Yjs comes from the page's import map.
import * as Y from 'yjs';

/** A minimal shared awareness: what each person's caret and name are, kept in one map. */
function createAwarenessHub() {
  const states = new Map();
  const clients = [];
  return {
    states,
    join(clientID) {
      const listeners = { change: new Set(), update: new Set() };
      const client = {
        clientID,
        states,
        listeners,
        getStates: () => states,
        getLocalState: () => states.get(clientID) ?? null,
        setLocalStateField(field, value) {
          states.set(clientID, { ...(states.get(clientID) ?? {}), [field]: value });
          const change = { added: [], updated: [clientID], removed: [] };
          for (const other of clients) {
            const origin = other === client ? 'local' : 'remote';
            other.listeners.change.forEach(listener => listener(change, origin));
            other.listeners.update.forEach(listener => listener(change, origin));
          }
        },
        on: (event, listener) => listeners[event]?.add(listener),
        off: (event, listener) => listeners[event]?.delete(listener),
      };
      clients.push(client);
      return client;
    },
  };
}

/**
 * Joins `editors` into one shared document. `people` gives each editor's person, such as
 * `{ name: 'Ana Lima', color: '#1a73e8' }`. The first editor's value seeds the document.
 */
export async function connect(editors, people) {
  await Promise.all(
    editors.map(editor => customElements.whenDefined(editor.localName)),
  );
  const docs = editors.map(() => new Y.Doc());
  docs.forEach((doc, index) => {
    doc.on('update', (update, origin) => {
      if (origin === 'relay') return;
      docs.forEach((other, otherIndex) => {
        if (otherIndex !== index) Y.applyUpdate(other, update, 'relay');
      });
    });
  });
  const hub = createAwarenessHub();
  for (const [index, editor] of editors.entries()) {
    // eslint-disable-next-line no-await-in-loop
    await editor.updateComplete;
    editor.collaboration = {
      document: docs[index],
      provider: { awareness: hub.join(docs[index].clientID) },
      user: people[index],
    };
    // Let the first editor seed the shared document before the next one joins.
    // eslint-disable-next-line no-await-in-loop
    await new Promise(resolve => {
      setTimeout(resolve, 150);
    });
  }
}
