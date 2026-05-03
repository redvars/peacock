const fs = require('fs');

function releaseToDocs(cb) {
  const packageJsonStr = fs.readFileSync('components/package.json');
  const packageJson = JSON.parse(packageJsonStr);

  fs.readFile('docs/src/_data/site.json', 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    let result = JSON.parse(data);
    if (result.version !== packageJson.version) {
      result.fallbackVersion = result.version;
      result.version = packageJson.version;
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
