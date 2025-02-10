import { EnvironmentConfig } from './environment-analyzer';
export interface ProjectInfo {
    projectType: 'express' | 'unknown';
    hasPackageJson: boolean;
    dependencies: {
        dependencies: Record<string, string>;
        devDependencies: Record<string, string>;
    };
    projectRoot: string;
    environment?: EnvironmentConfig;
}
export declare class ProjectScanner {
    private fileSystem;
    private envAnalyzer;
    constructor();
    scan(projectPath: string): Promise<ProjectInfo>;
    private readPackageJson;
}
