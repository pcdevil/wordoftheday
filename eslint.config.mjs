import eslint from '@eslint/js';
import eslintGitignoreConfig from 'eslint-config-flat-gitignore';
import eslintNodePlugin from 'eslint-plugin-n';
import eslintPromisePlugin from 'eslint-plugin-promise';
import globals from 'globals';

/**
 * @param {{ files?: (string | string[])[], rules?: Object }[]} configArray
 */
function stripFileOptions(configArray) {
	const strippedConfigArray = [];

	for (const config of configArray) {
		const { files: _files, ...restConfig } = config;
		strippedConfigArray.push(restConfig);
	}

	return strippedConfigArray;
}

export default [
	eslintGitignoreConfig(),

	...stripFileOptions([eslint.configs.recommended]),
	...stripFileOptions([eslintNodePlugin.configs['flat/recommended-script']]),
	...stripFileOptions([eslintPromisePlugin.configs['flat/recommended']]),

	{
		name: 'project',

		files: [
			'src/**/*.js',
			'src/**/*.mjs',
			'eslint.config.mjs',
			'vitest.config.mjs',
		],

		ignores: [
			'.tmp/**/*',
		],

		languageOptions: {
			ecmaVersion: 'latest',
			globals: {
				...globals.es2024,
				...globals.node,
			},
			sourceType: 'module',
		},

		rules: {
			'no-unused-vars': ['error', {
				argsIgnorePattern: '^_',
				caughtErrorsIgnorePattern: '^_',
				destructuredArrayIgnorePattern: '^_',
				varsIgnorePattern: '^_',
			}],
		},
	},
];
