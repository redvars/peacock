import fs from 'fs';

fs.cpSync('../components/dist/', './public/assets/peacock/', {
  recursive: true,
  force: true,
});
