import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(process.cwd());
const backendDir = path.join(root, 'node-backend');
const frontendDir = path.join(root, 'frontend');

const useWatch = process.argv.includes('--watch');

function spawnCmd(cmd, args, cwd) {
  return spawn(cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });
}

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const backendArgs = ['run', useWatch ? 'dev' : 'start'];
const frontendArgs = ['run', useWatch ? 'dev' : 'start'];

console.log('Starting local dev (backend + frontend)');
console.log(`Backend: ${backendDir} (${backendArgs.join(' ')})`);
console.log(`Frontend: ${frontendDir} (${frontendArgs.join(' ')})`);

const backend = spawnCmd(npmCmd, backendArgs, backendDir);
const frontend = spawnCmd(npmCmd, frontendArgs, frontendDir);

function shutdown(code = 0) {
  try {
    backend.kill('SIGINT');
  } catch {}
  try {
    frontend.kill('SIGINT');
  } catch {}
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

backend.on('exit', (code) => {
  console.log(`Backend exited with code ${code}`);
  shutdown(code ?? 0);
});

frontend.on('exit', (code) => {
  console.log(`Frontend exited with code ${code}`);
  shutdown(code ?? 0);
});

