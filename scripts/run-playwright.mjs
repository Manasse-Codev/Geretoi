import { access, readFile } from 'node:fs/promises';
import { createConnection } from 'node:net';
import { spawnSync } from 'node:child_process';
import process from 'node:process';

const firebaseConfig = JSON.parse(await readFile('.firebaserc', 'utf8'));
const projectId = firebaseConfig.projects?.default;
if (!projectId) throw new Error('Le projet de test local doit être défini dans .firebaserc.');
const enableServiceWorker = process.argv.includes('--sw-dev');

function portIsOpen(port) {
  return new Promise((resolve) => {
    const socket = createConnection({ host: '127.0.0.1', port });
    const finish = (open) => { socket.destroy(); resolve(open); };
    socket.setTimeout(800, () => finish(false));
    socket.once('connect', () => finish(true));
    socket.once('error', () => finish(false));
  });
}

const emulatorsRunning = (await Promise.all([9099, 18080].map(portIsOpen))).every(Boolean);
const env = { ...process.env, VITE_FIREBASE_PROJECT_ID: projectId, VITE_USE_EMULATORS: 'true', VITE_ENABLE_SW_DEV: enableServiceWorker ? 'true' : 'false' };
if (!env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH && await access('/usr/bin/google-chrome').then(() => true, () => false)) {
  env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH = '/usr/bin/google-chrome';
}
const command = emulatorsRunning
  ? spawnSync('npm', ['run', 'test:e2e:run'], { stdio: 'inherit', env, shell: process.platform === 'win32' })
  : spawnSync('firebase', [
    'emulators:exec', '--project', projectId, '--only', 'auth,firestore', 'npm run test:e2e:run',
  ], {
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32',
});
process.exit(command.status ?? 1);
