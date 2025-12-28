import * as sharp from 'npm:sharp@0.33.4';
import { walkSync } from 'https://deno.land/std@0.193.0/fs/mod.ts';

for (const file of walkSync('../public/assets/img', {
  maxDepth: 1,
  includeDirs: false,
  exts: ['.png'],
})) {
  sharp.default(file.path).toFile(file.path.replace('.png', '.webp'), (err, info) => {
    console.log(err, info);
  });
}

/**
 * ```cmd
 * deno run -A convert-to-webp.ts
 * ```
 */
