// src/analyzers/env-analyzer.ts
import { promises as fs } from 'fs';
import path from 'path';

export interface EnvAnalysis {
  envFiles: string[];
  variables: Record<string, string>;
  missingRequired?: string[];
}

export class EnvAnalyzer {
  /**
   * Analyzes environment files in the project
   * @param projectPath - Path to project root
   * @returns Analysis of environment files
   */
  public async analyze(projectPath: string): Promise<EnvAnalysis> {
    const envFiles = await this.findEnvFiles(projectPath);
    const variables: Record<string, string> = {};

    for (const file of envFiles) {
      const content = await fs.readFile(file, 'utf-8');
      const fileVars = this.parseEnvFile(content);
      Object.assign(variables, fileVars);
    }

    return {
      envFiles,
      variables,
      missingRequired: this.checkRequiredVariables(variables)
    };
  }

  private async findEnvFiles(dir: string): Promise<string[]> {
    const patterns = ['.env', '.env.example', '.env.local'];
    const files: string[] = [];

    for (const pattern of patterns) {
      try {
        const filePath = path.join(dir, pattern);
        await fs.access(filePath);
        files.push(filePath);
      } catch {
        continue;
      }
    }

    return files;
  }

  private parseEnvFile(content: string): Record<string, string> {
    const vars: Record<string, string> = {};
    const lines = content.split('\n');

    for (const line of lines) {
      if (line.trim() && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        if (key) {
          vars[key.trim()] = value;
        }
      }
    }

    return vars;
  }

  private checkRequiredVariables(variables: Record<string, string>): string[] {
    // Add your required variables logic here
    const required = ['DATABASE_URL', 'API_KEY'];
    return required.filter(key => !(key in variables));
  }
}
