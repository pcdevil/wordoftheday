import { strict } from 'node:assert';
import {
	beforeEach,
	describe,
	it,
	mock,
} from 'node:test';

import MastodonPoster from '#lib/mastodon-poster.mjs';
import { FetchError } from '#util/assert-response-ok.mjs';

describe('MastodonPoster', () => {
	const baseUrl = 'https://example.com';
	const accessToken = 'generated access token';
	const hashtag = '#OxfordLearnersDictionaries';
	const wordObject = {
		date: new Date('2023-08-13T01:00:00.000Z'),
		url: 'https://www.oxfordlearnersdictionaries.com/definition/english/corroborate',
		word: 'corroborate',
	};
	let fetchMock;
	let jsonMock;
	let mastodonPoster;

	beforeEach(() => {
		jsonMock = mock.fn(() => Promise.resolve({}));
		fetchMock = mock.fn(() => Promise.resolve({
			json: jsonMock,
			ok: true,
		}));

		mastodonPoster = new MastodonPoster(fetchMock);
	});

	describe('post()', () => {
		it('should properly call the fetch method', async () => {
			await mastodonPoster.post(baseUrl, accessToken, wordObject, hashtag);

			strict.equal(fetchMock.mock.calls.length, 1);

			const [url, options] = fetchMock.mock.calls[0].arguments;

			// check arguments one by one for better readability and debug
			strict.equal(url, `${baseUrl}/api/v1/statuses`);
			strict.deepEqual(options.body, JSON.stringify({
				language: mastodonPoster.language,
				status: [
					`#WordOfTheDay ${hashtag} 13 August 2023`,
					'',
					wordObject.word,
					'',
					wordObject.url,
				].join('\n'),
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

			await strict.rejects(
				async () => await mastodonPoster.post(baseUrl, accessToken, wordObject, hashtag),
				FetchError
			);
		});

		it('should throw a FetchError when the response is not ok', async () => {
			fetchMock.mock.mockImplementation(() => Promise.resolve({ ok: false }));

			await strict.rejects(
				async () => await mastodonPoster.post(baseUrl, accessToken, wordObject, hashtag),
				FetchError
			);
		});
	});
});
