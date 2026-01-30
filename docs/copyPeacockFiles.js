import fs from 'fs';

fs.cpSync('../components/dist/', './public/assets/peacock/', {
  recursive: true,
  force: true,
});

fs.cpSync(
  '../components/dist/custom-elements.json',
  './src/_data/custom-elements.json',
  {
    recursive: true,
    force: true,
  },
);
