import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		exclude: [
			...configDefaults.exclude,
			'./.github/**',
			'./.tmp/**',
			'./.vscode/**',
			'./assets/**',
		],

		clearMocks: true,
		unstubEnvs: true,
		unstubGlobals: true,
	},
});
