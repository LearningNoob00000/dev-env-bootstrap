// src/utils/file-system.ts
import { promises as fs } from 'fs';
import path from 'path';

export class FileSystemUtils {
  /**
   * Recursively walks through directory to find specific file types
   * @param dir - Directory to start from
   * @param patterns - File patterns to match (e.g., ['package.json', '*.env'])
   */
  public async findFiles(dir: string, patterns: string[]): Promise<string[]> {
    const results: string[] = [];

    async function walk(currentDir: string): Promise<void> {
      const files = await fs.readdir(currentDir, { withFileTypes: true });

      for (const file of files) {
        const filePath = path.join(currentDir, file.name);

        if (file.isDirectory()) {
          await walk(filePath);
        } else if (patterns.some(pattern =>
          pattern.includes('*')
            ? file.name.endsWith(pattern.replace('*', ''))
            : file.name === pattern
        )) {
          results.push(filePath);
        }
      }
    }

    await walk(dir);
    return results;
  }
}
