import { readFile, stat } from 'node:fs/promises';
import process from 'node:process';
import sharp from 'sharp';

const manifestPath = 'dist/manifest.webmanifest';
const html = await readFile('dist/index.html', 'utf8');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const serviceWorker = await readFile('dist/sw.js', 'utf8').catch(() => '');
const errors = [];

if ((html.match(/rel="manifest"/g) ?? []).length !== 1) errors.push('Le document doit référencer un seul manifeste.');
if (!manifest.name || !manifest.short_name || !manifest.start_url) errors.push('Le nom et le point d’entrée sont requis.');
if (!['standalone', 'fullscreen', 'minimal-ui'].includes(manifest.display)) errors.push('Le mode d’affichage installable est absent.');
if (!serviceWorker) errors.push('Le service worker de production est absent.');
if (!serviceWorker.includes('NavigationRoute') || !serviceWorker.includes('/index.html')) {
  errors.push('Le repli de navigation hors ligne vers /index.html est absent du service worker.');
}
for (const path of ['dist/_redirects', 'dist/_headers']) {
  if (!(await stat(path).catch(() => null))) errors.push(`Le fichier de configuration Pages ${path.slice(5)} est absent de la sortie.`);
}

for (const size of [192, 512]) {
  const icon = manifest.icons?.find((entry) => entry.sizes === `${size}x${size}` && entry.type === 'image/png' && (entry.purpose ?? 'any').split(' ').includes('any'));
  if (!icon) { errors.push(`L’icône standard ${size} × ${size} est absente du manifeste.`); continue; }
  const path = `dist${icon.src}`;
  const metadata = await sharp(path).metadata().catch(() => null);
  if (metadata?.width !== size || metadata?.height !== size) errors.push(`L’icône ${icon.src} ne fait pas ${size} × ${size}.`);
}

const maskable = manifest.icons?.find((entry) => (entry.purpose ?? '').split(' ').includes('maskable'));
if (!maskable || !await stat(`dist${maskable.src}`).catch(() => null)) errors.push('L’icône adaptative est absente.');

if (errors.length) {
  process.stderr.write('Contrôle PWA échoué :\n');
  for (const error of errors) process.stderr.write(`- ${error}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write('Contrôle PWA réussi : manifeste, icônes standard, icône adaptative et service worker présents.\n');
}
