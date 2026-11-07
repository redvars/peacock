import { html, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import {
  type FormRestoreState,
  type FormValue,
  getFormState,
  getFormValue,
} from '@/__internal/mixins/form-associated.js';
import { observeThemeChange } from '@/__internal/utils/observe-theme-change.js';
import IndividualComponent from '@/IndividualComponent.js';

import BaseInput, { type ControlValidity } from '../input/BaseInput.js';
import styles from './signature-pad.scss';

/** `detail` of `input` and `change`: the signature as a PNG data URL, '' when empty. */
export interface SignaturePadChangeDetail {
  value: string;
}

/** How the signature is given: drawn with a pointer, or typed as a name. */
export type SignaturePadMode = 'draw' | 'type';

/**
 * One point of a stroke. `x` and `y` are in units of the pad's width, so strokes keep their shape
 * when the pad resizes; `width` is the line width in CSS pixels.
 */
interface StrokePoint {
  x: number;
  y: number;
  width: number;
}

type Stroke = StrokePoint[];

/** Line width of mouse and touch strokes, and of a pen at half pressure, in CSS pixels. */
const BASE_LINE_WIDTH = 2.5;

/** Ink of exports when `--signature-pad-export-ink-color` does not resolve. */
const FALLBACK_EXPORT_INK = 'black';

/** Size of an export when the pad has never been laid out. */
const FALLBACK_SIZE = { width: 300, height: 150 };

const midpoint = (a: StrokePoint, b: StrokePoint): StrokePoint => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
  width: (a.width + b.width) / 2,
});

/** Decodes a base64 or URL-encoded data URL into a `File`. */
export function dataUrlToFile(dataUrl: string, fileName: string): File | null {
  const match = /^data:([^;,]*)((?:;[^;,]*)*),(.*)$/s.exec(dataUrl);
  if (!match) return null;
  const type = match[1] || 'text/plain';
  const base64 = match[2].split(';').includes('base64');
  let bytes: Uint8Array<ArrayBuffer>;
  try {
    if (base64) {
      const binary = atob(match[3]);
      bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
    } else {
      bytes = new TextEncoder().encode(decodeURIComponent(match[3]));
    }
  } catch {
    return null;
  }
  return new File([bytes], fileName, { type });
}

let signaturePadCount = 0;

/**
 * @label Signature Pad
 * @tag wc-signature-pad
 * @rawTag signature-pad
 *
 * @summary An area to sign with a mouse, finger or pen, or by typing a name.
 * @overview
 * <p>Signature pad records a handwritten signature. Strokes are smoothed, and a pen draws thicker
 * the harder it presses. The undo button removes the last stroke and the clear button starts over.
 * Strokes are stored as points, so the pad can resize with its container, and draws at the
 * screen's pixel density, without blurring.</p>
 * <p>A signature cannot be drawn with a keyboard, so the pad also takes a typed name: the
 * "Type your name instead" button shows a name field, and the name is drawn on the pad in a script
 * font (<code>--signature-pad-font-family</code>). The drawing is announced as "Signature, empty"
 * or "Signature, signed".</p>
 * <p><code>value</code> is the signature as a PNG data URL with a transparent background, or
 * <code>''</code> while the pad is empty; <code>change</code> fires after each stroke. Inside a
 * <code>&lt;form&gt;</code> it is submitted under <code>name</code> as a PNG file, like a file
 * input, so the server receives an upload rather than a long base64 string.
 * <code>required</code> blocks submission until the person signs. <code>toDataURL()</code>,
 * <code>toBlob()</code> and <code>fromDataURL()</code> export and load images.</p>
 * <p>On screen the ink follows the theme (<code>--signature-pad-ink-color</code>, light in dark
 * mode). Exports always use <code>--signature-pad-export-ink-color</code>, black by default, so a
 * signature made in dark mode does not come out white on a white document.</p>
 *
 * @fires {CustomEvent<{value: string}>} input - Dispatched after each stroke, and as a typed name changes.
 * @fires {CustomEvent<{value: string}>} change - Dispatched after each stroke, undo and clear, and when a typed name is committed.
 *
 * @cssprop --signature-pad-ink-color - Ink color on screen. Defaults to the on-surface color.
 * @cssprop --signature-pad-export-ink-color - Ink color of `value` and exports. Defaults to black.
 * @cssprop --signature-pad-background - Background of the pad on screen; exports are transparent.
 * @cssprop --signature-pad-block-size - Height of the pad. Defaults to 10rem.
 * @cssprop --signature-pad-font-family - Script font of a typed name.
 *
 * @example
 * ```html
 * <wc-signature-pad label="Signature" name="signature" required></wc-signature-pad>
 * ```
 * @tags input, form
 */
@IndividualComponent
export class SignaturePad extends BaseInput {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────
  // `name` and `disabled` come from mixinFormAssociated; `readonly` and `required` from BaseInput.

  /**
   * The signature as a PNG data URL, '' while empty. Setting it loads that image onto the pad, as
   * `fromDataURL()` does; '' clears the pad.
   */
  get value(): string {
    return this.currentValue ?? '';
  }

  set value(value: string | null | undefined) {
    const next = value ?? '';
    if (next === this.currentValue) return;
    if (next) {
      this.fromDataURL(next).catch(() => {
        // An image that does not load leaves the pad as it was.
      });
    } else {
      this.reset();
      this.setValue('');
    }
  }

  /** Label shown above the pad; also its accessible name. */
  @property({ type: String })
  label = '';

  /** Help text shown below the pad. */
  @property({ type: String, attribute: 'helper-text' })
  helperText = '';

  /** Shows the pad in its error state with `error-text`. */
  @property({ type: Boolean, reflect: true })
  error = false;

  @property({ type: String, attribute: 'error-text' })
  errorText = '';

  // ── State ────────────────────────────────────────────────────────────────

  /** Whether the person is drawing or typing their name. */
  @state() private mode: SignaturePadMode = 'draw';

  /** The finished strokes, oldest first. */
  @state() private strokes: Stroke[] = [];

  /** The name typed in typing mode. */
  @state() private typedName = '';

  /** An image loaded with `fromDataURL()`, drawn under the strokes. */
  @state() private baseImage?: HTMLImageElement;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('canvas') private canvas?: HTMLCanvasElement;

  @query('.surface') private surface?: HTMLElement;

  @query('.name-input') private nameInput?: HTMLInputElement;

  @query('.mode-button') private modeButton?: HTMLElement;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Backs `value`; unset while the base classes construct. */
  private currentValue?: string;

  /** The stroke being drawn and the pointer drawing it. */
  private activeStroke?: Stroke;

  private activePointer?: number;

  /** The pad's last laid-out size in CSS pixels. */
  private size = { width: 0, height: 0 };

  private resizeObserver?: ResizeObserver;

  private stopThemeObserver?: () => void;

  /** The `File` last made from `value`, for form submission. */
  private fileCache?: { value: string; name: string; file: File | null };

  private readonly idPrefix = `wc-signature-pad-${(signaturePadCount += 1)}`;

  /** Peacock's strings for the buttons and the accessible name. */
  private readonly i18n = new I18nController(this);

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    this.stopThemeObserver = observeThemeChange(() => this.redraw());
    if (this.hasUpdated) this.observeSize();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.stopThemeObserver?.();
    this.stopThemeObserver = undefined;
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }

  protected override firstUpdated() {
    this.observeSize();
    this.measure();
  }

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    this.redraw();
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** Whether nothing is drawn or typed. */
  get empty(): boolean {
    if (this.mode === 'type') return !this.typedName.trim();
    return !this.strokes.length && !this.baseImage;
  }

  override focus() {
    if (this.mode === 'type' && this.nameInput) this.nameInput.focus();
    else this.modeButton?.focus();
  }

  override blur() {
    (this.shadowRoot?.activeElement as HTMLElement | null)?.blur();
  }

  /** Removes the last stroke. */
  undo(): void {
    if (this.mode !== 'draw' || !this.strokes.length) return;
    this.strokes = this.strokes.slice(0, -1);
    this.commit();
  }

  /** Clears the pad: strokes, typed name and loaded image. */
  clear(): void {
    if (!this.currentValue && this.empty) return;
    this.reset();
    this.commit();
  }

  /**
   * The signature as a data URL with a transparent background and the export ink, at the pad's
   * size times the device pixel ratio.
   */
  toDataURL(
    type: string = 'image/png',
    quality: number | undefined = undefined,
  ): string {
    return this.renderExport().toDataURL(type, quality);
  }

  /** The signature as a `Blob`, like `toDataURL()`. */
  toBlob(
    type: string = 'image/png',
    quality: number | undefined = undefined,
  ): Promise<Blob | null> {
    const canvas = this.renderExport();
    return new Promise(resolve => {
      canvas.toBlob(resolve, type, quality);
    });
  }

  /**
   * Loads an image onto the pad, fitted inside it, replacing what was drawn or typed. `value`
   * becomes `dataUrl` until the next stroke. Resolves once the image is drawn; rejects if it
   * does not load. Fires no event.
   */
  async fromDataURL(dataUrl: string): Promise<void> {
    const image = new Image();
    image.src = dataUrl;
    await image.decode();
    this.reset();
    this.baseImage = image;
    this.setValue(dataUrl);
  }

  // ── Protected methods ────────────────────────────────────────────────────

  protected override computeValidity(): ControlValidity {
    if (this.required && !this.value && !this.disabled) {
      return {
        flags: { valueMissing: true },
        message: this.valueMissingText(),
      };
    }
    return { flags: {}, message: '' };
  }

  protected override valueMissingText(): string {
    return this.i18n.t('valueMissingSignature');
  }

  protected override validityAnchor() {
    return this.surface ?? undefined;
  }

  override [getFormValue](): FormValue | null {
    // `currentValue` is unset while the base classes construct.
    const value = this.currentValue;
    if (!value) return null;
    const fileName = `${this.name || 'signature'}.png`;
    if (this.fileCache?.value !== value || this.fileCache.name !== fileName) {
      this.fileCache = {
        value,
        name: fileName,
        file: dataUrlToFile(value, fileName),
      };
    }
    return this.fileCache.file;
  }

  override [getFormState](): FormValue | null {
    // Restore from the data URL, which `value` takes back directly.
    return this.currentValue || null;
  }

  protected override parseRestoreState(restored: FormRestoreState): unknown {
    return typeof restored === 'string' ? restored : '';
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private get isInteractive(): boolean {
    return !this.disabled && !this.readonly;
  }

  /** Empties the pad without firing events. */
  private reset() {
    this.strokes = [];
    this.activeStroke = undefined;
    this.typedName = '';
    this.baseImage = undefined;
  }

  private setValue(value: string) {
    const old = this.currentValue;
    this.currentValue = value;
    this.requestUpdate('value', old);
  }

  /** Re-exports `value` from what is on the pad and fires `input` and `change`. */
  private commit(types: ('input' | 'change')[] = ['input', 'change']) {
    this.setValue(this.empty ? '' : this.toDataURL());
    for (const type of types) {
      this.dispatchEvent(
        new CustomEvent<SignaturePadChangeDetail>(type, {
          detail: { value: this.value },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private observeSize() {
    if (this.resizeObserver || typeof ResizeObserver === 'undefined') return;
    if (!this.surface) return;
    this.resizeObserver = new ResizeObserver(() => this.measure());
    this.resizeObserver.observe(this.surface);
  }

  /** Sizes the canvas to the pad at the device pixel ratio and redraws it. */
  private measure() {
    const { canvas, surface } = this;
    if (!canvas || !surface) return;
    const rect = surface.getBoundingClientRect();
    this.size = { width: rect.width, height: rect.height };
    const ratio = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(rect.width * ratio));
    const height = Math.max(1, Math.round(rect.height * ratio));
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    this.redraw();
  }

  /** The size to draw at in CSS pixels: the laid-out size, else a default. */
  private drawSize() {
    return this.size.width > 0 && this.size.height > 0
      ? this.size
      : FALLBACK_SIZE;
  }

  /** Redraws the visible canvas from the stored strokes, in the theme's ink. */
  private redraw() {
    const { canvas } = this;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const style = getComputedStyle(canvas);
    const ratio = canvas.width / this.drawSize().width;
    this.paint(context, ratio, style.color);
  }

  /** A canvas holding the signature in the export ink on a transparent background. */
  private renderExport(): HTMLCanvasElement {
    const { width, height } = this.drawSize();
    const ratio = window.devicePixelRatio || 1;
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    const context = canvas.getContext('2d');
    if (context) {
      const ink =
        (this.canvas &&
          getComputedStyle(this.canvas)
            .getPropertyValue('--_export-ink')
            .trim()) ||
        FALLBACK_EXPORT_INK;
      this.paint(context, ratio, ink);
    }
    return canvas;
  }

  /**
   * Paints the pad onto `context`: the loaded image, then the strokes (or the typed name), in
   * `ink`. `ratio` is device pixels per CSS pixel.
   */
  private paint(context: CanvasRenderingContext2D, ratio: number, ink: string) {
    const { width, height } = this.drawSize();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    if (this.mode === 'type') {
      this.paintName(context, width, height, ink);
      return;
    }
    if (this.baseImage) {
      const image = this.baseImage;
      const scale = Math.min(
        width / image.naturalWidth,
        height / image.naturalHeight,
      );
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      context.drawImage(
        image,
        (width - drawWidth) / 2,
        (height - drawHeight) / 2,
        drawWidth,
        drawHeight,
      );
    }
    context.strokeStyle = ink;
    context.fillStyle = ink;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    const strokes = this.activeStroke
      ? [...this.strokes, this.activeStroke]
      : this.strokes;
    for (const stroke of strokes) this.paintStroke(context, stroke, width);
  }

  /** Paints one stroke as quadratic curves through the midpoints of its points. */
  private paintStroke(
    context: CanvasRenderingContext2D,
    stroke: Stroke,
    scale: number,
  ) {
    const at = (point: StrokePoint) =>
      [point.x * scale, point.y * scale] as const;
    if (stroke.length === 1) {
      const [x, y] = at(stroke[0]);
      context.beginPath();
      context.arc(x, y, stroke[0].width / 2, 0, Math.PI * 2);
      context.fill();
      return;
    }
    // Each piece runs from the midpoint before a point to the midpoint after it, curving through
    // the point, so the line has no corners; each piece takes its own width for pen pressure.
    for (let i = 1; i < stroke.length; i += 1) {
      const from = i === 1 ? stroke[0] : midpoint(stroke[i - 1], stroke[i]);
      const last = i === stroke.length - 1;
      const to = last ? stroke[i] : midpoint(stroke[i], stroke[i + 1]);
      context.beginPath();
      context.lineWidth = stroke[i].width;
      context.moveTo(...at(from));
      if (last) context.lineTo(...at(to));
      else context.quadraticCurveTo(...at(stroke[i]), ...at(to));
      context.stroke();
    }
  }

  /** Paints the typed name centered on the pad, as large as fits. */
  private paintName(
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    ink: string,
  ) {
    const name = this.typedName.trim();
    if (!name) return;
    const family =
      (this.canvas && getComputedStyle(this.canvas).fontFamily) || 'cursive';
    let fontSize = height * 0.5;
    context.font = `${fontSize}px ${family}`;
    const measured = context.measureText(name).width;
    if (measured > width * 0.9) fontSize *= (width * 0.9) / measured;
    context.font = `${fontSize}px ${family}`;
    context.fillStyle = ink;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(name, width / 2, height / 2);
  }

  /** The point of `event` on the pad, in units of its width. */
  private pointAt(event: PointerEvent): StrokePoint {
    const rect = this.canvas?.getBoundingClientRect();
    const scale = rect && rect.width > 0 ? rect.width : 1;
    const width =
      event.pointerType === 'pen' && event.pressure > 0
        ? BASE_LINE_WIDTH * (0.4 + event.pressure * 1.2)
        : BASE_LINE_WIDTH;
    return {
      x: (event.clientX - (rect?.left ?? 0)) / scale,
      y: (event.clientY - (rect?.top ?? 0)) / scale,
      width,
    };
  }

  /** Keeps a stroke going when the pointer leaves the pad. */
  private capturePointer(pointerId: number, capture: boolean) {
    try {
      if (capture) this.canvas?.setPointerCapture(pointerId);
      else this.canvas?.releasePointerCapture(pointerId);
    } catch {
      // The pointer is already gone; the stroke ends on its `pointerup` anyway.
    }
  }

  private handlePointerDown(event: PointerEvent) {
    if (!this.isInteractive || this.mode !== 'draw') return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (this.activePointer !== undefined) return;
    event.preventDefault();
    this.capturePointer(event.pointerId, true);
    this.activePointer = event.pointerId;
    this.activeStroke = [this.pointAt(event)];
    this.redraw();
  }

  private handlePointerMove(event: PointerEvent) {
    if (event.pointerId !== this.activePointer || !this.activeStroke) return;
    const events = event.getCoalescedEvents?.() ?? [];
    for (const each of events.length ? events : [event]) {
      this.activeStroke.push(this.pointAt(each));
    }
    this.redraw();
  }

  private handlePointerUp(event: PointerEvent) {
    if (event.pointerId !== this.activePointer) return;
    this.capturePointer(event.pointerId, false);
    const stroke = this.activeStroke;
    this.activePointer = undefined;
    this.activeStroke = undefined;
    if (!stroke?.length) return;
    this.strokes = [...this.strokes, stroke];
    this.commit();
  }

  private async toggleMode() {
    if (!this.isInteractive) return;
    this.mode = this.mode === 'draw' ? 'type' : 'draw';
    // Each mode keeps its own content; the value follows the one now shown.
    const value = this.empty ? '' : this.toDataURL();
    if (value !== this.currentValue) this.commit();
    await this.updateComplete;
    if (this.mode === 'type') this.nameInput?.focus();
    else this.modeButton?.focus();
  }

  private handleNameInput(event: Event) {
    event.stopPropagation();
    this.typedName = (event.target as HTMLInputElement).value;
    this.commit(['input']);
  }

  private handleNameChange(event: Event) {
    event.stopPropagation();
    this.commit(['change']);
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderToolbar() {
    if (this.readonly) return nothing;
    const typing = this.mode === 'type';
    const modeLabel = typing
      ? this.i18n.t('signaturePadDrawInstead')
      : this.i18n.t('signaturePadTypeInstead');
    return html`<div class="toolbar">
      <wc-icon-button
        class="mode-button"
        shape="round"
        variant="text"
        size="xs"
        aria-label=${modeLabel}
        tooltip=${modeLabel}
        ?disabled=${this.disabled}
        @click=${this.toggleMode}
      >
        <wc-icon name=${typing ? 'draw' : 'keyboard'}></wc-icon>
      </wc-icon-button>
      ${typing
        ? nothing
        : html`<wc-icon-button
            class="undo-button"
            shape="round"
            variant="text"
            size="xs"
            aria-label=${this.i18n.t('signaturePadUndo')}
            tooltip=${this.i18n.t('signaturePadUndo')}
            ?disabled=${this.disabled || !this.strokes.length}
            @click=${() => this.undo()}
          >
            <wc-icon name="undo"></wc-icon>
          </wc-icon-button>`}
      <wc-icon-button
        class="clear-button"
        shape="round"
        variant="text"
        size="xs"
        aria-label=${this.i18n.t('signaturePadClear')}
        tooltip=${this.i18n.t('signaturePadClear')}
        ?disabled=${this.disabled || this.empty}
        @click=${() => this.clear()}
      >
        <wc-icon name="ink_eraser"></wc-icon>
      </wc-icon-button>
    </div>`;
  }

  private renderNameInput() {
    if (this.mode !== 'type') return nothing;
    const inputId = `${this.idPrefix}-name`;
    return html`<div class="name-field">
      <label class="name-label" for=${inputId}
        >${this.i18n.t('signaturePadTypedName')}</label
      >
      <input
        id=${inputId}
        class="name-input"
        type="text"
        autocomplete="name"
        .value=${this.typedName}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        @input=${this.handleNameInput}
        @change=${this.handleNameChange}
      />
    </div>`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const labelId = `${this.idPrefix}-label`;
    const descriptionId = `${this.idPrefix}-description`;
    const errorText = this.error ? this.errorText : this.validationText;
    const description = errorText || this.helperText;
    const name = this.label || this.i18n.t('signaturePadLabel');
    const status = this.empty
      ? this.i18n.t('signaturePadEmpty')
      : this.i18n.t('signaturePadSigned');

    return html`
      <div
        class=${classMap({
          'signature-pad': true,
          disabled: this.disabled,
          readonly: this.readonly,
          typing: this.mode === 'type',
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
        <div class="surface">
          <canvas
            role="img"
            aria-label=${this.i18n.t('signaturePadImage')(name, status)}
            aria-describedby=${description ? descriptionId : nothing}
            @pointerdown=${this.handlePointerDown}
            @pointermove=${this.handlePointerMove}
            @pointerup=${this.handlePointerUp}
            @pointercancel=${this.handlePointerUp}
          ></canvas>
          ${this.empty && this.mode === 'draw'
            ? html`<span class="hint" aria-hidden="true"
                >${this.i18n.t('signaturePadPlaceholder')}</span
              >`
            : nothing}
          <span class="baseline" aria-hidden="true"></span>
          ${this.renderToolbar()}
        </div>
        ${this.renderNameInput()}
        ${description
          ? html`<div class="helper" id=${descriptionId}>${description}</div>`
          : nothing}
      </div>
    `;
  }
}
