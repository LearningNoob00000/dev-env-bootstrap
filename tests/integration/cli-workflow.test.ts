
// tests/integration/cli-workflow.test.ts
import { createExpressCommands } from '../../src/cli/commands/express-commands';
import { ExpressAnalyzer } from '../../src/analyzers/express-analyzer';
import { ExpressDockerGenerator } from '../../src/generators/express-docker-generator';
import { ConfigManager } from '../../src/cli/utils/config-manager';
import { promises as fs } from 'fs';
import path from 'path';

jest.mock('../../src/analyzers/express-analyzer');
jest.mock('../../src/generators/express-docker-generator');
jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn(),
    readFile: jest.fn(),
    access: jest.fn()
  }
}));

describe('CLI Workflow Integration', () => {
  let mockAnalyzer: jest.Mocked<ExpressAnalyzer>;
  let mockGenerator: jest.Mocked<ExpressDockerGenerator>;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockAnalyzer = new ExpressAnalyzer() as jest.Mocked<ExpressAnalyzer>;
    mockGenerator = new ExpressDockerGenerator() as jest.Mocked<ExpressDockerGenerator>;

    (ExpressAnalyzer as jest.Mock).mockImplementation(() => mockAnalyzer);
    (ExpressDockerGenerator as jest.Mock).mockImplementation(() => mockGenerator);

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should handle complete CLI workflow with configuration', async () => {
    const mockProjectInfo = {
      hasExpress: true,
      version: '4.17.1',
      mainFile: 'index.js',
      port: 3000,
      middleware: ['body-parser'],
      hasTypeScript: true
    };

    mockAnalyzer.analyze.mockResolvedValue(mockProjectInfo);
    mockGenerator.generate.mockReturnValue('mock dockerfile content');
    mockGenerator.generateCompose.mockReturnValue('mock compose content');

    const [_, generateCommand] = createExpressCommands();

    await generateCommand.parseAsync([
      'node', 'test', '.',
      '--dev',
      '--port', '3000',
      '--node-version', '18-alpine'
    ]);

    // Verify configuration was used correctly
    expect(mockGenerator.generate).toHaveBeenCalledWith(
      mockProjectInfo,
      expect.objectContaining({
        mode: 'development',
        port: 3000,
        nodeVersion: '18-alpine'
      })
    );

    // Verify files were written
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('Dockerfile'),
      'mock dockerfile content'
    );
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('docker-compose.yml'),
      'mock compose content'
    );
  });

  it('should handle configuration validation errors', async () => {
    const [_, generateCommand] = createExpressCommands();

    await expect(generateCommand.parseAsync([
      'node', 'test', '.',
      '--port', '-1' // Invalid port
    ])).rejects.toThrow();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Invalid port number')
    );
  });
});
