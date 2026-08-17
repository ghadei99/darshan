#!/usr/bin/env node
/**
 * Generate torn-paper PNG layers so the project renders without custom art.
 * Re-run: npm run generate:assets
 * Swap these files with your own cut-outs (see README).
 */
import {deflateSync} from 'node:zlib';
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const WIDTH = 1920;
const HEIGHT = 1920;

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c >>> 0;
}

const crc32 = (buf) => {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
};

const encodePng = (width, height, rgba) => {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const src = y * width * 4;
    const dst = y * (width * 4 + 1);
    raw[dst] = 0;
    rgba.copy(raw, dst + 1, src, src + width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const idat = deflateSync(raw, {level: 6});
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

const mulberry = (seed) => {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const setPx = (rgba, x, y, r, g, b, a) => {
  if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) {
    return;
  }
  const i = (y * WIDTH + x) * 4;
  rgba[i] = r;
  rgba[i + 1] = g;
  rgba[i + 2] = b;
  rgba[i + 3] = a;
};

const blendPx = (rgba, x, y, r, g, b, a) => {
  if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT || a <= 0) {
    return;
  }
  const i = (y * WIDTH + x) * 4;
  const srcA = a / 255;
  const dstA = rgba[i + 3] / 255;
  const outA = srcA + dstA * (1 - srcA);
  if (outA <= 0) {
    return;
  }
  rgba[i] = Math.round((r * srcA + rgba[i] * dstA * (1 - srcA)) / outA);
  rgba[i + 1] = Math.round((g * srcA + rgba[i + 1] * dstA * (1 - srcA)) / outA);
  rgba[i + 2] = Math.round((b * srcA + rgba[i + 2] * dstA * (1 - srcA)) / outA);
  rgba[i + 3] = Math.round(outA * 255);
};

const fillPoly = (rgba, pts, color, grain, rand) => {
  if (pts.length < 3) {
    return;
  }
  let minY = HEIGHT;
  let maxY = 0;
  for (const p of pts) {
    minY = Math.min(minY, Math.floor(p[1]));
    maxY = Math.max(maxY, Math.ceil(p[1]));
  }
  minY = Math.max(0, minY);
  maxY = Math.min(HEIGHT - 1, maxY);
  const n = pts.length;
  for (let y = minY; y <= maxY; y++) {
    const ys = y + 0.5;
    const xs = [];
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const yi = pts[i][1];
      const yj = pts[j][1];
      if ((yi <= ys && yj > ys) || (yj <= ys && yi > ys)) {
        const x =
          pts[i][0] + ((ys - yi) * (pts[j][0] - pts[i][0])) / (yj - yi);
        xs.push(x);
      }
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const x0 = Math.max(0, Math.ceil(xs[k]));
      const x1 = Math.min(WIDTH - 1, Math.floor(xs[k + 1]));
      for (let x = x0; x <= x1; x++) {
        const noise = (rand() - 0.5) * grain;
        blendPx(
          rgba,
          x,
          y,
          clamp(color[0] + noise),
          clamp(color[1] + noise),
          clamp(color[2] + noise),
          color[3],
        );
      }
    }
  }
};

const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));

const tornEdge = (from, to, steps, amp, rand) => {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = from[0] + (to[0] - from[0]) * t;
    const y = from[1] + (to[1] - from[1]) * t;
    const nx = -(to[1] - from[1]);
    const ny = to[0] - from[0];
    const len = Math.hypot(nx, ny) || 1;
    const wobble = (rand() - 0.5) * 2 * amp + Math.sin(t * 18 + rand() * 4) * amp * 0.35;
    pts.push([x + (nx / len) * wobble, y + (ny / len) * wobble]);
  }
  return pts;
};

const hillRidge = (baseY, amp, steps, rand) => {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = t * (WIDTH + 80) - 40;
    const y =
      baseY +
      Math.sin(t * Math.PI * 2.2) * amp +
      Math.sin(t * Math.PI * 5.1 + 1.3) * amp * 0.35 +
      (rand() - 0.5) * 18;
    pts.push([x, y]);
  }
  return pts;
};

const closeGround = (ridge) => {
  const last = ridge[ridge.length - 1];
  const first = ridge[0];
  return [
    ...ridge,
    [last[0] + 20, HEIGHT + 40],
    [first[0] - 20, HEIGHT + 40],
  ];
};

const ellipse = (cx, cy, rx, ry, segs, rand, jitter) => {
  const pts = [];
  for (let i = 0; i < segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    const j = 1 + (rand() - 0.5) * jitter;
    pts.push([cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j]);
  }
  return pts;
};

const birdShape = (cx, cy, s, rand) => {
  const body = ellipse(cx, cy, 70 * s, 22 * s, 18, rand, 0.08);
  const wing = [
    [cx - 10 * s, cy],
    ...tornEdge([cx - 10 * s, cy], [cx + 20 * s, cy - 90 * s], 8, 6, rand),
    ...tornEdge([cx + 20 * s, cy - 90 * s], [cx + 70 * s, cy - 8 * s], 8, 7, rand),
    [cx + 18 * s, cy + 4 * s],
  ];
  const tail = [
    [cx - 60 * s, cy - 6 * s],
    [cx - 118 * s, cy - 28 * s],
    [cx - 108 * s, cy + 4 * s],
    [cx - 62 * s, cy + 10 * s],
  ];
  return [body, wing, tail];
};

const house = (cx, cy, s, rand) => {
  const wall = [
    [cx - 160 * s, cy],
    [cx + 160 * s, cy],
    [cx + 168 * s, cy + 220 * s],
    [cx - 168 * s, cy + 220 * s],
  ];
  const roof = [
    [cx - 190 * s, cy + 8 * s],
    [cx, cy - 130 * s],
    [cx + 190 * s, cy + 8 * s],
    [cx + 140 * s, cy + 18 * s],
    [cx, cy - 90 * s],
    [cx - 140 * s, cy + 18 * s],
  ];
  const door = [
    [cx - 28 * s, cy + 90 * s],
    [cx + 28 * s, cy + 90 * s],
    [cx + 30 * s, cy + 220 * s],
    [cx - 30 * s, cy + 220 * s],
  ];
  const window = ellipse(cx + 70 * s, cy + 80 * s, 28 * s, 34 * s, 14, rand, 0.05);
  return {wall, roof, door, window};
};

const paperFill = (rgba, color, rand) => {
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const wash = Math.sin(y / 280) * 6 + Math.sin(x / 340) * 4;
      const n = (rand() - 0.5) * 14;
      setPx(
        rgba,
        x,
        y,
        clamp(color[0] + wash + n),
        clamp(color[1] + wash + n),
        clamp(color[2] + wash * 0.6 + n),
        255,
      );
    }
  }
};

const writeLayer = (relPath, rgba) => {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const out = join(root, 'public', relPath);
  mkdirSync(dirname(out), {recursive: true});
  writeFileSync(out, encodePng(WIDTH, HEIGHT, rgba));
  console.log(`wrote public/${relPath}`);
};

const hillside = () => {
  const bg = Buffer.alloc(WIDTH * HEIGHT * 4);
  const mid = Buffer.alloc(WIDTH * HEIGHT * 4);
  const fg = Buffer.alloc(WIDTH * HEIGHT * 4);
  const r1 = mulberry(11);
  const r2 = mulberry(29);
  const r3 = mulberry(47);

  paperFill(bg, [214, 196, 168], r1);
  fillPoly(bg, closeGround(hillRidge(980, 70, 28, r1)), [176, 154, 122, 255], 18, r1);
  fillPoly(bg, closeGround(hillRidge(1120, 50, 24, r1)), [158, 132, 102, 255], 16, r1);
  fillPoly(
    bg,
    ellipse(1480, 420, 90, 90, 22, r1, 0.06),
    [232, 214, 176, 220],
    10,
    r1,
  );

  fillPoly(mid, closeGround(hillRidge(1080, 90, 32, r2)), [122, 132, 98, 255], 20, r2);
  fillPoly(mid, closeGround(hillRidge(1240, 60, 26, r2)), [96, 108, 78, 255], 16, r2);
  for (let i = 0; i < 7; i++) {
    const x = 180 + i * 250 + r2() * 40;
    const h = 140 + r2() * 90;
    fillPoly(
      mid,
      [
        [x, 1180],
        [x + 18, 1180 - h],
        [x + 40, 1180],
      ],
      [72, 82, 58, 255],
      12,
      r2,
    );
  }

  fillPoly(fg, closeGround(hillRidge(1420, 40, 20, r3)), [86, 64, 48, 255], 22, r3);
  const figure = [
    [420, 1380],
    [448, 1240],
    [470, 1244],
    [490, 1384],
    [478, 1520],
    [430, 1520],
  ];
  fillPoly(fg, figure, [58, 44, 36, 255], 10, r3);
  fillPoly(fg, ellipse(458, 1218, 16, 18, 12, r3, 0.1), [58, 44, 36, 255], 8, r3);

  writeLayer('scenes/hillside/background.png', bg);
  writeLayer('scenes/hillside/midground.png', mid);
  writeLayer('scenes/hillside/foreground.png', fg);
};

const flight = () => {
  const bg = Buffer.alloc(WIDTH * HEIGHT * 4);
  const mid = Buffer.alloc(WIDTH * HEIGHT * 4);
  const fg = Buffer.alloc(WIDTH * HEIGHT * 4);
  const r1 = mulberry(101);
  const r2 = mulberry(202);
  const r3 = mulberry(303);

  paperFill(bg, [206, 186, 164], r1);
  fillPoly(
    bg,
    ellipse(420, 380, 120, 110, 24, r1, 0.08),
    [236, 220, 188, 200],
    12,
    r1,
  );
  fillPoly(bg, closeGround(hillRidge(1280, 40, 18, r1)), [168, 148, 122, 255], 14, r1);

  fillPoly(mid, closeGround(hillRidge(1180, 80, 26, r2)), [140, 118, 92, 230], 18, r2);
  fillPoly(
    mid,
    [
      ...tornEdge([80, 900], [700, 760], 16, 22, r2),
      ...tornEdge([700, 760], [80, 1040], 12, 18, r2),
    ],
    [188, 122, 86, 240],
    16,
    r2,
  );

  for (const shape of birdShape(1180, 720, 1.35, r3)) {
    fillPoly(fg, shape, [52, 40, 34, 255], 10, r3);
  }
  fillPoly(
    fg,
    closeGround(hillRidge(1560, 28, 14, r3)),
    [74, 56, 44, 255],
    18,
    r3,
  );

  writeLayer('scenes/flight/background.png', bg);
  writeLayer('scenes/flight/midground.png', mid);
  writeLayer('scenes/flight/foreground.png', fg);
};

const home = () => {
  const bg = Buffer.alloc(WIDTH * HEIGHT * 4);
  const mid = Buffer.alloc(WIDTH * HEIGHT * 4);
  const fg = Buffer.alloc(WIDTH * HEIGHT * 4);
  const r1 = mulberry(7);
  const r2 = mulberry(8);
  const r3 = mulberry(9);

  paperFill(bg, [196, 168, 140], r1);
  fillPoly(
    bg,
    ellipse(960, 520, 160, 150, 26, r1, 0.05),
    [228, 186, 120, 210],
    12,
    r1,
  );
  fillPoly(bg, closeGround(hillRidge(1320, 36, 16, r1)), [154, 126, 98, 255], 14, r1);

  const h = house(960, 980, 1.15, r2);
  fillPoly(mid, h.wall, [210, 188, 158, 255], 14, r2);
  fillPoly(mid, h.roof, [132, 72, 52, 255], 16, r2);
  fillPoly(mid, h.door, [86, 58, 44, 255], 10, r2);
  fillPoly(mid, h.window, [236, 210, 150, 255], 8, r2);
  fillPoly(mid, closeGround(hillRidge(1480, 30, 14, r2)), [110, 88, 68, 240], 16, r2);

  fillPoly(fg, ellipse(1090, 1070, 46, 52, 16, r3, 0.08), [244, 214, 140, 230], 10, r3);
  fillPoly(
    fg,
    [
      [220, 1680],
      ...tornEdge([220, 1680], [860, 1540], 18, 28, r3),
      [860, HEIGHT + 20],
      [200, HEIGHT + 20],
    ],
    [92, 68, 52, 255],
    20,
    r3,
  );
  fillPoly(
    fg,
    [
      [1100, 1720],
      ...tornEdge([1100, 1720], [1780, 1600], 14, 24, r3),
      [1840, HEIGHT + 20],
      [1080, HEIGHT + 20],
    ],
    [78, 58, 46, 255],
    18,
    r3,
  );

  writeLayer('scenes/home/background.png', bg);
  writeLayer('scenes/home/midground.png', mid);
  writeLayer('scenes/home/foreground.png', fg);
};

hillside();
flight();
home();
console.log('placeholder cut-outs ready');
