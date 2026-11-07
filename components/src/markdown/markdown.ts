import {
  html,
  LitElement,
  nothing,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { property } from 'lit/decorators.js';
import type { Token, Tokens } from 'marked';

import IndividualComponent from '@/IndividualComponent.js';
import {
  lexMarkdown,
  type MentionToken,
} from '@/__internal/rich-text/markdown-lexer.js';
import { safeUrl } from '@/__internal/rich-text/url.js';

import styles from './markdown.scss';

export { safeUrl };

type Content = TemplateResult | string | typeof nothing;

/**
 * @label Markdown
 * @tag wc-markdown
 * @rawTag markdown
 *
 * @summary Shows Markdown as formatted text, the read view of the Markdown editor and comments.
 * @overview
 * <p>Give the Markdown as <code>value</code>. It reads GitHub-flavoured Markdown (tables, task
 * lists, strikethrough, autolinks) and mentions written as <code>[@Ana Lima](mention:usr_142)</code>,
 * the form <code>wc-markdown-editor</code> and <code>wc-comment-composer</code> store, so a saved
 * description looks the same as it did in the editor.</p>
 *
 * <p>It is safe for text people typed: raw HTML is shown as text, and only http(s),
 * <code>mailto:</code>, <code>tel:</code> and relative links are followed; other links show their
 * text only. Links open in a new tab, apart from links to <code>#</code> anchors.</p>
 *
 * <p>Mentions show as chips. With <code>mention-href</code> they are links: <code>{id}</code> in it
 * is replaced by the mention's id, for example <code>mention-href="/users/{id}"</code>.</p>
 *
 * <p><code>inline</code> shows the Markdown as a run of text without block spacing, for a
 * one-line summary or an activity entry.</p>
 *
 * @cssprop --prose-link-color - Color of links.
 * @cssprop --prose-mention-background - Background of mention chips.
 * @cssprop --prose-mention-color - Text color of mention chips.
 * @cssprop --prose-code-background - Background of inline code and code blocks.
 *
 * @example
 * ```html
 * <wc-markdown value="**Done.** Thanks [@Ana Lima](mention:usr_142)."></wc-markdown>
 * ```
 * @tags display
 */
@IndividualComponent
export class Markdown extends LitElement {
  // ── Static ────────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ────────────────────────────────────────────────────────────

  /** The Markdown to show. */
  @property({ type: String })
  value = '';

  /** Shows the Markdown as one run of inline text, without block spacing. */
  @property({ type: Boolean, reflect: true })
  inline = false;

  /** Address mentions link to; `{id}` is replaced by the mention's id. Without it, mentions are not links. */
  @property({ type: String, attribute: 'mention-href' })
  mentionHref = '';

  /** Size of the text: `sm` or `md`, as on the editors. */
  @property({ type: String, reflect: true })
  size: 'sm' | 'md' = 'md';

  // ── Private fields ────────────────────────────────────────────────────────

  private _tokens: Token[] = [];

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('value')) this._tokens = lexMarkdown(this.value);
  }

  // ── Render helpers: inline ────────────────────────────────────────────────

  private _inline(tokens: Token[] | undefined): Content[] {
    return (tokens ?? []).map(token => this._inlineToken(token));
  }

  private _inlineToken(token: Token): Content {
    switch (token.type) {
      case 'text': {
        const text = token as Tokens.Text;
        return text.tokens ? html`${this._inline(text.tokens)}` : text.text;
      }
      case 'escape':
        return (token as Tokens.Escape).text;
      case 'strong':
        return html`<strong
          >${this._inline((token as Tokens.Strong).tokens)}</strong
        >`;
      case 'em':
        return html`<em>${this._inline((token as Tokens.Em).tokens)}</em>`;
      case 'del':
        return html`<del>${this._inline((token as Tokens.Del).tokens)}</del>`;
      case 'codespan':
        return html`<code>${(token as Tokens.Codespan).text}</code>`;
      case 'br':
        return html`<br />`;
      case 'link':
        return this._link(token as Tokens.Link);
      case 'image':
        return this._image(token as Tokens.Image);
      case 'mention':
        return this._mention(token as MentionToken);
      case 'checkbox':
        return html`<input
          type="checkbox"
          disabled
          ?checked=${(token as Tokens.Checkbox).checked}
        />`;
      default:
        // Raw HTML and anything unknown shows as the text that was typed.
        return (token as Tokens.Generic).raw ?? '';
    }
  }

  private _link(token: Tokens.Link): Content {
    const href = safeUrl(token.href);
    const content = this._inline(token.tokens);
    if (!href) return html`${content}`;
    const external = !href.startsWith('#');
    return html`<a
      href=${href}
      title=${token.title || nothing}
      target=${external ? '_blank' : nothing}
      rel=${external ? 'noopener noreferrer' : nothing}
      >${content}</a
    >`;
  }

  private _image(token: Tokens.Image): Content {
    const src = safeUrl(token.href);
    if (!src || /^(mailto|tel):/i.test(src)) return token.text;
    return html`<img
      src=${src}
      alt=${token.text}
      title=${token.title || nothing}
      loading="lazy"
      referrerpolicy="no-referrer"
    />`;
  }

  private _mention(token: MentionToken): Content {
    const text = `${token.trigger}${token.label}`;
    const href = this.mentionHref
      ? safeUrl(
          this.mentionHref.replace(/\{id\}/g, encodeURIComponent(token.id)),
        )
      : undefined;
    return href
      ? html`<a class="mention" href=${href} data-id=${token.id}>${text}</a>`
      : html`<span class="mention" data-id=${token.id}>${text}</span>`;
  }

  // ── Render helpers: blocks ────────────────────────────────────────────────

  private _blocks(tokens: Token[]): Content[] {
    return tokens.map(token => this._block(token));
  }

  private _block(token: Token): Content {
    switch (token.type) {
      case 'space':
      case 'def':
        return nothing;
      case 'paragraph':
        return html`<p>${this._inline((token as Tokens.Paragraph).tokens)}</p>`;
      case 'text': {
        // Text directly in a tight list item.
        const text = token as Tokens.Text;
        return html`${text.tokens ? this._inline(text.tokens) : text.text}`;
      }
      case 'heading':
        return this._heading(token as Tokens.Heading);
      case 'blockquote':
        return html`<blockquote>
          ${this._blocks((token as Tokens.Blockquote).tokens)}
        </blockquote>`;
      case 'list':
        return this._list(token as Tokens.List);
      case 'code':
        return this._code(token as Tokens.Code);
      case 'hr':
        return html`<hr />`;
      case 'table':
        return this._table(token as Tokens.Table);
      case 'html':
        // Raw HTML is shown as text, never parsed.
        return html`<p>${(token as Tokens.HTML).text.trimEnd()}</p>`;
      default:
        return this._inlineToken(token);
    }
  }

  private _heading(token: Tokens.Heading): Content {
    const content = this._inline(token.tokens);
    switch (token.depth) {
      case 1:
        return html`<h1>${content}</h1>`;
      case 2:
        return html`<h2>${content}</h2>`;
      case 3:
        return html`<h3>${content}</h3>`;
      case 4:
        return html`<h4>${content}</h4>`;
      case 5:
        return html`<h5>${content}</h5>`;
      default:
        return html`<h6>${content}</h6>`;
    }
  }

  private _list(token: Tokens.List): Content {
    const task = token.items.some(item => item.task);
    const items = token.items.map(
      item => html`<li>${this._listItem(item, task)}</li>`,
    );
    if (token.ordered) {
      const start = typeof token.start === 'number' ? token.start : 1;
      return html`<ol start=${start === 1 ? nothing : start}>
        ${items}
      </ol>`;
    }
    return html`<ul class=${task ? 'task-list' : nothing}>
      ${items}
    </ul>`;
  }

  private _listItem(item: Tokens.ListItem, task: boolean): Content {
    if (!task) return html`${this._blocks(item.tokens)}`;
    const rest = item.tokens.filter(token => token.type !== 'checkbox');
    return html`<label
        ><input type="checkbox" disabled ?checked=${!!item.checked}
      /></label>
      <div>${this._blocks(rest)}</div>`;
  }

  private _code(token: Tokens.Code): Content {
    const language = (token.lang ?? '').split(/\s/)[0] || 'text';
    // The light-DOM <pre> shows until wc-code-highlighter loads, and stays if it never does.
    return html`<wc-code-highlighter
      class="code-block"
      language=${language}
      format="false"
      size="sm"
      .value=${token.text}
    >
      <pre><code>${token.text}</code></pre>
    </wc-code-highlighter>`;
  }

  private _table(token: Tokens.Table): Content {
    const alignments: Record<string, string> = {
      left: 'text-align: start',
      center: 'text-align: center',
      right: 'text-align: end',
    };
    const style = (index: number) => {
      const value = token.align[index];
      return value ? alignments[value] : nothing;
    };
    return html`<table>
      <thead>
        <tr>
          ${token.header.map(
            (cell, index) =>
              html`<th style=${style(index)}>${this._inline(cell.tokens)}</th>`,
          )}
        </tr>
      </thead>
      <tbody>
        ${token.rows.map(
          row =>
            html`<tr>
              ${row.map(
                (cell, index) =>
                  html`<td style=${style(index)}>
                    ${this._inline(cell.tokens)}
                  </td>`,
              )}
            </tr>`,
        )}
      </tbody>
    </table>`;
  }

  /** The blocks as one run of inline text. */
  private _inlineRun(): Content[] {
    const parts: Content[] = [];
    const add = (tokens: Token[]) => {
      for (const token of tokens) {
        const generic = token as Tokens.Generic;
        if (token.type === 'space') {
          // Blank lines between blocks add nothing inline.
        } else if (token.type === 'list') {
          (token as Tokens.List).items.forEach(item => add(item.tokens));
        } else if (token.type === 'blockquote') {
          add((token as Tokens.Blockquote).tokens);
        } else if (token.type === 'code') {
          parts.push(html`<code>${(token as Tokens.Code).text}</code>`, ' ');
        } else if (token.type === 'checkbox' || token.type === 'hr') {
          // Nothing to say inline.
        } else if (Array.isArray(generic.tokens)) {
          parts.push(html`${this._inline(generic.tokens)}`, ' ');
        } else if (token.type === 'html') {
          parts.push((token as Tokens.HTML).text.trim(), ' ');
        } else {
          parts.push(this._inlineToken(token), ' ');
        }
      }
    };
    add(this._tokens);
    parts.pop();
    return parts;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  render() {
    return this.inline
      ? html`<span class="prose" part="content">${this._inlineRun()}</span>`
      : html`<div class="prose" part="content">
          ${this._blocks(this._tokens)}
        </div>`;
  }
}
