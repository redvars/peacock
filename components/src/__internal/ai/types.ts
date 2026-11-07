/**
 * The contract between Peacock and the app's model access (ADR-030002). Peacock never calls a
 * model: components show AI state the app passes in, and their few interactive features call the
 * one provider the app registers with `setPeacockAi()`. In Redvars the provider calls the
 * platform's model service, so every request goes through the person's session and access.
 */

/** What a component tells the provider about where a request comes from. */
export interface AiRequestContext {
  /** Tag of the component asking, such as `wc-textarea`. */
  component: string;
  /** The field's `name`, when it has one. */
  name?: string;
  /** The field's visible label, when it has one. */
  label?: string;
  /** The page's or element's language, such as `en` or `pt-BR`. */
  locale?: string;
}

/** Fields every provider request carries. */
export interface AiRequestBase {
  /** Aborted when the result is no longer wanted: new input, the element left the page, Stop. */
  signal: AbortSignal;
  context: AiRequestContext;
}

/** Ghost text: what might come next after the caret. */
export interface AiCompleteRequest extends AiRequestBase {
  /** Text before the caret. */
  before: string;
  /** Text after the caret. */
  after: string;
  /** Language of a code editor, such as `typescript`. */
  language?: string;
}

/** What a transform does to the text it is given. */
export type AiTransformAction =
  | 'improve'
  | 'shorten'
  | 'fix'
  | 'translate'
  | 'continue'
  | 'summarize'
  | 'custom';

/** Rewrites or extends text; the result streams in. */
export interface AiTransformRequest extends AiRequestBase {
  action: AiTransformAction;
  /** The selected text, or for `continue` the text before the caret. */
  text: string;
  /** The person's own instruction, for `custom`. */
  instruction?: string;
  /** Target language for `translate`, such as `fr`. */
  targetLocale?: string;
}

/** Summarizes content the component holds, such as a thread or a document. */
export interface AiSummarizeRequest extends AiRequestBase {
  /** What is being summarized, for example `thread` or `document`. */
  kind: string;
  /** The content as Markdown. */
  text: string;
}

/** Turns a sentence into a structured value, such as filters or conditions. */
export interface AiParseRequest extends AiRequestBase {
  /** What the result must be, for example `filter-bar` or `condition-builder`. */
  target: string;
  /** The sentence the person typed. */
  text: string;
  /** The fields that may be used, with their types and options. Never record values. */
  schema: unknown;
}

/**
 * The app's model access. Every method is optional: a component offers a feature only when the
 * provider has the method for it. Methods must honour `signal` and stop work when it aborts.
 */
export interface PeacockAiProvider {
  /** Ghost text after the caret, or `null` for none. */
  complete?(request: AiCompleteRequest): Promise<string | null>;
  /** A rewrite or continuation, streamed in pieces. */
  transform?(request: AiTransformRequest): AsyncIterable<string>;
  /** A summary, streamed in pieces, as Markdown. */
  summarize?(request: AiSummarizeRequest): AsyncIterable<string>;
  /** A structured value for `target`. */
  parse?(request: AiParseRequest): Promise<unknown>;
}

/** One interactive AI feature, named after its provider method. */
export type AiCapability = keyof PeacockAiProvider;

/** A value the assistant proposes for a field, with why. */
export interface AiSuggestion<T = unknown> {
  value: T;
  /** Why this value, in a sentence. Shown beside the value. */
  reason?: string;
}

/** A record or page an answer is based on, linked from Markdown as `[1](cite:id)`. */
export interface AiCitation {
  /** The id used after `cite:` in the Markdown. */
  id: string;
  /** Title of the source, shown in its preview. */
  headline?: string;
  /** Kind and place of the source, such as "Access rule · Human resources". */
  supportingText?: string;
  /** Where the source opens. */
  href?: string;
}

/** Page-wide AI settings, set with `setPeacockAi()`. */
export interface PeacockAiConfig {
  /**
   * Whether AI is on for the page. Off, every component behaves as if there were no AI: markers,
   * Ask buttons and AI menus disappear, and interactive features are not offered. Default `true`.
   */
  enabled: boolean;
  /** The app's model access. Without one, only AI state the app passes in is shown. */
  provider?: PeacockAiProvider;
  /** Turns single capabilities off, for example `{ complete: false }`. */
  features?: Partial<Record<AiCapability, boolean>>;
}
