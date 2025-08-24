/** @type {import('jest').Config} */
const config = {
	preset: 'jest-preset-angular',
	setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
	testMatch: ['**/*.jest.ts'],
	modulePathIgnorePatterns: ['<rootDir>/src/package.json'],
	moduleNameMapper: {
		'ngrx-immer/signals': '<rootDir>/src/signals',
		'ngrx-immer': '<rootDir>/src',
	},
};

module.exports = config;
