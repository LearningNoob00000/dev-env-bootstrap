export interface BenchmarkResult {
    name: string;
    duration: number;
    memoryUsage: {
        heapUsed: number;
        heapTotal: number;
        external: number;
        rss: number;
    };
    operationsPerSecond: number;
}
export interface BenchmarkOptions {
    iterations?: number;
    warmupIterations?: number;
    name?: string;
}
export declare class Benchmark {
    private static defaultOptions;
    /**
     * Run a benchmark test on the provided function
     * @param fn Function to benchmark
     * @param options Benchmark options
     */
    static run(fn: () => Promise<void> | void, options?: BenchmarkOptions): Promise<BenchmarkResult>;
    /**
     * Compare multiple functions performance
     * @param tests Record of named test functions
     * @param options Benchmark options
     */
    static compare(tests: Record<string, () => Promise<void> | void>, options?: Omit<BenchmarkOptions, 'name'>): Promise<Record<string, BenchmarkResult>>;
    /**
     * Format benchmark results for display
     * @param results Benchmark results to format
     */
    static formatResults(results: BenchmarkResult | Record<string, BenchmarkResult>): string;
    private static formatSingleResult;
}
