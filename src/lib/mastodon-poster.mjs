import { NamedError } from '#util/named-error.mjs';
import { request } from '#util/request.mjs';

export class UndefinedArgumentError extends NamedError {}

export class MastodonPoster {
	static language = 'en-GB';

	#logger;
	#requestMethod;

	constructor(logger, requestMethod = request) {
		this.#logger = logger.child({ name: this.constructor.name });
		this.#requestMethod = requestMethod;
	}

	async post(baseUrl, accessToken, wordObject, hashtag) {
		if (!baseUrl) throw new UndefinedArgumentError(`The baseUrl argument is not defined.`);
		if (!accessToken) throw new UndefinedArgumentError(`The accessToken argument is not defined.`);

		const url = this.#createUrl(baseUrl);
		const status = this.#createStatus(wordObject, hashtag);
		const options = this.#createOptions(accessToken, status);

		await this.#requestMethod(url, options, this.#logger);
	}

	#createOptions(accessToken, status) {
		const body = JSON.stringify({
			language: MastodonPoster.language,
			status,
			visibility: 'public',
		});

		return {
			body,
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			method: 'POST',
		};
	}

	#createStatus(wordObject, hashtag) {
		const dateString = new Intl.DateTimeFormat(MastodonPoster.language, { dateStyle: 'long' })
			.format(wordObject.date);

		const hashtags = `#WordOfTheDay ${hashtag ?? ''}`.trim();

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
