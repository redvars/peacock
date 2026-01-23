import fs from 'fs';

fs.cpSync('../design-tokens/dist/', './assets', {
  recursive: true,
  force: true,
});

fs.cpSync('../design-tokens/dist/', './dist/assets/styles/', {
  recursive: true,
  force: true,
});
