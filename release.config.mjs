const baseCommitConfig = {
	preset: 'conventifonalcommits',
	parserOpts: {
		noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING'],
	},
};

const changelogFile = 'CHANGELOG.md';

/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
	branches: ['main'],
	plugins: [
		[
			'@semantic-release/commit-analyzer',
			{
				...baseCommitConfig,
			},
		],
		[
			'@semantic-release/release-notes-generator',
			{
				...baseCommitConfig,
				writerOpts: {
					commitsSort: ['subject', 'scope'],
				},
			},
		],

		[
			'@semantic-release/changelog',
			{
				changelogFile,
			},
		],

		[
			'@semantic-release/npm',
			{
				npmPublish: false,
			},
		],

		[
			'@semantic-release/git',
			{
				assets: [changelogFile, 'package.json'],
				message: 'chore(release): ${nextRelease.version} [skip ci]',
			},
		],
	],
};
