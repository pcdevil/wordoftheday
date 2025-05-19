import { includeIgnoreFile } from '@eslint/compat';
import eslint from '@eslint/js';
import eslintNodePlugin from 'eslint-plugin-n';
import eslintPromisePlugin from 'eslint-plugin-promise';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import { resolve } from 'node:path';

const gitignoreFile = resolve(import.meta.dirname, '.gitignore');

export default defineConfig([
	includeIgnoreFile(gitignoreFile),

	{
		name: 'project',

		files: [
			'src/**/*.js',
			'src/**/*.mjs',
			'*.config.mjs',
		],

		extends: [
			eslint.configs.recommended,
			eslintNodePlugin.configs['flat/recommended-module'],
			eslintPromisePlugin.configs['flat/recommended'],
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
]);
