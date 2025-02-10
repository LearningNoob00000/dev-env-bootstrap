import { ExpressProjectInfo } from '../analyzers/express-analyzer';
import { EnvironmentConfig } from '../analyzers/environment-analyzer';
export interface DockerConfig {
    nodeVersion: string;
    port: number;
    hasTypeScript: boolean;
    isDevelopment: boolean;
    environment?: EnvironmentConfig;
}
export declare class ExpressDockerGenerator {
    generate(projectInfo: ExpressProjectInfo, config?: Partial<DockerConfig>): string;
    generateCompose(projectInfo: ExpressProjectInfo, config?: Partial<DockerConfig>): string;
}
