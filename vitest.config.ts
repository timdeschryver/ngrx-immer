import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./setup-vitest.ts'],
		include: ['**/*.test.ts'],
		exclude: ['node_modules', 'dist'],
		alias: {
			'ngrx-immer/signals': resolve(__dirname, './src/signals'),
			'ngrx-immer/component-store': resolve(__dirname, './src/component-store'),
			'ngrx-immer': resolve(__dirname, './src'),
		},
	},
	resolve: {
		alias: {
			'ngrx-immer/signals': resolve(__dirname, './src/signals'),
			'ngrx-immer/component-store': resolve(__dirname, './src/component-store'),
			'ngrx-immer': resolve(__dirname, './src'),
		},
	},
});
