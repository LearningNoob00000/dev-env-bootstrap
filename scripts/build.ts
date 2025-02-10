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

  const entry = join(__dirname, '../dist/cli/index.js');
  const output = join(outDir, `deb-v${version}`);

  try {
    console.log('Building binaries with caxa...');

    // caxa requires a different command structure
    const command = `npx caxa ${entry} --output ${output} -- ${entry}`;

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
