// tests/cli/commands/analyze.test.ts
import { createAnalyzeCommand } from '../../../src/cli/commands/analyze';
import { ProjectScanner } from '../../../src/analyzers/project-scanner';
import { ProgressIndicator } from '../../../src/cli/utils/progress';

// Mock dependencies
jest.mock('../../../src/analyzers/project-scanner');
jest.mock('../../../src/cli/utils/progress', () => {
  return {
    ProgressIndicator: jest.fn().mockImplementation(() => ({
      start: jest.fn(),
      succeed: jest.fn(),
      fail: jest.fn()
    }))
  };
});

describe('Analyze Command', () => {
  let mockScanner: jest.Mocked<ProjectScanner>;
  let mockProgress: jest.Mocked<ProgressIndicator>;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup mocks
    mockScanner = new ProjectScanner() as jest.Mocked<ProjectScanner>;
    mockProgress = new ProgressIndicator() as jest.Mocked<ProgressIndicator>;

    // Spy on console.log
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    // Mock implementations
    (ProjectScanner as jest.Mock).mockImplementation(() => mockScanner);
    (ProgressIndicator as unknown as jest.Mock).mockImplementation(() => mockProgress);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should analyze project successfully', async () => {
    const mockResult = {
      projectType: 'express' as const,
      hasPackageJson: true,
      dependencies: {
        dependencies: { 'express': '^4.17.1' },
        devDependencies: {}
      },
      projectRoot: '/test'
    };

    mockScanner.scan.mockResolvedValue(mockResult);

    const command = createAnalyzeCommand();
    await command.parseAsync(['node', 'test', '.']);

    expect(mockProgress.start).toHaveBeenCalledWith('Analyzing project...');
    expect(mockProgress.succeed).toHaveBeenCalledWith('Analysis complete');
    expect(consoleLogSpy).toHaveBeenCalled();
  });

  it('should handle analysis errors', async () => {
    const mockError = new Error('Analysis failed');
    mockScanner.scan.mockRejectedValue(mockError);

    const command = createAnalyzeCommand();

    // Mock process.exit to prevent test from actually exiting
    const mockExit = jest.spyOn(process, 'exit').mockImplementation((number) => {
      throw new Error('process.exit: ' + number);
    });

    await expect(command.parseAsync(['node', 'test', '.']))
      .rejects
      .toThrow('process.exit: 1');

    expect(mockProgress.fail).toHaveBeenCalledWith('Analysis failed');
    mockExit.mockRestore();
  });

  it('should output JSON when --json flag is used', async () => {
    const mockResult = {
      projectType: 'express' as const,
      hasPackageJson: true,
      dependencies: {
        dependencies: { 'express': '^4.17.1' },
        devDependencies: {}
      },
      projectRoot: '/test'
    };

    mockScanner.scan.mockResolvedValue(mockResult);

    const command = createAnalyzeCommand();
    await command.parseAsync(['node', 'test', '.', '--json']);

    expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify(mockResult, null, 2));
  });
});
