import fs from 'fs';

fs.rmSync('./public/assets/peacock/', {
  recursive: true,
  force: true,
});

fs.rmSync('./dist/assets/peacock/', {
  recursive: true,
  force: true,
});

fs.cpSync('../components/dist/', './public/assets/peacock/', {
  recursive: true,
  force: true,
});

fs.cpSync('../components/dist/', './dist/assets/peacock/', {
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
