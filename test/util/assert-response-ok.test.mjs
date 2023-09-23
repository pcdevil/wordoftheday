import { strict } from 'node:assert';
import {
	describe,
	it,
} from 'node:test';

import { FetchResponseError, assertResponseOk } from '#util/assert-response-ok.mjs';

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
