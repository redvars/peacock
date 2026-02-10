import fs from 'fs';

fs.cpSync('../design-tokens/dist/tokens.css', './dist/assets/styles/', {
  recursive: true,
  force: true,
});
