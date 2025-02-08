// src/cli/index.ts
import { Command } from 'commander';
import { createScanCommand } from './commands/scan';
import { createAnalyzeCommand } from './commands/analyze';

export const createCLI = (): Command => {
  const program = new Command()
    .name('dev-env-bootstrap')
    .description('Development environment bootstrapping tool')
    .version('0.1.0');

  program
    .addCommand(createScanCommand())
    .addCommand(createAnalyzeCommand());

  return program;
};
