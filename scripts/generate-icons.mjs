import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { PNG } from "pngjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const directory = resolve(root, "public/icons");
mkdirSync(directory, { recursive: true });

function draw(size) {
  const png = new PNG({ width: size, height: size });
  const center = size / 2;
  const radius = size * 0.28;
  const ring = size * 0.018;
  const dot = size * 0.045;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = (size * y + x) * 4;
      png.data[index] = 12;
      png.data[index + 1] = 11;
      png.data[index + 2] = 15;
      png.data[index + 3] = 255;
      const distance = Math.hypot(x - center, y - center);
      const onRing = Math.abs(distance - radius) <= ring;
      const left = Math.hypot(x - center + size * 0.07, y - center) <= dot;
      const right = Math.hypot(x - center - size * 0.07, y - center) <= dot;
      if (onRing || left || right) {
        png.data[index] = 214;
        png.data[index + 1] = 180;
        png.data[index + 2] = 138;
      }
    }
  }
  return PNG.sync.write(png);
}

function write(name, size) {
  const file = resolve(directory, name);
  const bytes = draw(size);
  return import("node:fs").then((fs) => fs.writeFileSync(file, bytes));
}

await write("icon-192.png", 192);
await write("icon-512.png", 512);
