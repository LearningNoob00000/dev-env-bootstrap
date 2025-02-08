module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src', '<rootDir>/tests'],
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'cobertura'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.interface.ts',
        '!src/**/index.ts',
        '!src/**/*.types.ts',
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    reporters: [
        'default',
        ['jest-junit', {
            outputDirectory: 'reports',
            outputName: 'junit.xml',
            classNameTemplate: '{filepath}',
            titleTemplate: '{title}',
        }],
        ['jest-sonar-reporter', {
            outputDirectory: 'reports',
            outputName: 'sonar-report.xml',
        }],
    ],
};
