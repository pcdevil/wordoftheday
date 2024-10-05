import dotenv from 'dotenv';

export class Config {
	constructor(dotenvModule = dotenv) {
		const processEnv = {
			...process.env,
		};
		dotenvModule.config({ processEnv });

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

			log: {
				filePath: processEnv.LOG_FILE_PATH,
				level: processEnv.LOG_LEVEL,
				pretty: processEnv.LOG_PRETTY === 'true',
				prettyColorize: processEnv.CI !== 'true',
			},

			mastodon: {
				accessToken: processEnv.MASTODON_ACCESS_TOKEN,
				baseUrl: processEnv.MASTODON_BASE_URL,
			},
		};
	}
}
