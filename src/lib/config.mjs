import dotenv from 'dotenv';

export class MissingEnvVariableError extends Error {}

export default class Config {
	constructor (dotenvModule = dotenv) {
		const processEnv = {};
		dotenvModule.config({ processEnv });

		return {
			...this.#baseConfig,
			...this.#createMastodonConfig(processEnv),
		};
	}

	get #baseConfig () {
		return {
			sources: {
				merriamWebster: {
					hashtag: '#MerriamWebster',
					itemIndex: 0,
					url: 'https://www.merriam-webster.com/wotd/feed/rss2',
				},
				oxfordLearnersDictionaries: {
					hashtag: '#OxfordLearnersDictionaries',
					itemIndex: -1,
					url: 'https://feeds.feedburner.com/OLD-WordOfTheDay',
				},
				theFreeDictionary: {
					hashtag: '#TheFreeDictionary',
					itemIndex: 0,
					url: 'https://www.thefreedictionary.com/_/WoD/rss.aspx',
				},
			},
		};
	}

	#createMastodonConfig (processEnv) {
		return {
			mastodon: {
				accessToken: this.#getEnvVariableOrThrow(processEnv, 'MASTODON_ACCESS_TOKEN'),
				baseUrl: this.#getEnvVariableOrThrow(processEnv, 'MASTODON_BASE_URL'),
			},
		};
	}

	#getEnvVariableOrThrow (processEnv, variableName) {
		if (!processEnv[variableName]) {
			throw new MissingEnvVariableError(`The environment variable "${variableName}" is not defined.`);
		}

		return processEnv[variableName];
	}
}