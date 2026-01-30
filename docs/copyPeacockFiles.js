import fs from 'fs';

fs.cpSync('../components/dist/', './public/assets/peacock/', {
  recursive: true,
  force: true,
});

fs.cpSync(
  '../components/dist/custom-elements-jsdocs.json',
  './src/_data/custom-elements-jsdocs.json',
  {
    recursive: true,
    force: true,
  },
);
