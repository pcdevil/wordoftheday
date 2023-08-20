export class FetchError extends Error {}

export function assertResponseOk (response) {
	if (!response.ok) {
		const { body, status, statusText, url } = response;
		// throwing literal object is fine because it will used as `cause` of the actual error
		// eslint-disable-next-line no-throw-literal
		throw {
			body,
			status,
			statusText,
			url,
		};
	}
}
