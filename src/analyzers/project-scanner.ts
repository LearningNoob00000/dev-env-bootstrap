// src/analyzers/project-scanner.ts
import { promises as fs } from 'fs';
import path from 'path';

interface ScanResult {
  projectType: 'nodejs' | 'unknown';
  dependencies: DependencyInfo;
  hasPackageJson: boolean;
  projectRoot: string;
}

interface DependencyInfo {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export class ProjectScanner {
  /**
   * Scans a directory to detect project type and configuration
   * @param projectPath - Path to the project root directory
   * @returns ScanResult with project information
   */
  public async scan(projectPath: string): Promise<ScanResult> {
    const absolutePath = path.resolve(projectPath);
    const hasPackageJson = await this.checkFileExists(
      path.join(absolutePath, 'package.json')
    );

    if (!hasPackageJson) {
      return {
        projectType: 'unknown',
        dependencies: { dependencies: {}, devDependencies: {} },
        hasPackageJson: false,
        projectRoot: absolutePath,
      };
    }

    const packageJson = await this.readPackageJson(absolutePath);
    return {
      projectType: 'nodejs',
      dependencies: {
        dependencies: packageJson.dependencies || {},
        devDependencies: packageJson.devDependencies || {},
      },
      hasPackageJson: true,
      projectRoot: absolutePath,
    };
  }

  private async checkFileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async readPackageJson(projectPath: string): Promise<any> {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const content = await fs.readFile(packageJsonPath, 'utf-8');
    return JSON.parse(content);
  }
}
