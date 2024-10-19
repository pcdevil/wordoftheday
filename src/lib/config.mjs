import { NamedError } from '#src/util/named-error.mjs';

export class UndefinedConfigError extends NamedError {}

export const config = {
	source: {
		name: process.env.SOURCE_NAME,
		url: process.env.SOURCE_URL,
		itemIndex: parseInt(process.env.SOURCE_ITEM_INDEX, 10),
	},

	post: {
		hashtag: process.env.POST_HASHTAG ?? 'en-GB',
		language: process.env.POST_LANGUAGE,
		visibility: process.env.POST_VISIBILITY ?? 'public',
	},

	log: {
		filePath: process.env.LOG_FILE_PATH,
		level: process.env.LOG_LEVEL,
		pretty: process.env.LOG_PRETTY === 'true',
		prettyColorize: process.env.CI !== 'true',
	},

	mastodon: {
		accessToken: process.env.MASTODON_ACCESS_TOKEN,
		baseUrl: process.env.MASTODON_BASE_URL,
	},
};
Object.freeze(config);
