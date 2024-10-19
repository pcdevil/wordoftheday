import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		exclude: [
			...configDefaults.exclude,
			'./.github/**',
			'./.tmp/**',
			'./.vscode/**',
			'./assets/**',
			'./src/vitest/**',
		],
		setupFiles: [
			'./src/vitest/logger.mock.mjs',
		],

		clearMocks: true,
		unstubEnvs: true,
		unstubGlobals: true,
	},
});
