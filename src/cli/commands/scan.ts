// src/cli/commands/scan.ts
import { Command } from 'commander';
import { ProjectScanner } from '../../analyzers/project-scanner';

export const createScanCommand = (): Command => {
  return new Command('scan')
    .description('Scan project directory')
    .argument('[dir]', 'Project directory', '.')
    .action(async (dir) => {
      const scanner = new ProjectScanner();
      const result = await scanner.scan(dir);
      console.log('Scan results:', result);
    });
};
