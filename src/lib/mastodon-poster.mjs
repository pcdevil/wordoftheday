import { FetchError, assertResponseOk } from '#util/fetch-response.mjs';

export default class MastodonPoster {
	#fetchMethod;
	#language = 'en-GB';

	constructor (fetchMethod = globalThis.fetch) {
		this.#fetchMethod = fetchMethod;
	}

	get language () {
		return this.#language;
	}

	async post (baseUrl, accessToken, wordObject, hashtag) {
		const url = this.#createUrl(baseUrl);
		const status = this.#createStatus(wordObject, hashtag);
		const options = this.#createOptions(accessToken, status);

		try {
			const response = await this.#fetchMethod(url, options);
			assertResponseOk(response);
		} catch (error) {
			if (error instanceof FetchError) {
				throw error;
			}
			throw new FetchError('Status post failed.', { cause: error });
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
}
