// src/generators/express-docker-generator.ts
import { ExpressProjectInfo } from '../analyzers/express-analyzer';

export interface DockerConfig {
  nodeVersion: string;
  port: number;
  hasTypeScript: boolean;
  isDevelopment: boolean;
}

export class ExpressDockerGenerator {
  /**
   * Generates Dockerfile content for Express.js projects
   * @param projectInfo - Analysis results from ExpressAnalyzer
   * @param config - Docker configuration options
   * @returns Dockerfile content as string
   */
  public generate(projectInfo: ExpressProjectInfo, config: Partial<DockerConfig> = {}): string {
    const finalConfig: DockerConfig = {
      nodeVersion: config.nodeVersion || '18-alpine',
      port: config.port || projectInfo.port || 3000,
      hasTypeScript: config.hasTypeScript ?? projectInfo.hasTypeScript,
      isDevelopment: config.isDevelopment || false
    };

    const dockerCommands = [
      `FROM node:${finalConfig.nodeVersion}`,
      'WORKDIR /app',
      '',
      '# Install dependencies',
      'COPY package*.json ./',
      'RUN npm install',
      '',
      '# Copy source code',
      'COPY . .',
      ''
    ];

    // Add TypeScript build step if needed
    if (finalConfig.hasTypeScript) {
      dockerCommands.push(
        '# Build TypeScript',
        'RUN npm run build',
        ''
      );
    }

    // Add development-specific commands
    if (finalConfig.isDevelopment) {
      dockerCommands.push(
        '# Development setup',
        'RUN npm install --only=development',
        `ENV PORT=${finalConfig.port}`,
        `EXPOSE ${finalConfig.port}`,
        'CMD ["npm", "run", "dev"]'
      );
    } else {
      // Production setup
      dockerCommands.push(
        '# Production setup',
        `ENV PORT=${finalConfig.port}`,
        `EXPOSE ${finalConfig.port}`,
        'CMD ["npm", "start"]'
      );
    }

    return dockerCommands.join('\n');
  }

  /**
   * Generates docker-compose.yml content
   * @param projectInfo - Analysis results from ExpressAnalyzer
   * @param config - Docker configuration options
   * @returns docker-compose.yml content as string
   */
  public generateCompose(projectInfo: ExpressProjectInfo, config: Partial<DockerConfig> = {}): string {
    const port = config.port || projectInfo.port || 3000;

    return `
version: '3.8'

services:
  app:
    build: .
    ports:
      - "${port}:${port}"
    environment:
      - PORT=${port}
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run ${config.isDevelopment ? 'dev' : 'start'}
`.trim();
  }
}
