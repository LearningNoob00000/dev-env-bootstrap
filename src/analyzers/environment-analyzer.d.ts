export interface EnvironmentConfig {
    variables: Record<string, string>;
    hasEnvFile: boolean;
    services: {
        name: string;
        url?: string;
        required: boolean;
    }[];
}
export declare class EnvironmentAnalyzer {
    private fileSystem;
    constructor();
    /**
     * Analyzes environment configuration in a project
     * @param projectPath - Path to project root
     */
    analyze(projectPath: string): Promise<EnvironmentConfig>;
    /**
     * Parse environment file content
     */
    private parseEnvFile;
    /**
     * Detect services from environment variables
     */
    private detectServices;
}
