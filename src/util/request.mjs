import { NamedError } from '#util/named-error.mjs';

export class RequestError extends NamedError {
	constructor(message, options = {}) {
		const { cause, status, statusText } = options ?? {};

		const superOptions = cause ? { cause } : {};
		super(message, superOptions);

		this.status = status;
		this.statusText = statusText;
	}
}

export const DEFAULT_REQUEST_RETRY_COUNT = 2;

export const REQUEST_RETRY_DELAY = 30_000; // in milliseconds

function assertResponseOk(response) {
	if (!response.ok) {
		const { status, statusText } = response;

		throw new RequestError(`Request failed with ${status} "${statusText}" error.`, {
			status,
			statusText,
		});
	}
}

function isClientResponseError(error) {
	return error instanceof RequestError && error.status <= 500;
}

async function requestWithMeasure(url, options, logger, fetchMethod = globalThis.fetch) {
	const measureName = `request`;
	try {
		logger.mark(`${measureName} start`);
		return await fetchMethod(url, options);
	} finally {
		logger.mark(`${measureName} end`);
		logger.measure(measureName, `${measureName} start`, `${measureName} end`);
	}
}

export async function request(
	url,
	options,
	logger,
	retryCount = DEFAULT_REQUEST_RETRY_COUNT,
	fetchMethod = globalThis.fetch,
	setTimeoutMethod = globalThis.setTimeout
) {
	try {
		const response = await requestWithMeasure(url, options, logger, fetchMethod);
		assertResponseOk(response);

		logger.debug('request successful');

		return response;
	} catch (error) {
		if (isClientResponseError(error)) {
			logger.warn('request failed with client error, will not retry', { error });
			throw error;
		}

		if (retryCount === 0) {
			logger.warn('request failed, will not retry', { error });
			throw new RequestError('Request failed.', { cause: error });
		}

		logger.warn('request failed, will retry after delay', {
			delay: REQUEST_RETRY_DELAY,
			error,
			retryCount,
		});

		await retrySleep(setTimeoutMethod);
		return await request(url, options, logger, retryCount - 1, fetchMethod, setTimeoutMethod);
	}
}

async function retrySleep(setTimeoutMethod) {
	return new Promise((resolve) => setTimeoutMethod(() => resolve(), REQUEST_RETRY_DELAY));
}
