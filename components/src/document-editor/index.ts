import { DocumentEditor } from './document-editor.js';

export { DocumentEditor };
export type {
  DocumentComment,
  DocumentCommentAddDetail,
  DocumentImageUploadDetail,
  DocumentValueDetail,
  DocumentZoom,
  DocumentZoomDetail,
} from './document-editor.js';
export type {
  AwarenessLike,
  DocumentCollaboration,
  DocumentCollaborator,
  DocumentPresence,
} from './collaboration.js';
export type {
  DocumentValue,
  PageMargins,
  PageOrientation,
  PageSetup,
  PageSize,
} from './document-model.js';
export { emptyDocument, normalizeDocument } from './document-model.js';
