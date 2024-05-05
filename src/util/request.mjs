import { NamedError } from '#util';

export class RequestError extends NamedError {}

export class ResponseError extends RequestError {
	constructor(status, statusText) {
		super(`Request failed with ${status} "${statusText}" error.`);
		this.status = status;
		this.statusText = statusText;
	}
}

export function assertResponseOk(response) {
	if (!response.ok) {
		const { status, statusText } = response;

		throw new ResponseError(status, statusText);
	}
}

export function isClientResponseError(error) {
	return error instanceof ResponseError && error.status <= 500;
}

export async function requestWithMeasure(url, options, logger, fetchMethod = globalThis.fetch) {
	const measureName = `request`;
	try {
		logger.mark(`${measureName} start`);
		return await fetchMethod(url, options);
	} finally {
		logger.mark(`${measureName} end`);
		logger.measure(measureName, `${measureName} start`, `${measureName} end`);
	}
}
