// src/cli/commands/analyze.ts
import { Command } from 'commander';
import { ProjectScanner } from '../../analyzers/project-scanner';
import { ProgressIndicator } from '../../utils/progress';

export const createAnalyzeCommand = (): Command => {
  return new Command('analyze')
    .description('Analyze project structure and dependencies')
    .argument('[dir]', 'Project directory', '.')
    .option('--json', 'Output results as JSON')
    .action(async (dir, options) => {
      const progress = new ProgressIndicator();
      const scanner = new ProjectScanner();

      try {
        progress.start('Analyzing project...');
        const result = await scanner.scan(dir);
        progress.succeed('Analysis complete');

        if (options.json) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log('\nProject Analysis:');
          console.log('-----------------');
          console.log(`Project Type: ${result.projectType}`);
          console.log(`Dependencies: ${Object.keys(result.dependencies.dependencies).length}`);
          console.log(`Dev Dependencies: ${Object.keys(result.dependencies.devDependencies).length}`);
          console.log(`Project Root: ${result.projectRoot}`);
        }
      } catch (error) {
        progress.fail(error instanceof Error ? error.message : 'Analysis failed');
        process.exit(1);
      }
    });
};
