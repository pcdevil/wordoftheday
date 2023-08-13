const HTTP_OK = 200;

export class FetchError extends Error {}

export default class MastodonPoster {
	#fetchMethod;

	constructor (fetchMethod = globalThis.fetch) {
		this.#fetchMethod = fetchMethod;
	}

	async post (baseUrl, accessToken, status) {
		try {
			const response = await this.#fetchMethod(
				this.#createUrl(baseUrl),
				this.#createOptions(accessToken, status)
			);

			if (response.status !== HTTP_OK) {
				const { body, status, statusText } = response;
				// throwing literal object is fine because it will used as `cause` of the actual error
				// eslint-disable-next-line no-throw-literal
				throw {
					body,
					status,
					statusText,
				};
			}
		} catch (error) {
			throw new FetchError('Status post failed.', { cause: error });
		}
	}

	#createOptions (accessToken, status) {
		const body = JSON.stringify({
			language: 'en',
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

	#createUrl (baseUrl) {
		return new URL('/api/v1/statuses', baseUrl).toString();
	}
}
