import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const envPath = resolve(projectRoot, '.env');
const outputPath = resolve(projectRoot, 'src/lib/server/database.types.ts');

const readEnvValue = (name) => {
  const pattern = new RegExp(`^\\s*(?:export\\s+)?${name}\\s*=\\s*(.*)\\s*$`, 'm');
  const value = readFileSync(envPath, 'utf8').match(pattern)?.[1]?.trim();

  if (!value) {
    throw new Error(`${name} is missing from .env.`);
  }

  return value.replace(/^['"]|['"]$/g, '');
};

const getProjectRef = () => {
  const supabaseUrl = new URL(readEnvValue('PUBLIC_SUPABASE_URL'));
  const [projectRef] = supabaseUrl.hostname.split('.');

  if (!projectRef || !supabaseUrl.hostname.endsWith('.supabase.co')) {
    throw new Error('PUBLIC_SUPABASE_URL must look like https://<project-ref>.supabase.co.');
  }

  return projectRef;
};

if (!process.env.npm_execpath) {
  throw new Error('Run this script through npm run db:types.');
}

const result = spawnSync(
  process.execPath,
  [
    process.env.npm_execpath,
    'exec',
    '--',
    'supabase',
    'gen',
    'types',
    'typescript',
    '--project-id',
    getProjectRef(),
    '--schema',
    'public'
  ],
  {
    cwd: projectRoot,
    encoding: 'utf8'
  }
);

if (result.status !== 0) {
  process.stderr.write(result.stderr || result.stdout);
  process.exit(result.status ?? 1);
}

writeFileSync(outputPath, result.stdout, 'utf8');
console.log(`Wrote ${outputPath}`);
