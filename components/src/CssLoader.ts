const sheetCache = new Map<string, CSSStyleSheet>();

async function loadCSS(
  url: string,
  options: any = {}
): Promise<CSSStyleSheet> {
  const {
    priority = "high",
    cache = "force-cache",
    media = "all",
  } = options;

  // Return cached sheet immediately
  if (sheetCache.has(url)) {
    const cached = sheetCache.get(url)!;
    if (!document.adoptedStyleSheets.includes(cached)) {
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, cached];
    }
    return cached;
  }

  const response = await fetch(url, {
    cache,
    priority,
  });

  if (!response.ok) {
    throw new Error(`Failed to load CSS [${response.status}]: ${url}`);
  }

  const css = await response.text();
  const sheet = new CSSStyleSheet({ media });

  sheet.replaceSync(css);
  sheetCache.set(url, sheet);
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];

  return sheet;
}

async function loadMultipleCSS(
  urls: string[],
  options: any = {}
): Promise<CSSStyleSheet[]> {
  return Promise.all(urls.map((url) => loadCSS(url, options)));
}

function unloadCSS(url: string): boolean {
  const sheet = sheetCache.get(url);
  if (!sheet) return false;

  document.adoptedStyleSheets = document.adoptedStyleSheets.filter(
    (s) => s !== sheet
  );
  sheetCache.delete(url);
  return true;
}

function clearAllCSS(): void {
  document.adoptedStyleSheets = document.adoptedStyleSheets.filter(
    (s) => ![...sheetCache.values()].includes(s)
  );
  sheetCache.clear();
}

export { loadCSS, loadMultipleCSS, unloadCSS, clearAllCSS };