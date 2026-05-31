const fs = require('fs');

function releaseToDocs(cb) {
  const packageJsonStr = fs.readFileSync('components/package.json');
  const packageJson = JSON.parse(packageJsonStr);

  fs.readFile('docs/src/siteconfig.ts', 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    const match = data.match(/export const VERSION = '([^']+)'/);
    const currentVersion = match ? match[1] : null;
    if (currentVersion !== packageJson.version) {
      const result = data
        .replace(
          /export const FALLBACK_VERSION = '[^']+'/,
          `export const FALLBACK_VERSION = '${currentVersion}'`,
        )
        .replace(
          /export const VERSION = '[^']+'/,
          `export const VERSION = '${packageJson.version}'`,
        );
      fs.writeFile('docs/src/siteconfig.ts', result, 'utf8', function (err) {
        if (err) return console.log(err);
        cb('siteconfig.ts updated');
      });
    }
  });
  fs.readFile('readme.md', 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    let result = data.replace(
      new RegExp(/@redvars\/peacock@[0-9]+[.][0-9]+[.][0-9]+\/dist/, 'g'),
      `@redvars/peacock@${packageJson.version}/dist`,
    );
    fs.writeFile('readme.md', result, 'utf8', function (err) {
      if (err) return console.log(err);
      cb('Readme.md updated');
    });
  });
}

releaseToDocs(function (text) {
  console.log(text);
});
