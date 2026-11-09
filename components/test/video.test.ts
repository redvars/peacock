/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixture, oneEvent } from '@open-wc/testing';
import { parseVideoSource, Video } from '../src/video/index.js';

if (!customElements.get('wc-video')) {
  customElements.define('wc-video', Video);
}

function part<T extends Element = HTMLElement>(el: Video, selector: string) {
  return el.shadowRoot!.querySelector<T>(selector);
}

describe('parseVideoSource', () => {
  it('plays YouTube links through youtube-nocookie.com', () => {
    for (const src of [
      'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
      'https://youtu.be/aqz-KE-bpKQ',
      'https://www.youtube.com/embed/aqz-KE-bpKQ',
      'https://www.youtube.com/shorts/aqz-KE-bpKQ',
    ]) {
      const source = parseVideoSource(src);
      expect(source.provider).to.equal('youtube');
      expect(source.url).to.match(
        /^https:\/\/www\.youtube-nocookie\.com\/embed\/aqz-KE-bpKQ\?autoplay=1/,
      );
    }
  });

  it('keeps a YouTube start time', () => {
    const source = parseVideoSource('https://youtu.be/abc123?t=1m30s');
    expect(new URL(source.url).searchParams.get('start')).to.equal('90');
  });

  it('plays Vimeo links with Do Not Track', () => {
    const source = parseVideoSource('https://vimeo.com/76979871');
    expect(source.provider).to.equal('vimeo');
    expect(source.url).to.equal(
      'https://player.vimeo.com/video/76979871?autoplay=1&dnt=1',
    );
    const unlisted = parseVideoSource('https://vimeo.com/76979871/a1b2c3');
    expect(new URL(unlisted.url).searchParams.get('h')).to.equal('a1b2c3');
  });

  it('treats any other URL as a file', () => {
    expect(parseVideoSource('/media/tour.mp4')).to.deep.equal({
      provider: 'file',
      url: '/media/tour.mp4',
    });
    expect(parseVideoSource('https://youtube.com/about').provider).to.equal(
      'file',
    );
  });
});

describe('Video', () => {
  it('shows a poster button and loads no player before the click', async () => {
    const el = await fixture<Video>(
      html`<wc-video
        src="https://youtu.be/aqz-KE-bpKQ"
        label="Build a portal"
        duration="9:42"
      ></wc-video>`,
    );
    const button = part<HTMLButtonElement>(el, '.play-button');
    expect(button).to.exist;
    expect(button!.getAttribute('aria-label')).to.equal('Play: Build a portal');
    expect(part(el, '.meta')!.textContent).to.contain(
      'Plays from YouTube (no cookies)',
    );
    expect(part(el, '.meta')!.textContent).to.contain('9:42');
    expect(part(el, 'iframe')).to.be.null;
    expect(el.provider).to.equal('youtube');
  });

  it('loads the player on click, fires play and moves focus to it', async () => {
    const el = await fixture<Video>(
      html`<wc-video src="https://vimeo.com/76979871" label="Tour"></wc-video>`,
    );
    setTimeout(() => part<HTMLButtonElement>(el, '.play-button')!.click());
    await oneEvent(el, 'play');
    await el.updateComplete;
    const iframe = part<HTMLIFrameElement>(el, 'iframe')!;
    expect(iframe.src).to.contain('player.vimeo.com/video/76979871');
    expect(iframe.title).to.equal('Tour');
    expect(el.shadowRoot!.activeElement).to.equal(iframe);
    expect(part(el, '.play-button')).to.be.null;
  });

  it('goes back to the poster when src changes', async () => {
    const el = await fixture<Video>(
      html`<wc-video src="https://youtu.be/one"></wc-video>`,
    );
    el.play();
    await el.updateComplete;
    expect(part(el, 'iframe')).to.exist;
    el.src = 'https://youtu.be/two';
    await el.updateComplete;
    expect(part(el, 'iframe')).to.be.null;
    expect(part(el, '.play-button')!.getAttribute('aria-label')).to.equal(
      'Play: Video',
    );
  });

  it('renders a file in a native video with its tracks', async () => {
    const el = await fixture<Video>(
      html`<wc-video src="/media/tour.mp4" label="Tour" aspect-ratio="4 / 3">
        <track kind="captions" src="/media/tour.vtt" srclang="en" />
      </wc-video>`,
    );
    const video = part<HTMLVideoElement>(el, 'video')!;
    expect(video.controls).to.be.true;
    expect(video.preload).to.equal('none');
    expect(video.getAttribute('aria-label')).to.equal('Tour');
    expect(video.querySelectorAll('track')).to.have.length(1);
    expect(part(el, '.frame')!.style.aspectRatio).to.equal('4 / 3');
  });
});
