import fs from 'fs';

fs.cpSync('../design-tokens/dist/', './src-scss-components', {
  recursive: true,
  force: true,
});
