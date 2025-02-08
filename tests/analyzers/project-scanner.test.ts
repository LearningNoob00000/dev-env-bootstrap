// tests/analyzers/project-scanner.test.ts
import { ProjectScanner } from '../../src/analyzers/project-scanner';
import { FileSystemUtils } from '../../src/utils/file-system';

jest.mock('../../src/utils/file-system');

describe('ProjectScanner', () => {
  let scanner: ProjectScanner;
  let mockFileSystem: jest.Mocked<FileSystemUtils>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create fresh instances
    mockFileSystem = new FileSystemUtils() as jest.Mocked<FileSystemUtils>;

    // Mock FileSystemUtils constructor
    (FileSystemUtils as jest.Mock).mockImplementation(() => mockFileSystem);

    scanner = new ProjectScanner();
  });

  describe('scan', () => {
    it('should detect Express.js project', async () => {
      const mockPackageJson = {
        dependencies: {
          'express': '^4.17.1'
        }
      };

      // Mock fileExists to return true for package.json
      mockFileSystem.fileExists.mockResolvedValue(true);

      // Mock readFile to return our mock package.json
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockPackageJson));

      const result = await scanner.scan('/fake/path');

      // Verify the correct file was checked
      expect(mockFileSystem.fileExists).toHaveBeenCalledWith(
        expect.stringContaining('package.json')
      );

      // Verify file was read
      expect(mockFileSystem.readFile).toHaveBeenCalled();

      // Verify results
      expect(result.projectType).toBe('express');
      expect(result.hasPackageJson).toBe(true);
      expect(result.dependencies.dependencies).toHaveProperty('express');
    });

    it('should handle missing package.json', async () => {
      // Mock fileExists to return false
      mockFileSystem.fileExists.mockResolvedValue(false);

      const result = await scanner.scan('/fake/path');

      expect(result.projectType).toBe('unknown');
      expect(result.hasPackageJson).toBe(false);
      expect(result.dependencies.dependencies).toEqual({});
    });

    it('should handle invalid package.json', async () => {
      // Mock fileExists to return true
      mockFileSystem.fileExists.mockResolvedValue(true);

      // Mock readFile to return invalid JSON
      mockFileSystem.readFile.mockResolvedValue('invalid json');

      // Should throw error for invalid JSON
      await expect(scanner.scan('/fake/path')).rejects.toThrow('Failed to parse package.json');
    });

    it('should handle file system errors', async () => {
      // Mock fileExists to throw error
      mockFileSystem.fileExists.mockRejectedValue(new Error('File system error'));

      await expect(scanner.scan('/fake/path')).rejects.toThrow('File system error');
    });
  });
});
