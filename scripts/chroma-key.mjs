#!/usr/bin/env node
/**
 * Pull chroma-key magenta (#FF00FF) to alpha and copy scene plates into /public.
 */
import {copyFileSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {PNG} from 'pngjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const assets = join(
  process.env.HOME ?? '',
  '.cursor/projects/Users-chandrakantaghadei-Documents-paper-collage/assets',
);

const magentaAlpha = (r, g, b) => {
  const chroma = (r + b) / 2 - g;
  const balance = 1 - Math.abs(r - b) / 255;
  const score = chroma * (0.55 + 0.45 * balance);
  if (score <= 28) {
    return 255;
  }
  if (score >= 78) {
    return 0;
  }
  return Math.round(255 * (1 - (score - 28) / 50));
};

const keyFile = (srcName, destRel) => {
  const src = join(assets, srcName);
  const dest = join(root, 'public', destRel);
  mkdirSync(dirname(dest), {recursive: true});
  const png = PNG.sync.read(readFileSync(src));
  for (let i = 0; i < png.data.length; i += 4) {
    const r = png.data[i];
    const g = png.data[i + 1];
    const b = png.data[i + 2];
    const a = magentaAlpha(r, g, b);
    png.data[i + 3] = Math.min(png.data[i + 3], a);
    if (a < 255) {
      // Kill leftover magenta spill on the fringes.
      const lift = Math.round((255 - a) * 0.35);
      png.data[i + 1] = Math.min(255, g + lift);
    }
  }
  writeFileSync(dest, PNG.sync.write(png));
  console.log('keyed', destRel);
};

const copyBg = (srcName, destRel) => {
  const dest = join(root, 'public', destRel);
  mkdirSync(dirname(dest), {recursive: true});
  copyFileSync(join(assets, srcName), dest);
  console.log('copied', destRel);
};

copyBg('dialogue-background.png', 'scenes/dialogue/background.png');
keyFile('dialogue-midground.png', 'scenes/dialogue/midground.png');
keyFile('dialogue-foreground.png', 'scenes/dialogue/foreground.png');

copyBg('recognition-background.png', 'scenes/recognition/background.png');
keyFile('recognition-midground.png', 'scenes/recognition/midground.png');
keyFile('recognition-foreground.png', 'scenes/recognition/foreground.png');

copyBg('departure-background.png', 'scenes/departure/background.png');
keyFile('departure-midground.png', 'scenes/departure/midground.png');
keyFile('departure-foreground.png', 'scenes/departure/foreground.png');
