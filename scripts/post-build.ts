import * as fsPromises from 'fs/promises';
import { PathLike } from 'fs';
import * as nodePath from 'path';

async function postBuild(): Promise<void> {
  // Only run chmod on Unix-like systems
  if (process.platform === 'win32') {
    console.log('Skipping chmod on Windows');
    return;
  }

  const binDir = nodePath.join(__dirname, '../dist/bin');

  try {
    const files = await fsPromises.readdir(binDir);

    for (const file of files) {
      if (file.includes('-linux') || file.includes('-macos')) {
        const filePath = nodePath.join(binDir, file);
        await fsPromises.chmod(filePath, 0o755);
        console.log(`Made ${file} executable`);
      }
    }
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      console.log('Binary directory not found, skipping post-build steps');
      return;
    }
    throw error;
  }
}

postBuild().catch((error: unknown) => {
  console.error('Post-build script failed:', error instanceof Error ? error.message : 'Unknown error');
  process.exit(1);
});
