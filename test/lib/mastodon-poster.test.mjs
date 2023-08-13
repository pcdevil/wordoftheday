import { strict } from 'node:assert';
import {
	beforeEach,
	describe,
	it,
	mock,
} from 'node:test';

import MastodonPoster, { FetchError } from '../../src/lib/mastodon-poster.mjs';

describe('MastodonPoster', () => {
	const baseUrl = 'https://example.com';
	const accessToken = 'generated access token';
	const status = 'sent status message';
	let fetchMock;
	let jsonMock;
	let mastodonPoster;

	beforeEach(() => {
		jsonMock = mock.fn(() => Promise.resolve({}));
		fetchMock = mock.fn(() => Promise.resolve({
			json: jsonMock,
			status: 200,
		}));

		mastodonPoster = new MastodonPoster(fetchMock);
	});

	describe('post()', () => {
		it('should properly call the fetch method', async () => {
			await mastodonPoster.post(baseUrl, accessToken, status);

			strict.equal(fetchMock.mock.calls.length, 1);

			const [url, options] = fetchMock.mock.calls[0].arguments;

			// check arguments one by one for better readability and debug
			strict.equal(url, `${baseUrl}/api/v1/statuses`);
			strict.deepEqual(options.body, JSON.stringify({
				language: 'en',
				status,
				visibility: 'public',
			}));
			strict.deepEqual(options.headers, {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			});
			strict.equal(options.method, 'POST');
		});

		it('should throw a FetchError when the fetch method throws an error', async () => {
			fetchMock.mock.mockImplementation(() => Promise.reject(new Error()));

			await strict.rejects(async () => await mastodonPoster.post(baseUrl, accessToken, status), FetchError);
		});

		it('should throw a FetchError when the response status is not HTTP OK', async () => {
			fetchMock.mock.mockImplementation(() => Promise.resolve({ status: 404 }));

			await strict.rejects(async () => await mastodonPoster.post(baseUrl, accessToken, status), FetchError);
		});
	});
});
