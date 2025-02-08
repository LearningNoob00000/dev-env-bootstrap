// src/cli/commands/express-commands.ts
import { Command } from 'commander';
import { ExpressAnalyzer } from '../../analyzers/express-analyzer';
import { ExpressDockerGenerator } from '../../generators/express-docker-generator';
import { promises as fs } from 'fs';
import path from 'path';

export function createExpressCommands(): Command[] {
  const analyzer = new ExpressAnalyzer();
  const generator = new ExpressDockerGenerator();

  const analyzeCommand = new Command('analyze')
    .description('Analyze Express.js project')
    .argument('[dir]', 'Project directory', '.')
    .option('--json', 'Output as JSON')
    .action(async (dir, options) => {
      try {
        const result = await analyzer.analyze(dir);

        if (options.json) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log('\nExpress.js Project Analysis:');
          console.log('---------------------------');
          console.log(`Express Version: ${result.version || 'Not detected'}`);
          console.log(`Main File: ${result.mainFile}`);
          console.log(`Port: ${result.port || 'Not detected'}`);
          console.log(`TypeScript: ${result.hasTypeScript ? 'Yes' : 'No'}`);
          console.log('Middleware:', result.middleware.length ? result.middleware.join(', ') : 'None detected');
        }
      } catch (error) {
        console.error('Analysis failed:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  const generateCommand = new Command('generate')
    .description('Generate Docker configuration')
    .argument('[dir]', 'Project directory', '.')
    .option('-d, --dev', 'Generate development configuration')
    .option('-p, --port <number>', 'Override port number')
    .option('--node-version <version>', 'Specify Node.js version')
    .action(async (dir, options) => {
      try {
        // Analyze project first
        const projectInfo = await analyzer.analyze(dir);

        // Generate configurations
        const dockerConfig = {
          nodeVersion: options.nodeVersion,
          port: options.port ? parseInt(options.port, 10) : undefined,
          isDevelopment: options.dev
        };

        const dockerfile = generator.generate(projectInfo, dockerConfig);
        const dockerCompose = generator.generateCompose(projectInfo, dockerConfig);

        // Write files
        await fs.writeFile(path.join(dir, 'Dockerfile'), dockerfile);
        await fs.writeFile(path.join(dir, 'docker-compose.yml'), dockerCompose);

        console.log('✅ Generated Docker configuration files:');
        console.log('- Dockerfile');
        console.log('- docker-compose.yml');
      } catch (error) {
        console.error('Generation failed:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  return [analyzeCommand, generateCommand];
}
