"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Benchmark = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
const perf_hooks_1 = require("perf_hooks");
class Benchmark {
    /**
     * Run a benchmark test on the provided function
     * @param fn Function to benchmark
     * @param options Benchmark options
     */
    static async run(fn, options = {}) {
        const opts = { ...this.defaultOptions, ...options };
        // Warmup phase
        for (let i = 0; i < opts.warmupIterations; i++) {
            await fn();
        }
        // Clear garbage before starting
        if (global.gc) {
            global.gc();
        }
        const startMemory = process.memoryUsage();
        const startTime = perf_hooks_1.performance.now();
        // Main benchmark
        for (let i = 0; i < opts.iterations; i++) {
            await fn();
        }
        const endTime = perf_hooks_1.performance.now();
        const endMemory = process.memoryUsage();
        const duration = endTime - startTime;
        const operationsPerSecond = (opts.iterations / duration) * 1000;
        const memoryUsage = {
            heapUsed: endMemory.heapUsed - startMemory.heapUsed,
            heapTotal: endMemory.heapTotal - startMemory.heapTotal,
            external: endMemory.external - startMemory.external,
            rss: endMemory.rss - startMemory.rss
        };
        return {
            name: opts.name,
            duration,
            memoryUsage,
            operationsPerSecond
        };
    }
    /**
     * Compare multiple functions performance
     * @param tests Record of named test functions
     * @param options Benchmark options
     */
    static async compare(tests, options = {}) {
        const results = {};
        for (const [name, fn] of Object.entries(tests)) {
            results[name] = await this.run(fn, { ...options, name });
        }
        return results;
    }
    /**
     * Format benchmark results for display
     * @param results Benchmark results to format
     */
    static formatResults(results) {
        if ('name' in results) {
            return this.formatSingleResult(results);
        }
        return Object.entries(results)
            .map(([_, result]) => this.formatSingleResult(result))
            .join('\n\n');
    }
    static formatSingleResult(result) {
        const mb = 1024 * 1024;
        return `
Benchmark: ${result.name}
Duration: ${result.duration.toFixed(2)}ms
Operations/sec: ${result.operationsPerSecond.toFixed(2)}
Memory Usage:
  Heap Used: ${(result.memoryUsage.heapUsed / mb).toFixed(2)} MB
  Heap Total: ${(result.memoryUsage.heapTotal / mb).toFixed(2)} MB
  External: ${(result.memoryUsage.external / mb).toFixed(2)} MB
  RSS: ${(result.memoryUsage.rss / mb).toFixed(2)} MB
`.trim();
    }
}
exports.Benchmark = Benchmark;
Benchmark.defaultOptions = {
    iterations: 1000,
    warmupIterations: 100,
    name: 'Unnamed Benchmark'
};
