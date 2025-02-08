// tests/analyzers/project-scanner.test.ts
import { ProjectScanner } from '../../src/analyzers/project-scanner';
import { promises as fs } from 'fs';
import path from 'path';

jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    readFile: jest.fn(),
  },
}));

describe('ProjectScanner', () => {
  let scanner: ProjectScanner;

  beforeEach(() => {
    scanner = new ProjectScanner();
    jest.clearAllMocks();
  });

  it('should detect Node.js project when package.json exists', async () => {
    const mockPackageJson = {
      dependencies: { express: '^4.17.1' },
      devDependencies: { typescript: '^4.5.4' },
    };

    (fs.access as jest.Mock).mockResolvedValue(undefined);
    (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockPackageJson));

    const result = await scanner.scan('/fake/path');

    expect(result.projectType).toBe('nodejs');
    expect(result.hasPackageJson).toBe(true);
    expect(result.dependencies.dependencies).toEqual(mockPackageJson.dependencies);
  });

  it('should return unknown project type when no package.json found', async () => {
    (fs.access as jest.Mock).mockRejectedValue(new Error('Not found'));

    const result = await scanner.scan('/fake/path');

    expect(result.projectType).toBe('unknown');
    expect(result.hasPackageJson).toBe(false);
  });
});
