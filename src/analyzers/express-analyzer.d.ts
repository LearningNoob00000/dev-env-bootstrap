export interface ExpressProjectInfo {
    hasExpress: boolean;
    version: string | null;
    mainFile: string | null;
    port: number | null;
    middleware: string[];
    hasTypeScript: boolean;
}
export declare class ExpressAnalyzer {
    /**
     * Analyzes an Express.js project
     * @param projectPath - Path to project root
     * @returns Analysis results for Express.js specifics
     */
    analyze(projectPath: string): Promise<ExpressProjectInfo>;
    private detectPort;
    private detectMiddleware;
}
