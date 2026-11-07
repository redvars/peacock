/// <reference types="mocha" />
import { html, type TemplateResult } from 'lit';
import { expect, fixtureSync, waitUntil } from '@open-wc/testing';
import {
  FileUpload,
  formatFileSize,
  matchesAccept,
  type FileUploadChangeDetail,
  type FileUploadRejectDetail,
  type FileUploadRemoveDetail,
} from '../src/file-upload/index.js';
import { IconButton } from '../src/button/index.js';
import { LinearProgress } from '../src/progress/linear-progress/index.js';

for (const [tag, element] of [
  ['wc-icon-button', IconButton],
  ['wc-linear-progress', LinearProgress],
  ['wc-file-upload', FileUpload],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

function makeFile(name: string, type = 'text/plain', size = 10): File {
  return new File(['x'.repeat(size)], name, { type, lastModified: 1 });
}

function transfer(files: File[]): DataTransfer {
  const data = new DataTransfer();
  for (const file of files) data.items.add(file);
  return data;
}

function zone(el: FileUpload) {
  return el.shadowRoot!.querySelector<HTMLElement>('.drop-zone')!;
}

function nativeInput(el: FileUpload) {
  return el.shadowRoot!.querySelector<HTMLInputElement>('.native-input')!;
}

function removeButtons(el: FileUpload) {
  return Array.from(
    el.shadowRoot!.querySelectorAll<IconButton>('.remove-button'),
  );
}

function listedNames(el: FileUpload) {
  return Array.from(el.shadowRoot!.querySelectorAll('.file-name')).map(
    node => node.textContent,
  );
}

async function drop(el: FileUpload, files: File[]) {
  zone(el).dispatchEvent(
    new DragEvent('drop', {
      dataTransfer: transfer(files),
      bubbles: true,
      cancelable: true,
    }),
  );
  await el.updateComplete;
}

async function pick(el: FileUpload, files: File[]) {
  const input = nativeInput(el);
  input.files = transfer(files).files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
  await el.updateComplete;
}

async function create(template: TemplateResult) {
  const el = fixtureSync(template) as FileUpload;
  await el.updateComplete;
  return el;
}

describe('FileUpload', () => {
  it('names the drop zone from the label and the prompt', async () => {
    const el = await create(
      html`<wc-file-upload label="Attachments" multiple></wc-file-upload>`,
    );
    const ids = zone(el).getAttribute('aria-labelledby')!.split(' ');
    const name = ids
      .map(id => el.shadowRoot!.getElementById(id)!.textContent!.trim())
      .join(' ')
      .replace(/\s+/g, ' ');
    expect(zone(el).getAttribute('role')).to.equal('button');
    expect(zone(el).tabIndex).to.equal(0);
    expect(name).to.equal('Attachments Drag files here or choose files');
  });

  it('uses the single-file prompt without multiple', async () => {
    const el = await create(html`<wc-file-upload></wc-file-upload>`);
    expect(
      zone(el).querySelector('.prompt')!.textContent!.replace(/\s+/g, ' '),
    ).to.contain('Drag a file here or choose a file');
  });

  it('describes the drop zone with the helper text', async () => {
    const el = await create(
      html`<wc-file-upload helper-text="PDF, up to 5 MB"></wc-file-upload>`,
    );
    const id = zone(el).getAttribute('aria-describedby')!;
    expect(el.shadowRoot!.getElementById(id)!.textContent).to.equal(
      'PDF, up to 5 MB',
    );
  });

  it('opens the native picker on click, Enter and Space', async () => {
    const el = await create(
      html`<wc-file-upload accept=".pdf" multiple></wc-file-upload>`,
    );
    const input = nativeInput(el);
    expect(input.accept).to.equal('.pdf');
    expect(input.multiple).to.be.true;
    let opened = 0;
    input.addEventListener('click', event => {
      event.preventDefault();
      opened += 1;
    });
    zone(el).click();
    zone(el).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    zone(el).dispatchEvent(new KeyboardEvent('keyup', { key: ' ' }));
    expect(opened).to.equal(3);
  });

  it('adds picked files and fires change with value and files', async () => {
    const el = await create(html`<wc-file-upload multiple></wc-file-upload>`);
    const events: FileUploadChangeDetail[] = [];
    el.addEventListener('change', event =>
      events.push((event as CustomEvent<FileUploadChangeDetail>).detail),
    );
    const a = makeFile('a.txt');
    const b = makeFile('b.txt');
    await pick(el, [a, b]);
    expect(el.files.map(file => file.name)).to.deep.equal(['a.txt', 'b.txt']);
    expect(el.value).to.equal(el.files);
    expect(events).to.have.length(1);
    expect(events[0].files).to.equal(el.files);
    expect(events[0].value).to.equal(el.files);
    expect(listedNames(el)).to.deep.equal(['a.txt', 'b.txt']);
    expect(nativeInput(el).value).to.equal('');
  });

  it('adds dropped files and shows the drag state', async () => {
    const el = await create(html`<wc-file-upload multiple></wc-file-upload>`);
    zone(el).dispatchEvent(
      new DragEvent('dragenter', { bubbles: true, cancelable: true }),
    );
    await el.updateComplete;
    expect(zone(el).classList.contains('dragging')).to.be.true;
    await drop(el, [makeFile('a.txt')]);
    expect(zone(el).classList.contains('dragging')).to.be.false;
    expect(el.files.map(file => file.name)).to.deep.equal(['a.txt']);
  });

  it('rejects files of the wrong type', async () => {
    const el = await create(
      html`<wc-file-upload accept="image/*,.pdf" multiple></wc-file-upload>`,
    );
    let rejected: FileUploadRejectDetail | undefined;
    el.addEventListener('reject', event => {
      rejected = (event as CustomEvent<FileUploadRejectDetail>).detail;
    });
    const exe = makeFile('setup.exe', 'application/octet-stream');
    await drop(el, [
      makeFile('a.png', 'image/png'),
      makeFile('b.PDF', 'application/pdf'),
      exe,
    ]);
    expect(el.files.map(file => file.name)).to.deep.equal(['a.png', 'b.PDF']);
    expect(rejected!.files).to.deep.equal([{ file: exe, reason: 'type' }]);
    expect(el.shadowRoot!.querySelector('.rejections')!.textContent).to.contain(
      'setup.exe is not an accepted file type',
    );
  });

  it('rejects files over max-size', async () => {
    const el = await create(
      html`<wc-file-upload
        max-size="100"
        multiple
        lang="en-US"
      ></wc-file-upload>`,
    );
    let rejected: FileUploadRejectDetail | undefined;
    el.addEventListener('reject', event => {
      rejected = (event as CustomEvent<FileUploadRejectDetail>).detail;
    });
    const big = makeFile('big.txt', 'text/plain', 101);
    await drop(el, [makeFile('small.txt', 'text/plain', 100), big]);
    expect(el.files.map(file => file.name)).to.deep.equal(['small.txt']);
    expect(rejected!.files).to.deep.equal([{ file: big, reason: 'size' }]);
    expect(el.shadowRoot!.querySelector('.rejections')!.textContent).to.contain(
      'big.txt is larger than 100 bytes',
    );
  });

  it('rejects files beyond max-files', async () => {
    const el = await create(
      html`<wc-file-upload multiple max-files="2"></wc-file-upload>`,
    );
    const rejections: FileUploadRejectDetail[] = [];
    el.addEventListener('reject', event =>
      rejections.push((event as CustomEvent<FileUploadRejectDetail>).detail),
    );
    await drop(el, [makeFile('a.txt')]);
    const c = makeFile('c.txt');
    await drop(el, [makeFile('b.txt'), c]);
    expect(el.files.map(file => file.name)).to.deep.equal(['a.txt', 'b.txt']);
    expect(rejections).to.have.length(1);
    expect(rejections[0].files).to.deep.equal([{ file: c, reason: 'count' }]);
  });

  it('replaces the file without multiple and rejects extra dropped files', async () => {
    const el = await create(html`<wc-file-upload></wc-file-upload>`);
    let rejected: FileUploadRejectDetail | undefined;
    el.addEventListener('reject', event => {
      rejected = (event as CustomEvent<FileUploadRejectDetail>).detail;
    });
    await pick(el, [makeFile('a.txt')]);
    await pick(el, [makeFile('b.txt')]);
    expect(el.files.map(file => file.name)).to.deep.equal(['b.txt']);
    const d = makeFile('d.txt');
    await drop(el, [makeFile('c.txt'), d]);
    expect(el.files.map(file => file.name)).to.deep.equal(['c.txt']);
    expect(rejected!.files).to.deep.equal([{ file: d, reason: 'count' }]);
  });

  it('does not add a file that is already listed', async () => {
    const el = await create(html`<wc-file-upload multiple></wc-file-upload>`);
    await drop(el, [makeFile('a.txt')]);
    let changes = 0;
    el.addEventListener('change', () => {
      changes += 1;
    });
    await drop(el, [makeFile('a.txt')]);
    expect(el.files).to.have.length(1);
    expect(changes).to.equal(0);
  });

  it('removes a file, firing remove and then change', async () => {
    const el = await create(html`<wc-file-upload multiple></wc-file-upload>`);
    const a = makeFile('a.txt');
    const b = makeFile('b.txt');
    el.files = [a, b];
    await el.updateComplete;
    const order: string[] = [];
    let removed: File | undefined;
    el.addEventListener('remove', event => {
      order.push('remove');
      removed = (event as CustomEvent<FileUploadRemoveDetail>).detail.file;
    });
    el.addEventListener('change', event => {
      order.push('change');
      expect(
        (event as CustomEvent<FileUploadChangeDetail>).detail.files,
      ).to.deep.equal([b]);
    });
    const [button] = removeButtons(el);
    expect(button.getAttribute('aria-label')).to.equal('Remove a.txt');
    expect(button.getAttribute('shape')).to.equal('round');
    button.click();
    await el.updateComplete;
    expect(order).to.deep.equal(['remove', 'change']);
    expect(removed).to.equal(a);
    expect(el.files).to.deep.equal([b]);
    expect(listedNames(el)).to.deep.equal(['b.txt']);
  });

  it('shows the size of each file', async () => {
    const el = await create(
      html`<wc-file-upload lang="en-US"></wc-file-upload>`,
    );
    el.files = [makeFile('a.txt', 'text/plain', 1500)];
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.file-size')!.textContent).to.equal(
      '1.5 kB',
    );
  });

  it('shows progress, errors and done state set by the app', async () => {
    const el = await create(
      html`<wc-file-upload lang="en-US"></wc-file-upload>`,
    );
    const file = makeFile('a.txt');
    el.files = [file];
    await el.updateComplete;
    const item = () => el.shadowRoot!.querySelector('.file-item')!;

    el.setFileState(file, { progress: 40 });
    await el.updateComplete;
    const bar = item().querySelector<LinearProgress>('wc-linear-progress')!;
    expect(bar.value).to.equal(40);
    expect(item().querySelector('.percent')!.textContent!.trim()).to.equal(
      '40%',
    );
    // The bar itself is the named progressbar; the visible percentage is hidden from readers.
    await bar.updateComplete;
    const progressbar = bar.shadowRoot!.querySelector('[role="progressbar"]')!;
    expect(progressbar.getAttribute('aria-label')).to.equal('Uploading a.txt');
    expect(progressbar.getAttribute('aria-valuenow')).to.equal('40');

    el.setFileState(file, { error: 'Upload failed' });
    await el.updateComplete;
    expect(item().classList.contains('error')).to.be.true;
    expect(item().querySelector('.file-error')!.textContent).to.equal(
      'Upload failed',
    );
    expect(item().querySelector('wc-linear-progress')).to.be.null;
    expect(el.getFileState(file)).to.deep.equal({
      progress: 40,
      error: 'Upload failed',
    });

    el.setFileState(file, { error: undefined, done: true });
    await el.updateComplete;
    expect(item().classList.contains('done')).to.be.true;
    expect(item().querySelector('.file-status')!.textContent!.trim()).to.equal(
      'Uploaded',
    );
  });

  it('ignores state for files that are not listed and drops state of removed files', async () => {
    const el = await create(html`<wc-file-upload></wc-file-upload>`);
    const file = makeFile('a.txt');
    el.setFileState(file, { progress: 10 });
    expect(el.getFileState(file)).to.deep.equal({});
    el.files = [file];
    await el.updateComplete;
    el.setFileState(file, { progress: 10 });
    el.files = [];
    await el.updateComplete;
    expect(el.getFileState(file)).to.deep.equal({});
  });

  it('announces added, rejected and removed files', async () => {
    const el = await create(
      html`<wc-file-upload accept=".txt" multiple></wc-file-upload>`,
    );
    const status = () =>
      el.shadowRoot!.querySelector('[role="status"]')!.textContent!.trim();
    await drop(el, [makeFile('a.txt'), makeFile('b.png', 'image/png')]);
    await waitUntil(() => status() !== '');
    expect(status()).to.equal(
      '1 file added. b.png is not an accepted file type',
    );
    removeButtons(el)[0].click();
    await waitUntil(() => status() === 'a.txt removed');
  });

  it('submits the files under its name', async () => {
    const form = fixtureSync(
      html`<form>
        <wc-file-upload name="docs" multiple></wc-file-upload>
      </form>`,
    ) as HTMLFormElement;
    const el = form.querySelector('wc-file-upload') as FileUpload;
    await el.updateComplete;
    expect(new FormData(form).getAll('docs')).to.deep.equal([]);
    const a = makeFile('a.txt');
    const b = makeFile('b.txt');
    await drop(el, [a, b]);
    const sent = new FormData(form).getAll('docs') as File[];
    expect(sent.map(file => file.name)).to.deep.equal(['a.txt', 'b.txt']);
  });

  it('blocks submission while required and empty, and shows the message', async () => {
    const form = fixtureSync(
      html`<form>
        <wc-file-upload name="doc" required></wc-file-upload>
      </form>`,
    ) as HTMLFormElement;
    const el = form.querySelector('wc-file-upload') as FileUpload;
    await el.updateComplete;
    expect(el.checkValidity()).to.be.false;
    expect(el.validity.valueMissing).to.be.true;
    expect(el.validationMessage).to.equal('Please select a file.');
    expect(form.checkValidity()).to.be.false;

    form.requestSubmit();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.helper')!.textContent).to.equal(
      'Please select a file.',
    );
    // `role="button"` takes no `aria-invalid`; the message is the zone's description.
    const described = zone(el).getAttribute('aria-describedby')!;
    expect(el.shadowRoot!.getElementById(described)!.textContent).to.equal(
      'Please select a file.',
    );

    await pick(el, [makeFile('a.txt')]);
    expect(el.checkValidity()).to.be.true;
  });

  it('clears the files on form reset', async () => {
    const form = fixtureSync(
      html`<form>
        <wc-file-upload name="doc"></wc-file-upload>
      </form>`,
    ) as HTMLFormElement;
    const el = form.querySelector('wc-file-upload') as FileUpload;
    await el.updateComplete;
    await pick(el, [makeFile('a.txt')]);
    form.reset();
    await el.updateComplete;
    expect(el.files).to.deep.equal([]);
    expect(listedNames(el)).to.deep.equal([]);
    expect(new FormData(form).get('doc')).to.be.null;
  });

  it('takes no files while disabled', async () => {
    const el = await create(
      html`<wc-file-upload disabled multiple></wc-file-upload>`,
    );
    expect(zone(el).tabIndex).to.equal(-1);
    expect(zone(el).getAttribute('aria-disabled')).to.equal('true');
    await drop(el, [makeFile('a.txt')]);
    expect(el.files).to.deep.equal([]);
  });

  it('shows the list without the drop zone or remove buttons while readonly', async () => {
    const el = await create(html`<wc-file-upload readonly></wc-file-upload>`);
    el.files = [makeFile('a.txt')];
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.drop-zone')).to.be.null;
    expect(removeButtons(el)).to.have.length(0);
    expect(listedNames(el)).to.deep.equal(['a.txt']);
  });

  it('names the file list from the label', async () => {
    const el = await create(
      html`<wc-file-upload label="Attachments"></wc-file-upload>`,
    );
    el.files = [makeFile('a.txt')];
    await el.updateComplete;
    expect(
      el.shadowRoot!.querySelector('.file-list')!.getAttribute('aria-label'),
    ).to.equal('Attachments');
  });
});

describe('file upload helpers', () => {
  it('matches accept lists like a native file input', () => {
    const png = makeFile('photo.PNG', 'image/png');
    expect(matchesAccept(png, '')).to.be.true;
    expect(matchesAccept(png, 'image/*')).to.be.true;
    expect(matchesAccept(png, '.png')).to.be.true;
    expect(matchesAccept(png, 'image/png')).to.be.true;
    expect(matchesAccept(png, '.pdf, application/pdf')).to.be.false;
  });

  it('formats sizes in decimal units', () => {
    expect(formatFileSize(1, 'en-US')).to.equal('1 byte');
    expect(formatFileSize(512, 'en-US')).to.equal('512 bytes');
    expect(formatFileSize(5_000_000, 'en-US')).to.equal('5 MB');
    // German separates the number and unit with a no-break space.
    expect(formatFileSize(1_250_000_000, 'de-DE').replace(/\s/g, ' ')).to.equal(
      '1,3 GB',
    );
  });
});
