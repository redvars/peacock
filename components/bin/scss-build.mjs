import * as sass from 'sass';
import path from 'path';
import fs from 'fs/promises';

const projectRoot = process.cwd();
const outputFolder = 'dist/assets';

const sourceFiles = [
  'scss/styles.scss',
  'scss/components.scss',
];

await Promise.all(sourceFiles.map(async (src) => {
  const outputPath = path.join(projectRoot, outputFolder, path.basename(src, '.scss') + '.css');
  const mapPath = outputPath + '.map';

  const result = sass.compile(path.join(projectRoot, src), {
    style: 'compressed',
    sourceMap: true,
    sourceMapIncludeSources: true,
  });

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  await Promise.all([
    fs.writeFile(
      outputPath,
      result.css + `\n/*# sourceMappingURL=${path.basename(mapPath)} */`
    ),
    fs.writeFile(mapPath, JSON.stringify(result.sourceMap)),
  ]);
}));