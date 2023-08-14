import dotenv from 'dotenv';

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
			},
		};
	}

	#createMastodonConfig (processEnv) {
		return {
			mastodon: {
				accessToken: processEnv.MASTODON_ACCESS_TOKEN,
				baseUrl: processEnv.MASTODON_BASE_URL,
			},
		};
	}
}
