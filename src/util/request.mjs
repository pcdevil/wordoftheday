import { config } from '#src/lib/config.mjs';
import { NamedError } from '#src/util/named-error.mjs';

export class RequestError extends NamedError {
	constructor(message, options = {}) {
		const { cause, status, statusText } = options ?? {};

		const superOptions = cause ? { cause } : {};
		super(message, superOptions);

		this.status = status;
		this.statusText = statusText;
	}
}

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

async function fetchWithMeasure(url, options, logger) {
	const measureName = `request`;
	try {
		logger.mark(`${measureName} start`);
		return await fetch(url, options);
	} finally {
		logger.mark(`${measureName} end`);
		logger.measure(measureName, `${measureName} start`, `${measureName} end`);
	}
}

export async function request(
	url,
	options,
	logger,
	retryCount = config.request.retryCount
) {
	try {
		const response = await fetchWithMeasure(url, options, logger);
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
			error,
			retryCount,
			retryDelay: config.request.retryDelay,
		});

		await retrySleep();
		return await request(url, options, logger, retryCount - 1);
	}
}

async function retrySleep() {
	return new Promise((resolve) => setTimeout(resolve, config.request.retryDelay));
}
