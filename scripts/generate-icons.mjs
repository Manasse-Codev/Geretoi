import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

const source = 'src/assets/brand/source/dayflow-icon-source.png';
const output = 'public/icons';
const brand = 'src/assets/brand';
const lightBg = '#E9EAF0';

function parseHex(hex) {
  return [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16));
}

function isBackground(r, g, b) {
  return r > 246 && g > 246 && b > 246;
}

async function removeConnectedWhite() {
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;
  const enqueue = (index) => {
    if (visited[index]) return;
    const offset = index * channels;
    if (!isBackground(data[offset], data[offset + 1], data[offset + 2])) return;
    visited[index] = 1;
    queue[tail++] = index;
  };
  for (let x = 0; x < width; x += 1) { enqueue(x); enqueue((height - 1) * width + x); }
  for (let y = 0; y < height; y += 1) { enqueue(y * width); enqueue(y * width + width - 1); }
  while (head < tail) {
    const index = queue[head++];
    const x = index % width;
    const y = Math.floor(index / width);
    if (x > 0) enqueue(index - 1);
    if (x + 1 < width) enqueue(index + 1);
    if (y > 0) enqueue(index - width);
    if (y + 1 < height) enqueue(index + width);
  }
  for (let index = 0; index < visited.length; index += 1) if (visited[index]) data[index * channels + 3] = 0;
  const base = await sharp(data, { raw: info }).png().trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 }).png().toBuffer();
  return base;
}

async function recolorForDark(base) {
  const { data, info } = await sharp(base).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const background = parseHex('#25262E');
  const linear = (value) => { const channel = value / 255; return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4; };
  const luminance = (rgb) => 0.2126 * linear(rgb[0]) + 0.7152 * linear(rgb[1]) + 0.0722 * linear(rgb[2]);
  const bgLuminance = luminance(background);
  const minLuminance = (1.05 / 3) - 0.05 + bgLuminance;
  for (let offset = 0; offset < data.length; offset += info.channels) {
    if (data[offset + 3] === 0) continue;
    const rgb = [data[offset], data[offset + 1], data[offset + 2]];
    if (luminance(rgb) < minLuminance) {
      let low = 0;
      let high = 1;
      for (let step = 0; step < 16; step += 1) {
        const amount = (low + high) / 2;
        const candidate = rgb.map((channel) => channel + (255 - channel) * amount);
        if (luminance(candidate) >= minLuminance) high = amount;
        else low = amount;
      }
      for (let channel = 0; channel < 3; channel += 1) data[offset + channel] = Math.round(rgb[channel] + (255 - rgb[channel]) * high);
    }
  }
  return sharp(data, { raw: info }).png().toBuffer();
}

async function paddedIcon(logo, size, background, scale, opaque = true) {
  const innerSize = Math.round(size * scale);
  const resized = await sharp(logo).resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const [r = 0, g = 0, b = 0] = background ? parseHex(background) : [];
  return sharp({ create: { width: size, height: size, channels: 4, background: { r, g, b, alpha: opaque ? 1 : 0 } } })
    .composite([{ input: resized, gravity: 'center' }]).png().toBuffer();
}

await mkdir(output, { recursive: true });
await mkdir(`${brand}/variants`, { recursive: true });
const trimmed = await removeConnectedWhite();
const dark = await recolorForDark(trimmed);
const lightVariant = await sharp(trimmed).resize(512, 512, { fit: 'inside' }).png({ palette: true, quality: 100, effort: 10 }).toBuffer();
const darkVariant = await sharp(dark).resize(512, 512, { fit: 'inside' }).png({ palette: true, quality: 100, effort: 10 }).toBuffer();
await writeFile(`${brand}/variants/symbol-light.png`, lightVariant);
await writeFile(`${brand}/variants/symbol-dark.png`, darkVariant);

const icon192 = await paddedIcon(trimmed, 192, lightBg, 0.82);
const icon512 = await paddedIcon(trimmed, 512, lightBg, 0.82);
const maskable = await paddedIcon(trimmed, 512, lightBg, 0.78);
const apple = await paddedIcon(trimmed, 180, lightBg, 0.82);
await writeFile(`${output}/icon-192.png`, icon192);
await writeFile(`${output}/icon-512.png`, icon512);
await writeFile(`${output}/icon-maskable-512.png`, maskable);
await writeFile(`${output}/apple-touch-icon.png`, apple);
const faviconPng = await sharp(icon192).resize(64, 64).png().toBuffer();
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><image width="64" height="64" href="data:image/png;base64,${faviconPng.toString('base64')}"/></svg>`;
await writeFile(`${output}/favicon.svg`, faviconSvg);
