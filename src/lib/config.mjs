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
		itemIndex: parseNumber(process.env.SOURCE_ITEM_INDEX),
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
		retryCount: parseNumber(process.env.RETRY_COUNT, 2),
		retryDelay: parseNumber(process.env.RETRY_DELAY, 20_000), // in milliseconds
	},
};
Object.freeze(config);

/**
 * Parse number with a fallback in mind
 *
 * It behaves the same as calling `Number('123')` would be, but that requires cumbersome fallback logic when `0` would be allowed as the parsed value.
 *
 * Consider the following examples:
 *
 * ```javascript
 * const a = Number('0') ?? 2; // value is the parsed `0`
 * const d = Number('a') || 2; // value is the fallback `2`
 * ```
 *
 * While both approaches work as is, they have an edge-case when the value is switched around:
 *
 * ```javascript
 * const b = Number('a') ?? 2; // value remains `NaN` and doesn't fall back to `2`
 * const c = Number('0') || 2; // value falls back to `2` even though the parsed value is `0`
 * ```
 *
 * While it is possible to resolve the issues in place (for example by introducing an intermediate variable, or by a ternary and calling `Number()` two times), the code would be messy and hard to read for untrained eyes (in other words: anybody outside of the author).
 *
 * This method counter-acts the issues by checking the parsed value and returns the desired fallback in case of a parsing error, and leaving the usage easy to follow.
 *
 * @param {string} stringValue
 * @param {number|typeof Number.isNaN} fallback
 * @returns {number|typeof Number.isNaN}
 */
function parseNumber (stringValue, fallback = Number.NaN) {
	const numberValue = Number(stringValue);

	if (Number.isNaN(numberValue)) return fallback;
	return numberValue;
}
