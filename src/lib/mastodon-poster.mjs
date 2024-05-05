import { RequestError, assertResponseOk, isClientResponseError, requestWithMeasure } from '#util';

export class MastodonPoster {
	static language = 'en-GB';
	static retryCount = 2;
	static retryDelay = 30_000; // in milliseconds

	#logger;
	#requestWithMeasureMethod;
	#setTimeoutMethod;

	constructor(logger, requestWithMeasureMethod = requestWithMeasure, setTimeoutMethod = globalThis.setTimeout) {
		this.#logger = logger.child({ name: this.constructor.name });
		this.#requestWithMeasureMethod = requestWithMeasureMethod;
		this.#setTimeoutMethod = setTimeoutMethod;
	}

	async post(baseUrl, accessToken, wordObject, hashtag, retryCount = MastodonPoster.retryCount) {
		this.#logger.debug('post start', {
			retryCount,
		});
		const url = this.#createUrl(baseUrl);
		const status = this.#createStatus(wordObject, hashtag);
		const options = this.#createOptions(accessToken, status);

		try {
			const response = await this.#requestWithMeasureMethod(url, options, this.#logger);
			assertResponseOk(response);
			this.#logger.debug('post successful');
		} catch (error) {
			if (isClientResponseError(error)) {
				this.#logger.warn('post failed with client error, will not retry', {
					error,
				});
				throw error;
			}

			if (retryCount === 0) {
				this.#logger.warn('post failed, will not retry', {
					error,
				});
				throw new RequestError('Status post failed.', { cause: error });
			}

			this.#logger.warn('post failed, will retry after delay', {
				delay: MastodonPoster.retryDelay,
				error,
				retryCount,
			});
			await this.#retrySleep();
			await this.post(baseUrl, accessToken, wordObject, hashtag, retryCount - 1);
		}
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

		return [
			`#WordOfTheDay ${hashtag} ${dateString}`,
			'', // empty line
			wordObject.word,
			'', // empty line
			wordObject.url,
		].join('\n');
	}

	#createUrl(baseUrl) {
		return new URL('/api/v1/statuses', baseUrl).toString();
	}

	async #retrySleep() {
		return new Promise((resolve) => this.#setTimeoutMethod(() => resolve(), MastodonPoster.retryDelay));
	}
}
