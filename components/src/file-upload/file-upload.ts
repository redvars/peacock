import { html, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import {
  type FormRestoreState,
  type FormValue,
  getFormValue,
} from '@/__internal/mixins/form-associated.js';
import IndividualComponent from '@/IndividualComponent.js';

import BaseInput, { type ControlValidity } from '../input/BaseInput.js';
import styles from './file-upload.scss';

/** Why a file was not added. */
export type FileRejectionReason = 'type' | 'size' | 'count';

/** A file that was not added, with the reason. */
export interface FileRejection {
  file: File;
  reason: FileRejectionReason;
}

/**
 * What the app reports about one listed file while it uploads it. `error` wins over `done`, which
 * wins over `progress`.
 */
export interface FileState {
  /** Upload progress from 0 to 100; shows a progress bar. `undefined` hides it. */
  progress?: number;
  /** An error message to show under the file, such as "Upload failed". */
  error?: string;
  /** The file is uploaded. */
  done?: boolean;
}

/** `detail` of `change`: the accepted files, as `value` (the field convention). */
export interface FileUploadChangeDetail {
  value: File[];
}

/** `detail` of `reject`. */
export interface FileUploadRejectDetail {
  files: FileRejection[];
}

/** `detail` of `remove`. */
export interface FileUploadRemoveDetail {
  file: File;
}

const SIZE_UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'];

/** Formats a size in bytes with `Intl`, in decimal units: "512 bytes", "1.5 MB". */
export function formatFileSize(bytes: number, locale: string): string {
  let size = Math.max(0, bytes);
  let unit = 0;
  while (size >= 1000 && unit < SIZE_UNITS.length - 1) {
    size /= 1000;
    unit += 1;
  }
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: SIZE_UNITS[unit],
    unitDisplay: unit === 0 ? 'long' : 'short',
    maximumFractionDigits: unit === 0 ? 0 : 1,
  }).format(size);
}

/** Whether `file` matches an `accept` list, as `<input type="file" accept>` reads it. */
export function matchesAccept(file: File, accept: string): boolean {
  const tokens = accept
    .split(',')
    .map(token => token.trim().toLowerCase())
    .filter(Boolean);
  if (!tokens.length) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return tokens.some(token => {
    if (token.startsWith('.')) return name.endsWith(token);
    if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1));
    return type === token;
  });
}

/** Whether two files are the same file chosen twice. */
function sameFile(a: File, b: File): boolean {
  return (
    a === b ||
    (a.name === b.name &&
      a.size === b.size &&
      a.lastModified === b.lastModified &&
      a.type === b.type)
  );
}

let fileUploadCount = 0;

/**
 * @label File Upload
 * @tag wc-file-upload
 * @rawTag file-upload
 *
 * @summary A drop zone and file picker that collects files into a list, for the app to upload.
 * @overview
 * <p>File upload collects files: the person drops them on the zone, or activates it (click, Enter
 * or Space) to open the system file picker. Chosen files are listed with their name and size and a
 * button that removes them. The component uploads nothing itself: the app listens for
 * <code>change</code>, uploads <code>files</code> however it likes and reports back per file with
 * <code>setFileState(file, { progress, error, done })</code>, which shows a progress bar, an error
 * or a done mark on that file.</p>
 * <p><code>accept</code>, <code>max-size</code> (bytes per file) and <code>max-files</code> (with
 * <code>multiple</code>) decide what is added. Files that do not fit are left out, listed in a short
 * message under the zone, and reported in a <code>reject</code> event. Without
 * <code>multiple</code>, a new file replaces the chosen one. A file that is already listed is not
 * added twice. Adding, removing and rejecting files is announced to screen readers.</p>
 * <p>Inside a <code>&lt;form&gt;</code> the files are submitted under <code>name</code>, like a
 * native file input; <code>required</code> blocks submission while no file is chosen, and
 * <code>form.reset()</code> clears the list. <code>readonly</code> shows the list without the drop
 * zone and the remove buttons.</p>
 *
 * @fires {CustomEvent<{value: File[], files: File[]}>} change - Dispatched when files are added or removed. `value` and `files` are the same array: the accepted files.
 * @fires {CustomEvent<{value: File[]}>} change - Dispatched when files are added or removed; `value` is the accepted files.
 * @fires {CustomEvent<{file: File}>} remove - Dispatched when the person removes a file, before `change`.
 *
 * @cssprop --file-upload-drop-zone-color - Background of the drop zone. Defaults to `surface-container-lowest`, the fill of a default field.
 * @cssprop --file-upload-file-item-color - Background of each file row. Defaults to `surface-container-lowest`.
 * @cssprop --file-upload-drop-zone-border-color - Dashed border of the drop zone.
 * @cssprop --file-upload-drop-zone-shape - Corner radius of the drop zone.
 * @cssprop --file-upload-drop-zone-min-block-size - Minimum height of the drop zone.
 *
 * @example
 * ```html
 * <wc-file-upload label="Attachment" name="attachment"></wc-file-upload>
 * ```
 * @example
 * ```html
 * <wc-file-upload
 *   label="Photos"
 *   name="photos"
 *   accept="image/*"
 *   multiple
 *   max-files="5"
 *   max-size="5000000"
 *   helper-text="Up to 5 images, 5 MB each"
 * ></wc-file-upload>
 * ```
 * @tags input, form
 */
@IndividualComponent
export class FileUpload extends BaseInput {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────
  // `name` and `disabled` come from mixinFormAssociated; `readonly` and `required` from BaseInput.

  /** The accepted files, in the order they were added. Set it to replace or clear the list. */
  @property({ attribute: false })
  files: File[] = [];

  /**
   * The same array as `files`, under the name every field uses (`detail.value` in `change`).
   * Not reactive on its own: setting it sets `files`.
   */
  get value(): File[] {
    return this.files;
  }

  set value(value: File[] | null | undefined) {
    this.files = Array.isArray(value) ? [...value] : [];
  }

  /** File types to take, as on `<input type="file" accept>`: `.pdf`, `image/png`, `image/*`. */
  @property({ type: String })
  accept = '';

  /** Takes more than one file; without it a new file replaces the chosen one. */
  @property({ type: Boolean, reflect: true })
  multiple = false;

  /** Largest size of one file, in bytes; larger files are rejected. Unset or 0 for no limit. */
  @property({ type: Number, attribute: 'max-size' })
  maxSize?: number;

  /** With `multiple`, the most files the list holds; more are rejected. Unset or 0 for no limit. */
  @property({ type: Number, attribute: 'max-files' })
  maxFiles?: number;

  /** Label shown above the drop zone; also part of its accessible name. */
  @property({ type: String })
  label = '';

  /** Help text shown below the drop zone, such as the accepted types and sizes. */
  @property({ type: String, attribute: 'helper-text' })
  helperText = '';

  /** Shows the component in its error state with `error-text`. */
  @property({ type: Boolean, reflect: true })
  error = false;

  /** Error message shown below the component while `error` is set; replaces the help text. */
  @property({ type: String, attribute: 'error-text' })
  errorText = '';

  /** Locale for file sizes and percentages; defaults to the nearest `lang`. */
  @property({ type: String })
  locale?: string;

  // ── State ────────────────────────────────────────────────────────────────

  /** True while files are dragged over the drop zone. */
  @state() private dragging = false;

  /** The files left out of the last pick or drop. */
  @state() private rejections: FileRejection[] = [];

  /** Text of the polite live region. */
  @state() private announcement = '';

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.drop-zone') private dropZone?: HTMLElement;

  @query('.native-input') private nativeInput?: HTMLInputElement;

  // ── Private fields ───────────────────────────────────────────────────────

  /** What the app reported per file through `setFileState()`. */
  private fileStates = new Map<File, FileState>();

  /** `dragenter` minus `dragleave` count, so leaving a child of the zone does not end the drag. */
  private dragDepth = 0;

  private readonly idPrefix = `wc-file-upload-${(fileUploadCount += 1)}`;

  /** Peacock's strings for the zone, the list and the announcements. */
  private readonly i18n = new I18nController(this);

  // ── Lifecycle ────────────────────────────────────────────────────────────

  protected override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (changed.has('files')) {
      if (!Array.isArray(this.files)) this.files = [];
      for (const file of this.fileStates.keys()) {
        if (!this.files.includes(file)) this.fileStates.delete(file);
      }
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  override focus() {
    this.dropZone?.focus();
  }

  override blur() {
    this.dropZone?.blur();
  }

  /**
   * Reports the upload state of a listed file; the given keys replace the ones set before, so
   * `setFileState(file, { progress: 40 })` keeps an earlier `error`. Files not in `files` are
   * ignored.
   */
  setFileState(file: File, fileState: FileState): void {
    if (!this.files.includes(file)) return;
    this.fileStates.set(file, { ...this.fileStates.get(file), ...fileState });
    this.requestUpdate();
  }

  /** The upload state reported for `file`; an empty object when none was. */
  getFileState(file: File): FileState {
    return { ...this.fileStates.get(file) };
  }

  /** Opens the system file picker. */
  showPicker(): void {
    if (!this.isInteractive) return;
    this.nativeInput?.click();
  }

  // ── Protected methods ────────────────────────────────────────────────────

  protected override computeValidity(): ControlValidity {
    if (this.required && !this.files.length && !this.disabled) {
      return {
        flags: { valueMissing: true },
        message: this.valueMissingText(),
      };
    }
    return { flags: {}, message: '' };
  }

  protected override valueMissingText(): string {
    return this.i18n.t('valueMissingFile');
  }

  protected override validityAnchor() {
    return this.dropZone ?? undefined;
  }

  override [getFormValue](): FormValue | null {
    // `files` is unset while the base classes construct.
    if (!this.name || !this.files?.length) return null;
    const data = new FormData();
    for (const file of this.files) data.append(this.name, file);
    return data;
  }

  override formResetCallback() {
    super.formResetCallback();
    this.files = [];
    this.rejections = [];
  }

  protected override parseRestoreState(restored: FormRestoreState): unknown {
    if (restored instanceof File) return [restored];
    if (Array.isArray(restored)) {
      return restored
        .map(([, entry]) => entry)
        .filter((entry): entry is File => entry instanceof File);
    }
    return [];
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private get isInteractive(): boolean {
    return !this.disabled && !this.readonly;
  }

  /** Adds files from the picker or a drop, rejecting those that do not fit. */
  private addFiles(incoming: File[]) {
    if (!incoming.length) return;
    const kept = this.multiple ? this.files : [];
    let limit = 1;
    if (this.multiple) {
      limit = this.maxFiles && this.maxFiles > 0 ? this.maxFiles : Infinity;
    }
    const accepted: File[] = [];
    const rejected: FileRejection[] = [];

    for (const file of incoming) {
      const listed = [...kept, ...accepted];
      if (!matchesAccept(file, this.accept)) {
        rejected.push({ file, reason: 'type' });
      } else if (this.maxSize && this.maxSize > 0 && file.size > this.maxSize) {
        rejected.push({ file, reason: 'size' });
      } else if (listed.some(other => sameFile(other, file))) {
        // Already listed: nothing to add, nothing to report.
      } else if (listed.length >= limit) {
        rejected.push({ file, reason: 'count' });
      } else {
        accepted.push(file);
      }
    }

    this.rejections = rejected;
    const messages: string[] = [];
    if (accepted.length) {
      this.files = [...kept, ...accepted];
      messages.push(this.i18n.t('filesAdded')(accepted.length));
    }
    messages.push(...rejected.map(rejection => this.rejectionText(rejection)));
    if (messages.length) this.announce(messages.join('. '));

    if (rejected.length) {
      this.emit<FileUploadRejectDetail>('reject', { files: rejected });
    }
    if (accepted.length) this.emitChange();
  }

  private async removeFile(file: File) {
    const index = this.files.indexOf(file);
    if (index < 0 || !this.isInteractive) return;
    const hadFocus = !!this.shadowRoot?.activeElement;
    this.files = this.files.filter(other => other !== file);
    this.rejections = [];
    this.announce(this.i18n.t('fileRemoved')(file.name));
    this.emit<FileUploadRemoveDetail>('remove', { file });
    this.emitChange();

    if (!hadFocus) return;
    // Keep focus in the component: on the next file's remove button, else the drop zone.
    await this.updateComplete;
    const buttons = Array.from(
      this.shadowRoot?.querySelectorAll<HTMLElement>('.remove-button') ?? [],
    );
    const target = buttons[Math.min(index, buttons.length - 1)];
    if (target) target.focus();
    else this.focus();
  }

  private emit<T>(type: string, detail: T) {
    this.dispatchEvent(
      new CustomEvent<T>(type, { detail, bubbles: true, composed: true }),
    );
  }

  private emitChange() {
    this.emit<FileUploadChangeDetail>('change', { value: this.files });
  }

  private announce(message: string) {
    // Clear first, so the same message twice in a row is read again.
    this.announcement = '';
    setTimeout(() => {
      this.announcement = message;
    });
  }

  private rejectionText({ file, reason }: FileRejection): string {
    if (reason === 'type') return this.i18n.t('fileTypeRejected')(file.name);
    if (reason === 'size') {
      return this.i18n.t('fileSizeRejected')(
        file.name,
        formatFileSize(this.maxSize ?? 0, this.i18n.locale),
      );
    }
    return this.i18n.t('fileCountRejected')(
      file.name,
      this.multiple ? (this.maxFiles ?? 1) : 1,
    );
  }

  private handleZoneClick() {
    this.showPicker();
  }

  private handleZoneKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.showPicker();
    } else if (event.key === ' ') {
      // A button acts on Space when it is released; stop the page scrolling now.
      event.preventDefault();
    }
  }

  private handleZoneKeyUp(event: KeyboardEvent) {
    if (event.key === ' ') {
      event.preventDefault();
      this.showPicker();
    }
  }

  /** The native `input` escapes the shadow root too; the component reports `change` only. */
  // eslint-disable-next-line class-methods-use-this
  private stopNativeEvent(event: Event) {
    event.stopPropagation();
  }

  private handleNativeChange(event: Event) {
    // Replace the native event, which escapes the shadow root, with the component's own.
    event.stopPropagation();
    const input = event.target as HTMLInputElement;
    const picked = Array.from(input.files ?? []);
    // Clear the input so picking the same file again fires `change` again.
    input.value = '';
    this.addFiles(picked);
  }

  private handleDragEnter(event: DragEvent) {
    event.preventDefault();
    if (!this.isInteractive) return;
    this.dragDepth += 1;
    this.dragging = true;
  }

  private handleDragOver(event: DragEvent) {
    // Without this the browser opens a dropped file instead of handing it over.
    event.preventDefault();
    const { dataTransfer } = event;
    if (dataTransfer) {
      dataTransfer.dropEffect = this.isInteractive ? 'copy' : 'none';
    }
  }

  private handleDragLeave() {
    this.dragDepth = Math.max(0, this.dragDepth - 1);
    if (this.dragDepth === 0) this.dragging = false;
  }

  private handleDrop(event: DragEvent) {
    event.preventDefault();
    this.dragDepth = 0;
    this.dragging = false;
    if (!this.isInteractive) return;
    this.addFiles(Array.from(event.dataTransfer?.files ?? []));
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderDropZone(labelId: string, descriptionId: string | undefined) {
    if (this.readonly) return nothing;
    const promptId = `${this.idPrefix}-prompt`;
    return html`
      <div
        class=${classMap({ 'drop-zone': true, dragging: this.dragging })}
        role="button"
        tabindex=${this.disabled ? '-1' : '0'}
        aria-labelledby=${this.label ? `${labelId} ${promptId}` : promptId}
        aria-describedby=${descriptionId ?? nothing}
        aria-disabled=${this.disabled ? 'true' : nothing}
        @click=${this.handleZoneClick}
        @keydown=${this.handleZoneKeyDown}
        @keyup=${this.handleZoneKeyUp}
        @dragenter=${this.handleDragEnter}
        @dragover=${this.handleDragOver}
        @dragleave=${this.handleDragLeave}
        @drop=${this.handleDrop}
      >
        <wc-icon class="drop-icon" name="upload" aria-hidden="true"></wc-icon>
        <span class="prompt" id=${promptId}>
          ${this.multiple
            ? this.i18n.t('dropFilesHere')
            : this.i18n.t('dropFileHere')}
          <span class="browse"
            >${this.multiple
              ? this.i18n.t('chooseFiles')
              : this.i18n.t('chooseFile')}</span
          >
        </span>
      </div>
      <input
        class="native-input"
        type="file"
        hidden
        tabindex="-1"
        aria-hidden="true"
        accept=${this.accept || nothing}
        ?multiple=${this.multiple}
        ?disabled=${this.disabled}
        @input=${this.stopNativeEvent}
        @change=${this.handleNativeChange}
      />
    `;
  }

  private renderFileStatus(file: File, fileState: FileState) {
    if (fileState.error) {
      return html`<div class="file-error">${fileState.error}</div>`;
    }
    if (fileState.done) {
      return html`<div class="file-status">
        ${this.i18n.t('fileUploaded')}
      </div>`;
    }
    if (typeof fileState.progress === 'number') {
      const progress = Math.min(100, Math.max(0, fileState.progress));
      const percent = new Intl.NumberFormat(this.i18n.locale, {
        style: 'percent',
        maximumFractionDigits: 0,
      }).format(progress / 100);
      return html`<div class="file-progress">
        <wc-linear-progress
          class="progress-bar"
          value=${progress}
          aria-label=${this.i18n.t('uploadingFile')(file.name)}
        ></wc-linear-progress>
        <span class="percent" aria-hidden="true">${percent}</span>
      </div>`;
    }
    return nothing;
  }

  private renderFile(file: File) {
    const fileState = this.fileStates.get(file) ?? {};
    let icon = 'draft';
    if (fileState.error) icon = 'error';
    else if (fileState.done) icon = 'check_circle';
    return html`
      <li
        class=${classMap({
          'file-item': true,
          error: !!fileState.error,
          done: !fileState.error && !!fileState.done,
        })}
      >
        <wc-icon class="file-icon" name=${icon} aria-hidden="true"></wc-icon>
        <div class="file-body">
          <div class="file-header">
            <span class="file-name">${file.name}</span>
            <span class="file-size"
              >${formatFileSize(file.size, this.i18n.locale)}</span
            >
          </div>
          ${this.renderFileStatus(file, fileState)}
        </div>
        ${this.readonly
          ? nothing
          : html`<wc-icon-button
              class="remove-button"
              shape="round"
              variant="text"
              size="xs"
              aria-label=${this.i18n.t('removeFile')(file.name)}
              ?disabled=${this.disabled}
              @click=${() => this.removeFile(file)}
            >
              <wc-icon name="close"></wc-icon>
            </wc-icon-button>`}
      </li>
    `;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const labelId = `${this.idPrefix}-label`;
    const descriptionId = `${this.idPrefix}-description`;
    const errorText = this.error ? this.errorText : this.validationText;
    const description = errorText || this.helperText;

    return html`
      <div
        class=${classMap({
          'file-upload': true,
          disabled: this.disabled,
          readonly: this.readonly,
          'has-error': this.error || !!errorText,
        })}
      >
        ${this.label
          ? html`<div class="label" id=${labelId}>
              ${this.label}${this.required
                ? html`<span class="required" aria-hidden="true">*</span>`
                : nothing}
            </div>`
          : nothing}
        ${this.renderDropZone(labelId, description ? descriptionId : undefined)}
        ${description
          ? html`<div class="helper" id=${descriptionId}>${description}</div>`
          : nothing}
        ${this.rejections.length
          ? html`<ul class="rejections">
              ${this.rejections.map(
                rejection => html`<li>${this.rejectionText(rejection)}</li>`,
              )}
            </ul>`
          : nothing}
        ${this.files.length
          ? html`<ul
              class="file-list"
              aria-label=${this.label || this.i18n.t('chosenFiles')}
            >
              ${this.files.map(file => this.renderFile(file))}
            </ul>`
          : nothing}
        <div class="screen-reader-only" role="status" aria-live="polite">
          ${this.announcement}
        </div>
      </div>
    `;
  }
}
