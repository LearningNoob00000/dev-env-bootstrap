"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentAnalyzer = void 0;
// src/analyzers/environment-analyzer.ts
const file_system_1 = require("../utils/file-system");
const path_1 = __importDefault(require("path"));
class EnvironmentAnalyzer {
    constructor() {
        this.fileSystem = new file_system_1.FileSystemUtils();
    }
    /**
     * Analyzes environment configuration in a project
     * @param projectPath - Path to project root
     */
    async analyze(projectPath) {
        const result = {
            variables: {},
            hasEnvFile: false,
            services: []
        };
        try {
            // Check for .env file
            const envPath = path_1.default.join(projectPath, '.env');
            const envExists = await this.fileSystem.fileExists(envPath);
            result.hasEnvFile = envExists;
            if (envExists) {
                const envContent = await this.fileSystem.readFile(envPath);
                result.variables = this.parseEnvFile(envContent);
            }
            // Check for .env.example file
            const envExamplePath = path_1.default.join(projectPath, '.env.example');
            if (await this.fileSystem.fileExists(envExamplePath)) {
                const exampleContent = await this.fileSystem.readFile(envExamplePath);
                const exampleVars = this.parseEnvFile(exampleContent);
                result.services = this.detectServices(exampleVars);
            }
            return result;
        }
        catch (error) {
            throw new Error(`Environment analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Parse environment file content
     */
    parseEnvFile(content) {
        const variables = {};
        const lines = content.split('\n');
        for (const line of lines) {
            const trimmedLine = line.trim();
            // Skip comments and empty lines
            if (!trimmedLine || trimmedLine.startsWith('#')) {
                continue;
            }
            const match = trimmedLine.match(/^([^=]+)=(.*)$/);
            if (match) {
                const [, key, value] = match;
                variables[key.trim()] = value.trim();
            }
        }
        return variables;
    }
    /**
     * Detect services from environment variables
     */
    detectServices(variables) {
        const services = [];
        const commonServicePatterns = [
            { pattern: /DB_HOST|DATABASE_URL/, name: 'Database' },
            { pattern: /REDIS_URL|REDIS_HOST/, name: 'Redis' },
            { pattern: /MONGODB_URI|MONGO_URL/, name: 'MongoDB' },
            { pattern: /ELASTIC_URL|ELASTICSEARCH/, name: 'Elasticsearch' },
            { pattern: /RABBIT_URL|RABBITMQ/, name: 'RabbitMQ' },
            { pattern: /KAFKA_BROKERS|KAFKA_URL/, name: 'Kafka' }
        ];
        for (const [key, value] of Object.entries(variables)) {
            for (const { pattern, name } of commonServicePatterns) {
                if (pattern.test(key)) {
                    services.push({
                        name,
                        url: value,
                        required: !key.includes('OPTIONAL')
                    });
                    break;
                }
            }
        }
        return services;
    }
}
exports.EnvironmentAnalyzer = EnvironmentAnalyzer;
