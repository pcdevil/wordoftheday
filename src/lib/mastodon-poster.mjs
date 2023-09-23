import { FetchError, FetchResponseError, assertResponseOk } from '#util/fetch-response.mjs';

export default class MastodonPoster {
	#fetchMethod;
	#language = 'en-GB';
	#setTimeoutMethod;
	#retryDelay = 30_000; // in milliseconds

	constructor (fetchMethod = globalThis.fetch, setTimeoutMethod = globalThis.setTimeout) {
		this.#fetchMethod = fetchMethod;
		this.#setTimeoutMethod = setTimeoutMethod;
	}

	get language () {
		return this.#language;
	}

	async post (baseUrl, accessToken, wordObject, hashtag, retryCount = 2) {
		const url = this.#createUrl(baseUrl);
		const status = this.#createStatus(wordObject, hashtag);
		const options = this.#createOptions(accessToken, status);

		try {
			const response = await this.#fetchMethod(url, options);
			assertResponseOk(response);
		} catch (error) {
			if (error instanceof FetchResponseError && error.status < 500) {
				throw error;
			}

			if (retryCount === 0) {
				throw new FetchError('Status post failed.', { cause: error });
			}

			await this.#sleep(this.#retryDelay);
			await this.post(baseUrl, accessToken, wordObject, hashtag, retryCount - 1);
		}
	}

	#createOptions (accessToken, status) {
		const body = JSON.stringify({
			language: this.#language,
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

	#createStatus (wordObject, hashtag) {
		const dateString = new Intl.DateTimeFormat(this.#language, { dateStyle: 'long' })
			.format(wordObject.date);

		return [
			`#WordOfTheDay ${hashtag} ${dateString}`,
			'', // empty line
			wordObject.word,
			'', // empty line
			wordObject.url,
		].join('\n');
	}

	#createUrl (baseUrl) {
		return new URL('/api/v1/statuses', baseUrl).toString();
	}

	async #sleep (delay) {
		return new Promise((resolve) => this.#setTimeoutMethod(() => resolve(), delay));
	}
}
