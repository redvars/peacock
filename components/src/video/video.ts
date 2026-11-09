import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import {
  parseVideoSource,
  type VideoProvider,
  type VideoSource,
} from './video-source.js';
import styles from './video.scss';

export type { VideoProvider } from './video-source.js';

/**
 * @label Video
 * @tag wc-video
 * @rawTag video
 *
 * @summary A video from YouTube, Vimeo or a file, that loads its player only when the person presses play.
 * @overview
 * <p>Video shows a poster with a play button. A YouTube or Vimeo player loads only on that click, so
 * the page makes no request to the video site until the person asks for the video: no cookies, no
 * tracking, and a faster page. YouTube plays through <code>youtube-nocookie.com</code> and Vimeo with
 * Do Not Track, and a line on the poster says where the video plays from.</p>
 * <p>Any other <code>src</code> is a video file, shown in the browser's own player with its
 * controls. Put <code>&lt;track&gt;</code> elements in the video for captions and subtitles.</p>
 * <p>The video keeps its <code>aspect-ratio</code> before and after it loads, so nothing on the page
 * moves.</p>
 *
 * @slot - `<track>` elements for a video file's captions and subtitles.
 *
 * @csspart base - The frame that holds the poster or the player.
 * @csspart play-button - The poster button that loads and plays the video.
 * @csspart player - The `<iframe>` or `<video>`.
 *
 * @cssprop --video-shape - Corner radius of the frame. Defaults to `--shape-corner-large`.
 *
 * @fires {CustomEvent} play - Dispatched when the person starts the video: the player loads, or the file starts playing.
 *
 * @example
 * ```html
 * <wc-video
 *   src="https://www.youtube.com/watch?v=aqz-KE-bpKQ"
 *   label="Build a portal in ten minutes"
 *   duration="9:42"
 *   poster="/img/portal-video.webp"
 * ></wc-video>
 * ```
 * @example
 * ```html
 * <wc-video src="/media/tour.mp4" poster="/media/tour.webp" label="Product tour">
 *   <track kind="captions" src="/media/tour.en.vtt" srclang="en" label="English" default />
 * </wc-video>
 * ```
 * @tags media
 */
@IndividualComponent
export class Video extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** A YouTube or Vimeo link, or the URL of a video file. */
  @property({ reflect: true })
  src = '';

  /** An image shown before the video plays. Without one, the frame shows the label on a plain surface. */
  @property({ reflect: true })
  poster = '';

  /** The video's title: shown on the poster, and the name of the play button and the player. */
  @property({ reflect: true })
  label = '';

  /** The video's length as text, such as `9:42`, shown on the poster. */
  @property({ reflect: true })
  duration = '';

  /** The frame's width to height, as a CSS `aspect-ratio`. */
  @property({ attribute: 'aspect-ratio', reflect: true })
  aspectRatio = '16 / 9';

  // ── State ────────────────────────────────────────────────────────────────

  /** Whether the person pressed play, so the YouTube or Vimeo player is loaded. */
  @state() private loaded = false;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.player') private readonly player?:
    | HTMLIFrameElement
    | HTMLVideoElement;

  // ── Private fields ───────────────────────────────────────────────────────

  private readonly i18n = new I18nController(this);

  /** Whether the next update moves focus to the player that just loaded. */
  private focusPlayer = false;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  protected override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (changed.has('src') && changed.get('src') !== undefined) {
      this.loaded = false;
    }
  }

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (this.player instanceof HTMLVideoElement) this.syncTracks();
    if (this.focusPlayer && this.player) {
      this.focusPlayer = false;
      this.player.focus();
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** Where the video plays from, read from `src`. */
  get provider(): VideoProvider {
    return this.source.provider;
  }

  /** Loads the player and starts the video, as the play button does. */
  play() {
    if (this.player instanceof HTMLVideoElement) {
      this.player.play().catch(() => {
        // The browser refused to play without a gesture; its controls are still there.
      });
      return;
    }
    if (this.loaded) return;
    this.loaded = true;
    this.focusPlayer = true;
    this.dispatchEvent(new CustomEvent('play'));
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private get source(): VideoSource {
    return parseVideoSource(this.src);
  }

  private get name() {
    return this.label || this.i18n.t('video');
  }

  /** Copies the light DOM `<track>` children into the shadow `<video>`, where tracks must be. */
  private syncTracks() {
    const video = this.player as HTMLVideoElement;
    const tracks = Array.from(this.querySelectorAll(':scope > track'));
    const current = Array.from(video.querySelectorAll('track'));
    const same =
      tracks.length === current.length &&
      tracks.every((track, i) => track.isEqualNode(current[i]));
    if (same) return;
    current.forEach(track => track.remove());
    tracks.forEach(track => video.append(track.cloneNode(true)));
  }

  private readonly handleSlotChange = () => {
    if (this.player instanceof HTMLVideoElement) this.syncTracks();
  };

  private readonly handleVideoPlay = () => {
    this.dispatchEvent(new CustomEvent('play'));
  };

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderFile(url: string) {
    return html`<video
      class="player"
      part="player"
      src=${url}
      poster=${this.poster || nothing}
      aria-label=${this.name}
      controls
      playsinline
      preload="none"
      @play=${this.handleVideoPlay}
    ></video>`;
  }

  private renderEmbed(source: VideoSource) {
    if (this.loaded) {
      return html`<iframe
        class="player"
        part="player"
        src=${source.url}
        title=${this.name}
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"
      ></iframe>`;
    }
    const from =
      source.provider === 'youtube'
        ? this.i18n.t('videoFromYouTube')
        : this.i18n.t('videoFromVimeo');
    return html`<button
      id="play"
      class="play-button"
      part="play-button"
      type="button"
      aria-label=${this.i18n.t('playVideo')(this.name)}
      @click=${() => this.play()}
    >
      ${this.poster
        ? html`<img class="poster" src=${this.poster} alt="" />`
        : nothing}
      ${this.label
        ? html`<span class="title" aria-hidden="true">${this.label}</span>`
        : nothing}
      <span class="play-icon" aria-hidden="true">
        <wc-icon name="play_arrow"></wc-icon>
      </span>
      <span class="meta" aria-hidden="true">
        <span>${from}</span>
        ${this.duration ? html`<span>${this.duration}</span>` : nothing}
      </span>
      <wc-focus-ring class="focus-ring" for="play"></wc-focus-ring>
    </button>`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const { source } = this;
    return html`<div
        class="frame"
        part="base"
        style=${styleMap({ aspectRatio: this.aspectRatio })}
      >
        ${source.provider === 'file'
          ? this.renderFile(source.url)
          : this.renderEmbed(source)}
      </div>
      <slot hidden @slotchange=${this.handleSlotChange}></slot>`;
  }
}
