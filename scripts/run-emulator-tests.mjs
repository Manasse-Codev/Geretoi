import { spawnSync } from 'node:child_process';
import { createConnection } from 'node:net';
import process from 'node:process';

const suite = process.argv[2];
if (suite !== 'rules' && suite !== 'integration') {
  throw new Error('Usage: node scripts/run-emulator-tests.mjs <rules|integration>');
}

function portIsOpen(port) {
  return new Promise((resolve) => {
    const socket = createConnection({ host: '127.0.0.1', port });
    const finish = (isOpen) => { socket.destroy(); resolve(isOpen); };
    socket.setTimeout(700, () => finish(false));
    socket.once('connect', () => finish(true));
    socket.once('error', () => finish(false));
  });
}

const ports = suite === 'rules' ? [18080] : [9099, 18080];
const emulatorsAreRunning = (await Promise.all(ports.map(portIsOpen))).every(Boolean);
const env = { ...process.env, ...(suite === 'integration' ? { VITE_USE_EMULATORS: 'true' } : {}) };

if (emulatorsAreRunning) {
  const args = suite === 'rules'
    ? ['node_modules/vitest/vitest.mjs', 'run', '--config', 'vitest.rules.config.ts']
    : ['node_modules/vitest/vitest.mjs', 'run', '--config', 'vitest.integration.config.ts', '--pool=forks', '--maxWorkers=1', '--no-file-parallelism'];
  const result = spawnSync(process.execPath, args, { stdio: 'inherit', env });
  process.exit(result.status ?? 1);
}

const emulatorList = suite === 'rules' ? 'firestore' : 'auth,firestore';
const testCommand = suite === 'rules'
  ? 'npm run test:rules:unit'
  : 'VITE_USE_EMULATORS=true npm exec -- vitest run --config vitest.integration.config.ts --pool=forks --maxWorkers=1 --no-file-parallelism';
const result = spawnSync('firebase', ['emulators:exec', '--only', emulatorList, testCommand], { stdio: 'inherit', env, shell: process.platform === 'win32' });
process.exit(result.status ?? 1);
