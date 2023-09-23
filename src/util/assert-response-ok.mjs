export class FetchError extends Error {}

export class FetchResponseError extends FetchError {
	constructor (status, statusText) {
		super(`Fetch failed with ${status} "${statusText}" error.`);
		this.status = status;
		this.statusText = statusText;
	}
}

export function assertResponseOk (response) {
	if (!response.ok) {
		const { status, statusText } = response;

		throw new FetchResponseError(status, statusText);
	}
}
