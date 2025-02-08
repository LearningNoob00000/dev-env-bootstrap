// src/cli/commands/scan.ts
import { Command } from 'commander';
import { ProjectScanner } from '../../analyzers/project-scanner';
import { ProgressIndicator } from '../../utils/progress';

export const createScanCommand = (): Command => {
  return new Command('scan')
    .description('Scan project directory for Express.js setup')
    .argument('[dir]', 'Project directory', '.')
    .action(async (dir) => {
      const progress = new ProgressIndicator();
      const scanner = new ProjectScanner();

      try {
        progress.start('Scanning project directory...');
        const result = await scanner.scan(dir);
        progress.succeed('Scan complete');

        if (result.projectType === 'express') {
          console.log('\n✅ Express.js project detected');
          console.log('\nDependencies:');
          Object.entries(result.dependencies.dependencies).forEach(([name, version]) => {
            console.log(`- ${name}: ${version}`);
          });
        } else {
          console.log('\n❌ Not an Express.js project');
        }
      } catch (error) {
        progress.fail(error instanceof Error ? error.message : 'Scan failed');
        process.exit(1);
      }
    });
};
