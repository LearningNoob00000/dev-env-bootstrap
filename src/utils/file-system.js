"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystemUtils = exports.FileSystemError = void 0;
// src/utils/file-system.ts
/* eslint-disable @typescript-eslint/no-unused-vars */
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
class FileSystemError extends Error {
    constructor(message, path) {
        super(`FileSystem Error: ${message} (path: ${path})`);
        this.path = path;
        this.name = 'FileSystemError';
    }
}
exports.FileSystemError = FileSystemError;
class FileSystemUtils {
    /**
     * Safely reads a file with error handling
     * @param filePath - Path to the file
     * @param options - Optional file reading options
     */
    async readFile(filePath, options = {}) {
        try {
            const encoding = options.encoding || 'utf8';
            return await fs_1.promises.readFile(filePath, { encoding });
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.code === 'ENOENT') {
                    throw new FileSystemError('File not found', filePath);
                }
                if (error.code === 'EACCES') {
                    throw new FileSystemError('Permission denied', filePath);
                }
            }
            throw new FileSystemError('Failed to read file', filePath);
        }
    }
    /**
     * Safely writes a file with error handling
     * @param filePath - Path to the file
     * @param content - Content to write
     * @param options - Optional file writing options
     */
    async writeFile(filePath, content, options = {}) {
        try {
            const encoding = options.encoding || 'utf8';
            // Ensure the directory exists before writing
            await this.ensureDir(path_1.default.dirname(filePath));
            await fs_1.promises.writeFile(filePath, content, { encoding });
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.code === 'EACCES') {
                    throw new FileSystemError('Permission denied', filePath);
                }
            }
            throw new FileSystemError('Failed to write file', filePath);
        }
    }
    /**
     * Checks if a file exists
     * @param filePath - Path to the file
     */
    async fileExists(filePath) {
        try {
            await fs_1.promises.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Ensures a directory exists, creating it if necessary
     * @param dirPath - Path to the directory
     */
    async ensureDir(dirPath) {
        try {
            await fs_1.promises.mkdir(dirPath, { recursive: true });
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.code === 'EACCES') {
                    throw new FileSystemError('Permission denied', dirPath);
                }
            }
            throw new FileSystemError('Failed to create directory', dirPath);
        }
    }
    /**
     * Lists files in a directory
     * @param dirPath - Path to the directory
     * @param options - Optional listing options
     */
    async listFiles(dirPath, options = {}) {
        try {
            const files = await fs_1.promises.readdir(dirPath, { withFileTypes: true });
            const ignore = new Set(options.ignore || []);
            return files
                .filter(file => file.isFile() && !ignore.has(file.name))
                .map(file => path_1.default.join(dirPath, file.name));
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.code === 'ENOENT') {
                    throw new FileSystemError('Directory not found', dirPath);
                }
                if (error.code === 'EACCES') {
                    throw new FileSystemError('Permission denied', dirPath);
                }
            }
            throw new FileSystemError('Failed to list directory', dirPath);
        }
    }
    /**
     * Finds files matching specific patterns recursively
     * @param dir - Directory to search in
     * @param patterns - File patterns to match
     * @param options - Optional search options
     */
    async findFiles(dir, patterns, options = {}) {
        const results = [];
        const ignore = new Set(options.ignore || ['node_modules', '.git']);
        async function walk(currentDir) {
            try {
                const entries = await fs_1.promises.readdir(currentDir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path_1.default.join(currentDir, entry.name);
                    // Skip ignored directories
                    if (entry.isDirectory() && ignore.has(entry.name)) {
                        continue;
                    }
                    if (entry.isDirectory()) {
                        await walk(fullPath);
                    }
                    else if (patterns.some(pattern => {
                        if (pattern.includes('*')) {
                            const regex = new RegExp(pattern.replace('*', '.*'));
                            return regex.test(entry.name);
                        }
                        return entry.name === pattern;
                    })) {
                        results.push(fullPath);
                    }
                }
            }
            catch (error) {
                if (error instanceof Error) {
                    if (error.code === 'EACCES') {
                        console.warn(`Warning: Permission denied for ${currentDir}`);
                        return;
                    }
                }
                throw new FileSystemError('Failed to scan directory', currentDir);
            }
        }
        await walk(dir);
        return results;
    }
    /**
     * Removes a file or directory
     * @param path - Path to remove
     * @param options - Optional removal options
     */
    async remove(path, options = {}) {
        try {
            const stats = await fs_1.promises.stat(path);
            if (stats.isDirectory()) {
                await fs_1.promises.rm(path, { recursive: true });
            }
            else {
                await fs_1.promises.unlink(path);
            }
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.code === 'ENOENT') {
                    return; // File/directory doesn't exist, consider it removed
                }
                if (error.code === 'EACCES') {
                    throw new FileSystemError('Permission denied', path);
                }
            }
            throw new FileSystemError('Failed to remove path', path);
        }
    }
    /**
     * Copies a file or directory
     * @param src - Source path
     * @param dest - Destination path
     * @param options - Optional copy options
     */
    async copy(src, dest, options = {}) {
        try {
            const stats = await fs_1.promises.stat(src);
            if (stats.isDirectory()) {
                await this.ensureDir(dest);
                const files = await fs_1.promises.readdir(src);
                await Promise.all(files.map(file => this.copy(path_1.default.join(src, file), path_1.default.join(dest, file), options)));
            }
            else {
                await this.ensureDir(path_1.default.dirname(dest));
                await fs_1.promises.copyFile(src, dest);
            }
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.code === 'ENOENT') {
                    throw new FileSystemError('Source not found', src);
                }
                if (error.code === 'EACCES') {
                    throw new FileSystemError('Permission denied', src);
                }
            }
            throw new FileSystemError('Failed to copy', src);
        }
    }
}
exports.FileSystemUtils = FileSystemUtils;
