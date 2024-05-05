import { strict } from 'node:assert';
import {
	describe,
	it,
} from 'node:test';

import {
	RequestError,
	ResponseError,
	assertResponseOk,
	isClientResponseError,
} from '#util';

describe('assertResponseOk', () => {
	it('should throw a ResponseError when the response is not ok', () => {
		const response = {
			ok: false,
			status: 418,
			statusText: "I'm a teapot",
			url: 'https://example.com/418',
		};

		strict.throws(
			() => assertResponseOk(response),
			new ResponseError(response.status, response.statusText)
		);
	});
});

describe('isClientResponseError', () => {
	it('should return true when the status of the fetch response error is below 500', () => {
		const error = new ResponseError(404, 'Not Found');
		const result = isClientResponseError(error);

		strict.ok(result);
	});

	it('should return false when the status of the fetch response error is above 500', () => {
		const error = new ResponseError(504, 'Gateway Timeout');
		const result = isClientResponseError(error);

		strict.equal(result, false);
	});

	it('should return false when the error is not a fetch response error', () => {
		const error = new RequestError();
		const result = isClientResponseError(error);

		strict.equal(result, false);
	});
});
