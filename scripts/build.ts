// scripts/build.ts
import { join } from 'path';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function buildBinaries() {
  const pkg = await fs.readFile('package.json', 'utf-8');
  const { version } = JSON.parse(pkg);
  const outDir = join(__dirname, '../dist/bin');

  // Ensure output directory exists
  await fs.mkdir(outDir, { recursive: true });

  const targets = [
    'node18-linux-x64',
    'node18-macos-x64',
    'node18-win-x64',
    'node18-linux-arm64',
    'node18-macos-arm64'
  ];

  const config = {
    targets,
    outDir,
    entry: join(__dirname, '../dist/cli/index.js'),
    name: `deb-v${version}`
  };

  try {
    console.log('Building binaries...');
    const targetString = targets.join(',');
    const command = `pkg ${config.entry} --targets ${targetString} --output ${join(config.outDir, config.name)}`;

    const { stdout, stderr } = await execAsync(command);

    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);

    console.log('Build complete!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildBinaries().catch(console.error);
