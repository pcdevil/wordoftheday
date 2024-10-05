import dotenv from 'dotenv';

export class Config {
	constructor(dotenvModule = dotenv) {
		const processEnv = {
			...process.env,
		};
		dotenvModule.config({ processEnv });

		return {
			source: {
				name: processEnv.SOURCE_NAME,
				url: processEnv.SOURCE_URL,
				itemIndex: parseInt(processEnv.SOURCE_ITEM_INDEX, 10),
				postHashtag: processEnv.SOURCE_POST_HASHTAG,
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
