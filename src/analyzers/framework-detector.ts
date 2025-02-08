// src/analyzers/framework-detector.ts
import { promises as fs } from 'fs';
import path from 'path';

export interface FrameworkInfo {
  name: string;
  version: string;
  type: 'frontend' | 'backend' | 'fullstack';
}

export class FrameworkDetector {
  private frameworks = new Map<string, FrameworkInfo>([
    ['express', { name: 'Express', type: 'backend' }],
    ['@nestjs/core', { name: 'NestJS', type: 'backend' }],
    ['next', { name: 'Next.js', type: 'fullstack' }],
    ['@angular/core', { name: 'Angular', type: 'frontend' }]
  ]);

  /**
   * Detects frameworks used in the project
   * @param projectPath - Path to project root
   * @returns Detected frameworks information
   */
  public async detect(projectPath: string): Promise<FrameworkInfo[]> {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const detected: FrameworkInfo[] = [];

    try {
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const { dependencies = {}, devDependencies = {} } = JSON.parse(content);
      const allDeps = { ...dependencies, ...devDependencies };

      for (const [dep, info] of this.frameworks) {
        if (dep in allDeps) {
          detected.push({
            ...info,
            version: allDeps[dep]
          });
        }
      }

      return detected;
    } catch {
      return [];
    }
  }
}
