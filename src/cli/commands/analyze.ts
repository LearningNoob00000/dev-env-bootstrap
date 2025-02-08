// src/cli/commands/analyze.ts
import { Command } from 'commander';
import { EnvAnalyzer } from '../../analyzers/env-analyzer';
import { FrameworkDetector } from '../../analyzers/framework-detector';
import { DependencyChecker } from '../../analyzers/dependency-checker';

export const createAnalyzeCommand = (): Command => {
  return new Command('analyze')
    .description('Analyze project dependencies and configuration')
    .argument('[dir]', 'Project directory', '.')
    .option('--env', 'Analyze environment files')
    .option('--deps', 'Check dependencies')
    .option('--framework', 'Detect frameworks')
    .action(async (dir, options) => {
      try {
        if (options.env) {
          const envAnalyzer = new EnvAnalyzer();
          const envAnalysis = await envAnalyzer.analyze(dir);
          console.log('Environment Analysis:', envAnalysis);
        }

        if (options.deps) {
          const depChecker = new DependencyChecker();
          const outdated = await depChecker.check(dir);
          console.log('Outdated Dependencies:', outdated);
        }

        if (options.framework) {
          const frameworkDetector = new FrameworkDetector();
          const frameworks = await frameworkDetector.detect(dir);
          console.log('Detected Frameworks:', frameworks);
        }
      } catch (error) {
        console.error('Analysis failed:', error.message);
        process.exit(1);
      }
    });
};
