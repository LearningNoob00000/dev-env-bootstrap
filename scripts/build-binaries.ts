import * as fsPromises from 'fs/promises';
import * as nodePath from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface BuildConfig {
  name: string;
  ext: string;
  platform: NodeJS.Platform;
}

async function buildBinaries(): Promise<void> {
  const pkg = await fsPromises.readFile('package.json', 'utf-8');
  const { version } = JSON.parse(pkg);
  const outDir = nodePath.join(__dirname, '../dist/bin');

  // Ensure output directory exists
  await fsPromises.mkdir(outDir, { recursive: true });

  const builds: BuildConfig[] = [
    { name: 'windows', ext: '.exe', platform: 'win32' },
    { name: 'macos', ext: '', platform: 'darwin' },
    { name: 'linux', ext: '', platform: 'linux' }
  ];

  try {
    console.log('Building binaries...');

    for (const build of builds) {
      if (!process.env.BUILD_ALL && process.platform !== build.platform) {
        console.log(`Skipping ${build.name} build on ${process.platform}...`);
        continue;
      }

      const outFile = `deb-v${version}-${build.name}${build.ext}`;
      const outPath = nodePath.join(outDir, outFile);

      console.log(`Building for ${build.name}...`);

      try {
        const command = `npx caxa --input "." --output "${outPath}" -- "{{caxa}}/node_modules/.bin/node" "{{caxa}}/dist/cli/index.js"`;
        const { stdout, stderr } = await execAsync(command);

        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);

        console.log(`Successfully built for ${build.name}`);
      } catch (err) {
        console.error(`Failed to build for ${build.name}:`, err);
        if (!process.env.CONTINUE_ON_ERROR) {
          throw err;
        }
      }
    }

    console.log('Build complete!');
  } catch (error) {
    console.error('Build failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

buildBinaries().catch((error: unknown) => {
  console.error('Build script failed:', error instanceof Error ? error.message : 'Unknown error');
  process.exit(1);
});
