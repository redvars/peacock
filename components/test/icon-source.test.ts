import { expect } from '@open-wc/testing';
import { fetchIcon, setIconBase } from '../src/icon/datasource.js';

describe('Icon source', () => {
  const realFetch = window.fetch;
  let requested: string[] = [];
  // Fetched icons are cached by URL, so each test asks for a name nobody asked for before.
  const fresh = () => `test_${Math.random().toString(36).slice(2)}`;

  beforeEach(() => {
    requested = [];
    window.fetch = async (input: RequestInfo | URL) => {
      requested.push(String(input));
      return new Response('<svg></svg>', { status: 200 });
    };
  });

  afterEach(() => {
    window.fetch = realFetch;
  });

  it('loads Material Symbols from the CDN by default', async () => {
    const name = fresh();
    await fetchIcon(name);
    expect(requested).to.deep.equal([
      `https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@0.40.1/outlined/${name}.svg`,
    ]);
  });

  it('loads from a base set with setIconBase, resolved against the page', async () => {
    setIconBase('material-symbols', '/assets/icons');
    const name = fresh();
    await fetchIcon(name);
    expect(requested).to.deep.equal([
      `${window.location.origin}/assets/icons/${name}.svg`,
    ]);
  });

  it('keeps an icon name inside the base folder', async () => {
    setIconBase('material-symbols', '/assets/icons/');
    const name = `../${fresh()}`;
    await fetchIcon(name);
    expect(requested).to.deep.equal([
      `${window.location.origin}/assets/icons/..%2F${name.slice(3)}.svg`,
    ]);
  });

  it('refuses an unknown provider', async () => {
    let error: unknown;
    try {
      await fetchIcon('home', 'no-such-provider');
    } catch (e) {
      error = e;
    }
    expect(error).to.be.instanceOf(Error);
    expect(requested).to.deep.equal([]);
  });

  it('points Material Symbols at icons/ beside the full build', async () => {
    await import('../src/shipped-icons.js');
    const name = fresh();
    await fetchIcon(name);
    expect(requested).to.have.length(1);
    const url = new URL(requested[0]);
    expect(url.origin).to.equal(window.location.origin);
    expect(url.pathname).to.match(
      new RegExp(`/icons/material-symbols/${name}\\.svg$`),
    );
  });
});
