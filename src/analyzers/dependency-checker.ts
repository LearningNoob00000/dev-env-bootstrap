// src/analyzers/dependency-checker.ts
import { promises as fs } from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export interface DependencyCheck {
  name: string;
  currentVersion: string;
  latestVersion: string;
  isOutdated: boolean;
}

export class DependencyChecker {
  /**
   * Checks for outdated dependencies
   * @param projectPath - Path to project root
   * @returns Analysis of dependency versions
   */
  public async check(projectPath: string): Promise<DependencyCheck[]> {
    try {
      const { stdout } = await execFileAsync('npm', ['outdated', '--json'], {
        cwd: projectPath
      });

      const outdated = JSON.parse(stdout);
      return Object.entries(outdated).map(([name, info]: [string, any]) => ({
        name,
        currentVersion: info.current,
        latestVersion: info.latest,
        isOutdated: true
      }));
    } catch (error) {
      if (error.stdout) {
        // npm outdated exits with code 1 if there are outdated packages
        return JSON.parse(error.stdout);
      }
      return [];
    }
  }
}
