import { UndefinedConfigError, config } from '#src/lib/config.mjs';
import { getLogger } from '#src/util/logger.mjs';
import { request } from '#src/util/request.mjs';

export class MastodonPoster {
	#logger;

	constructor() {
		this.#logger = getLogger(this.constructor.name);
	}

	async post(wordObject) {
		if (!config.mastodon.baseUrl) throw new UndefinedConfigError(`The mastodon.baseUrl config variable is not defined.`);
		if (!config.mastodon.accessToken) throw new UndefinedConfigError(`The mastodon.accessToken config variable is not defined.`);

		const url = this.#createUrl(config.mastodon.baseUrl);
		const status = this.#createStatus(wordObject);
		const options = this.#createOptions(status);

		await request(url, options, this.#logger);
	}

	#createOptions(status) {
		const body = JSON.stringify({
			language: config.post.language,
			status,
			visibility: config.post.visibility,
		});

		return {
			body,
			headers: {
				Authorization: `Bearer ${config.mastodon.accessToken}`,
				'Content-Type': 'application/json',
			},
			method: 'POST',
		};
	}

	#createStatus(wordObject) {
		const dateString = new Intl.DateTimeFormat(config.post.language, { dateStyle: 'long' })
			.format(wordObject.date);

		const hashtags = `#WordOfTheDay ${config.post.hashtag ?? ''}`.trim();

		return [
			`${hashtags} ${dateString}`,
			'', // empty line
			wordObject.word,
			'', // empty line
			wordObject.url,
		].join('\n');
	}

	#createUrl(baseUrl) {
		return new URL('/api/v1/statuses', baseUrl).toString();
	}
}
