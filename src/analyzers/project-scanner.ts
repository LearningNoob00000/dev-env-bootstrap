// src/analyzers/project-scanner.ts
import { promises as fs } from 'fs';
import path from 'path';
import { FileSystemUtils } from '../utils/file-system';

export interface ProjectInfo {
  projectType: 'express' | 'unknown';
  hasPackageJson: boolean;
  dependencies: {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };
  projectRoot: string;
}

export class ProjectScanner {
  private fileSystem: FileSystemUtils;

  constructor() {
    this.fileSystem = new FileSystemUtils();
  }

  /**
   * Scans a directory to detect project type and configuration
   * @param projectPath - Path to the project root directory
   */
  public async scan(projectPath: string): Promise<ProjectInfo> {
    const absolutePath = path.resolve(projectPath);
    const hasPackageJson = await this.fileSystem.fileExists(
      path.join(absolutePath, 'package.json')
    );

    if (!hasPackageJson) {
      return {
        projectType: 'unknown',
        hasPackageJson: false,
        dependencies: { dependencies: {}, devDependencies: {} },
        projectRoot: absolutePath,
      };
    }

    const packageJson = await this.readPackageJson(absolutePath);
    const isExpress = 'express' in (packageJson.dependencies || {});

    return {
      projectType: isExpress ? 'express' : 'unknown',
      hasPackageJson: true,
      dependencies: {
        dependencies: packageJson.dependencies || {},
        devDependencies: packageJson.devDependencies || {},
      },
      projectRoot: absolutePath,
    };
  }

  private async readPackageJson(projectPath: string): Promise<any> {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const content = await this.fileSystem.readFile(packageJsonPath);
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error('Failed to parse package.json');
    }
  }
}
