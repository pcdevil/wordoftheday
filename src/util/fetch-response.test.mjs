import { strict } from 'node:assert';
import {
	describe,
	it,
} from 'node:test';

import {
	FetchError,
	FetchResponseError,
	assertResponseOk,
	isClientFetchResponseError,
} from '#util';

describe('assertResponseOk', () => {
	it('should throw a FetchResponseError when the response is not ok', () => {
		const response = {
			ok: false,
			status: 418,
			statusText: "I'm a teapot",
			url: 'https://example.com/418',
		};

		strict.throws(
			() => assertResponseOk(response),
			new FetchResponseError(response.status, response.statusText)
		);
	});
});

describe('isClientFetchResponseError', () => {
	it('should return true when the status of the fetch response error is below 500', () => {
		const error = new FetchResponseError(404, 'Not Found');
		const result = isClientFetchResponseError(error);

		strict.ok(result);
	});

	it('should return false when the status of the fetch response error is above 500', () => {
		const error = new FetchResponseError(504, 'Gateway Timeout');
		const result = isClientFetchResponseError(error);

		strict.equal(result, false);
	});

	it('should return false when the error is not a fetch response error', () => {
		const error = new FetchError();
		const result = isClientFetchResponseError(error);

		strict.equal(result, false);
	});
});
