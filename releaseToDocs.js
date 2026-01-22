const fs = require('fs');

function releaseToDocs(cb) {
  const packageJsonStr = fs.readFileSync('components/package.json');
  const packageJson = JSON.parse(packageJsonStr);

  fs.readFile('docs/src/_data/site.json', 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    let result = JSON.parse(data);
    if (result.prod.version != packageJson.version) {
      result.prod.fallbackScript = result.prod.script;
      result.prod.fallbackThemeCss = result.prod.themeCss;
      result.prod.script = `https://cdn.jsdelivr.net/npm/@redvars/peacock@${packageJson.version}/dist/peacock-loader.js`;
      result.prod.themeCss = `https://cdn.jsdelivr.net/npm/@redvars/peacock@${packageJson.version}/dist/assets/styles/tokens.css`;
      result.prod.version = packageJson.version;
      result.dev.version = packageJson.version;
    }
    fs.writeFile(
      'docs/src/_data/site.json',
      JSON.stringify(result, null, 2),
      'utf8',
      function (err) {
        if (err) return console.log(err);
        cb('site.json config updated');
      },
    );
  });
  fs.readFile('readme.md', 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    let result = data.replace(
      new RegExp(/@redvars\/peacock@[0-9]+[.][0-9]+[.][0-9]+\/dist/, 'g'),
      `@redvars/components@${packageJson.version}/dist`,
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
