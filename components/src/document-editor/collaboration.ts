import type { Extensions } from '@tiptap/core';
import type { PluginKey } from '@tiptap/pm/state';

/**
 * Realtime collaboration for `wc-document-editor`, on Yjs. The app owns the shared document and
 * its transport (y-websocket, Hocuspocus, WebRTC, its own server); the editor only binds to them.
 * Yjs is an optional peer dependency, loaded only when collaboration is turned on, so the app's
 * provider and the editor share one copy.
 *
 * The shared document holds the XML fragments `body`, `header` and `footer`, and the map `page`
 * with the page setup under `setup`.
 */

/** The parts of an awareness instance (y-protocols) the editor uses. */
export interface AwarenessLike {
  clientID: number;
  getStates(): Map<number, Record<string, unknown>>;
  getLocalState(): Record<string, unknown> | null;
  setLocalStateField(field: string, value: unknown): void;
  on(event: 'change' | 'update', listener: (...args: unknown[]) => void): void;
  off(event: 'change' | 'update', listener: (...args: unknown[]) => void): void;
}

/** The parts of a `Y.Map` the editor uses for the page setup. */
export interface SharedMapLike {
  get(key: string): unknown;
  set(key: string, value: unknown): unknown;
  observe(listener: (event: { transaction: { local: boolean } }) => void): void;
  unobserve(
    listener: (event: { transaction: { local: boolean } }) => void,
  ): void;
}

/** The parts of a `Y.Doc` the editor uses. */
export interface SharedDocumentLike {
  getXmlFragment(name: string): { length: number };
  getMap(name: string): SharedMapLike;
}

/** The person editing, shown to the others on their caret and in the list of people. */
export interface DocumentCollaborator {
  name: string;
  /** A CSS color for the caret and the avatar; one is picked from the name when left out. */
  color?: string;
  /** Image URL of the person's avatar. */
  avatar?: string;
}

/** `collaboration` of `wc-document-editor`. */
export interface DocumentCollaboration {
  /** The shared `Y.Doc`. */
  document: SharedDocumentLike;
  /** The connection; its `awareness` carries carets and who is editing. Optional for local docs. */
  provider?: { awareness?: AwarenessLike } | null;
  /** The person editing here. */
  user: DocumentCollaborator;
}

/** Someone in the document, from awareness. */
export interface DocumentPresence {
  clientId: number;
  name: string;
  color: string;
  avatar?: string;
  /** Whether this is the person editing here. */
  self: boolean;
}

const COLORS = [
  '#1a73e8',
  '#d93025',
  '#188038',
  '#e37400',
  '#9334e6',
  '#00838f',
  '#c2185b',
  '#5f6368',
];

/** A stable color for a name. */
export function colorFor(name: string): string {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 2147483647;
  return COLORS[hash % COLORS.length];
}

/** The people in a document, from an awareness instance. */
export function presenceOf(
  awareness: AwarenessLike | undefined | null,
): DocumentPresence[] {
  if (!awareness) return [];
  const people: DocumentPresence[] = [];
  awareness.getStates().forEach((state, clientId) => {
    const user = state.user as Partial<DocumentCollaborator> | undefined;
    if (!user) return;
    people.push({
      clientId,
      name: user.name || '',
      color: user.color || colorFor(user.name || String(clientId)),
      avatar: user.avatar,
      self: clientId === awareness.clientID,
    });
  });
  return people.sort((a, b) => Number(b.self) - Number(a.self));
}

/** The loaded collaboration extensions. */
export interface CollaborationKit {
  /** The extensions that bind one editor to a fragment of the shared document. */
  extensions(
    field: 'body' | 'header' | 'footer',
    collaboration: DocumentCollaboration,
    carets: boolean,
  ): Extensions;
  /** The key whose transaction meta marks changes that came from other people. */
  syncKey: PluginKey;
}

let loading: Promise<CollaborationKit> | undefined;

/** Loads the collaboration extensions (and with them Yjs) the first time they are needed. */
export function loadCollaboration(): Promise<CollaborationKit> {
  loading ??= Promise.all([
    import('@tiptap/extension-collaboration'),
    import('@tiptap/extension-collaboration-caret'),
    import('@tiptap/y-tiptap'),
  ]).then(
    ([{ Collaboration }, { CollaborationCaret }, { ySyncPluginKey }]) => ({
      syncKey: ySyncPluginKey,
      extensions(field, collaboration, carets) {
        const user = collaboration.user ?? { name: '' };
        const color = user.color || colorFor(user.name || 'user');
        const list: Extensions = [
          Collaboration.configure({
            document: collaboration.document as never,
            field,
          }),
        ];
        const awareness = collaboration.provider?.awareness;
        if (carets && awareness) {
          list.push(
            CollaborationCaret.configure({
              provider: collaboration.provider,
              user: { name: user.name, color, avatar: user.avatar },
            }),
          );
        }
        return list;
      },
    }),
  );
  return loading;
}
