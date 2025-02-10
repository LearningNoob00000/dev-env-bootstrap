export declare class FileSystemError extends Error {
    readonly path: string;
    constructor(message: string, path: string);
}
export interface FileSystemOptions {
    encoding?: BufferEncoding;
    ignore?: string[];
}
export declare class FileSystemUtils {
    /**
     * Safely reads a file with error handling
     * @param filePath - Path to the file
     * @param options - Optional file reading options
     */
    readFile(filePath: string, options?: FileSystemOptions): Promise<string>;
    /**
     * Safely writes a file with error handling
     * @param filePath - Path to the file
     * @param content - Content to write
     * @param options - Optional file writing options
     */
    writeFile(filePath: string, content: string, options?: FileSystemOptions): Promise<void>;
    /**
     * Checks if a file exists
     * @param filePath - Path to the file
     */
    fileExists(filePath: string): Promise<boolean>;
    /**
     * Ensures a directory exists, creating it if necessary
     * @param dirPath - Path to the directory
     */
    ensureDir(dirPath: string): Promise<void>;
    /**
     * Lists files in a directory
     * @param dirPath - Path to the directory
     * @param options - Optional listing options
     */
    listFiles(dirPath: string, options?: FileSystemOptions): Promise<string[]>;
    /**
     * Finds files matching specific patterns recursively
     * @param dir - Directory to search in
     * @param patterns - File patterns to match
     * @param options - Optional search options
     */
    findFiles(dir: string, patterns: string[], options?: FileSystemOptions): Promise<string[]>;
    /**
     * Removes a file or directory
     * @param path - Path to remove
     * @param options - Optional removal options
     */
    remove(path: string, options?: FileSystemOptions): Promise<void>;
    /**
     * Copies a file or directory
     * @param src - Source path
     * @param dest - Destination path
     * @param options - Optional copy options
     */
    copy(src: string, dest: string, options?: FileSystemOptions): Promise<void>;
}
