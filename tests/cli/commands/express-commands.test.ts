// tests/cli/commands/express-commands.test.ts
import { createExpressCommands } from '../../../src/cli/commands/express-commands';
import { ExpressAnalyzer } from '../../../src/analyzers/express-analyzer';
import { ExpressDockerGenerator } from '../../../src/generators/express-docker-generator';
import { promises as fs } from 'fs';

jest.mock('../../../src/analyzers/express-analyzer');
jest.mock('../../../src/generators/express-docker-generator');
jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn()
  }
}));

describe('Express Commands', () => {
  let mockAnalyzer: jest.Mocked<ExpressAnalyzer>;
  let mockGenerator: jest.Mocked<ExpressDockerGenerator>;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAnalyzer = new ExpressAnalyzer() as jest.Mocked<ExpressAnalyzer>;
    mockGenerator = new ExpressDockerGenerator() as jest.Mocked<ExpressDockerGenerator>;

    (ExpressAnalyzer as jest.Mock).mockImplementation(() => mockAnalyzer);
    (ExpressDockerGenerator as jest.Mock).mockImplementation(() => mockGenerator);

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('analyze command', () => {
    it('should analyze Express.js project successfully', async () => {
      const mockResult = {
        hasExpress: true,
        version: '4.17.1',
        mainFile: 'index.js',
        port: 3000,
        middleware: ['body-parser', 'cors'],
        hasTypeScript: true
      };

      mockAnalyzer.analyze.mockResolvedValue(mockResult);

      const [analyzeCommand] = createExpressCommands();
      await analyzeCommand.parseAsync(['node', 'test', '.']);

      expect(mockAnalyzer.analyze).toHaveBeenCalledWith('.');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Express.js Project Analysis'));
    });

    it('should output JSON when --json flag is used', async () => {
      const mockResult = {
        hasExpress: true,
        version: '4.17.1',
        mainFile: 'index.js',
        port: 3000,
        middleware: [],
        hasTypeScript: false
      };

      mockAnalyzer.analyze.mockResolvedValue(mockResult);

      const [analyzeCommand] = createExpressCommands();
      await analyzeCommand.parseAsync(['node', 'test', '.', '--json']);

      expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify(mockResult, null, 2));
    });
  });

  describe('generate command', () => {
    it('should generate Docker configuration successfully', async () => {
      const mockAnalyzerResult = {
        hasExpress: true,
        version: '4.17.1',
        mainFile: 'index.js',
        port: 3000,
        middleware: [],
        hasTypeScript: false
      };

      mockAnalyzer.analyze.mockResolvedValue(mockAnalyzerResult);
      mockGenerator.generate.mockReturnValue('Dockerfile content');
      mockGenerator.generateCompose.mockReturnValue('docker-compose content');

      const [_, generateCommand] = createExpressCommands();
      await generateCommand.parseAsync(['node', 'test', '.']);

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('Dockerfile'),
        'Dockerfile content'
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('docker-compose.yml'),
        'docker-compose content'
      );
    });

    it('should handle generation errors', async () => {
      const mockError = new Error('Generation failed');
      mockAnalyzer.analyze.mockRejectedValue(mockError);

      const mockExit = jest.spyOn(process, 'exit').mockImplementation((number) => {
        throw new Error('process.exit: ' + number);
      });

      const [_, generateCommand] = createExpressCommands();
      await expect(generateCommand.parseAsync(['node', 'test', '.']))
        .rejects
        .toThrow('process.exit: 1');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Generation failed:',
        'Generation failed'
      );

      mockExit.mockRestore();
    });
  });
});
