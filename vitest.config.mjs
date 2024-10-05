import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		exclude: [...configDefaults.exclude],

		clearMocks: true,
		unstubEnvs: true,
		unstubGlobals: true,
	},
});
