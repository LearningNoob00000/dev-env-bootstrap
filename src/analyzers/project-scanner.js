"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectScanner = void 0;
// src/analyzers/project-scanner.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
const path_1 = __importDefault(require("path"));
const file_system_1 = require("../utils/file-system");
const environment_analyzer_1 = require("./environment-analyzer");
class ProjectScanner {
    constructor() {
        this.fileSystem = new file_system_1.FileSystemUtils();
        this.envAnalyzer = new environment_analyzer_1.EnvironmentAnalyzer();
    }
    async scan(projectPath) {
        const absolutePath = path_1.default.resolve(projectPath);
        const hasPackageJson = await this.fileSystem.fileExists(path_1.default.join(absolutePath, 'package.json'));
        let envInfo = {
            variables: {},
            hasEnvFile: false,
            services: []
        };
        try {
            envInfo = await this.envAnalyzer.analyze(absolutePath);
        }
        catch (error) {
            // Provide default environment config on error
            console.error('Environment analysis failed:', error);
        }
        if (!hasPackageJson) {
            return {
                projectType: 'unknown',
                hasPackageJson: false,
                dependencies: { dependencies: {}, devDependencies: {} },
                projectRoot: absolutePath,
                environment: envInfo
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
            environment: envInfo
        };
    }
    async readPackageJson(projectPath) {
        const packageJsonPath = path_1.default.join(projectPath, 'package.json');
        const content = await this.fileSystem.readFile(packageJsonPath);
        try {
            return JSON.parse(content);
        }
        catch (error) {
            throw new Error('Failed to parse package.json');
        }
    }
}
exports.ProjectScanner = ProjectScanner;
