import dotenv from 'dotenv';
// project imports
import { NamedError } from '#src/util/named-error.mjs';

dotenv.config({
	processEnv: process.env,
	quiet: true,
});

export class UndefinedConfigError extends NamedError {}

export const config = {
	source: {
		name: process.env.SOURCE_NAME,
		url: process.env.SOURCE_URL,
		itemIndex: parseInt(process.env.SOURCE_ITEM_INDEX, 10),
	},

	post: {
		hashtag: process.env.POST_HASHTAG,
		language: process.env.POST_LANGUAGE ?? 'en-GB',
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

	request: {
		retryCount: parseIntWithUndefined(process.env.RETRY_COUNT) ?? 2,
		retryDelay: parseInt(process.env.RETRY_DELAY) || 20_000, // in milliseconds
	},
};
Object.freeze(config);

function parseIntWithUndefined (stringValue) {
	const numberValue = parseInt(stringValue, 10);
	if (Number.isNaN(numberValue)) return;

	return numberValue;
}
