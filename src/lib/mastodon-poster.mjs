import { UndefinedConfigError, config } from '#lib/config.mjs';
import { request } from '#util/request.mjs';

export class MastodonPoster {
	static language = 'en-GB';

	#logger;
	#requestMethod;

	constructor(logger, requestMethod = request) {
		this.#logger = logger.child({ name: this.constructor.name });
		this.#requestMethod = requestMethod;
	}

	async post(wordObject) {
		if (!config.mastodon.baseUrl) throw new UndefinedConfigError(`The mastodon.baseUrl config variable is not defined.`);
		if (!config.mastodon.accessToken) throw new UndefinedConfigError(`The mastodon.accessToken config variable is not defined.`);

		const url = this.#createUrl(config.mastodon.baseUrl);
		const status = this.#createStatus(wordObject);
		const options = this.#createOptions(status);

		await this.#requestMethod(url, options, this.#logger);
	}

	#createOptions(status) {
		const body = JSON.stringify({
			language: MastodonPoster.language,
			status,
			visibility: 'public',
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
		const dateString = new Intl.DateTimeFormat(MastodonPoster.language, { dateStyle: 'long' })
			.format(wordObject.date);

		const hashtags = `#WordOfTheDay ${config.source.postHashtag ?? ''}`.trim();

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
