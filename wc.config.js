import packageJson from './components/package.json' with { type: 'json' };

const prefixLocalPath = path =>
  `./components/${path.replace(/^\.\//, '')}`;

const repositoryUrl =
  typeof packageJson.repository === 'string'
    ? packageJson.repository
    : packageJson.repository?.url;

export default {
  /** Fetch manifest from the built components package. */
  manifestSrc: packageJson.customElements
    ? prefixLocalPath(packageJson.customElements)
    : './components/dist/custom-elements.json',
  packageName: packageJson.name,
  packageVersion: packageJson.version,
  packageDescription: packageJson.description,
  packageLicense: packageJson.license,
  homepage: packageJson.homepage,
  repositoryUrl,
  webTypesSrc: packageJson['web-types']
    ? prefixLocalPath(packageJson['web-types'])
    : './components/dist/web-types.json',
  readmeSrc: './components/readme.md',
};
