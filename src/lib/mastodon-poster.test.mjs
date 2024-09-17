import { strict } from 'node:assert';
import {
	beforeEach,
	describe,
	it,
	mock,
} from 'node:test';
// project imports
import { mockLoggerFactory } from '#test/mock-logger-factory.mjs';
import { MastodonPoster } from './mastodon-poster.mjs';

describe('MastodonPoster', () => {
	const baseUrl = 'https://example.com';
	const accessToken = 'generated access token';
	const hashtag = '#OxfordLearnersDictionaries';
	const wordObject = {
		date: new Date('2023-08-13T01:00:00.000Z'),
		url: 'https://www.oxfordlearnersdictionaries.com/definition/english/corroborate',
		word: 'corroborate',
	};
	let jsonMock;
	let requestMock;
	let mastodonPoster;

	beforeEach(() => {
		jsonMock = mock.fn(() => Promise.resolve({}));
		requestMock = mock.fn(() =>
			Promise.resolve({
				json: jsonMock,
				ok: true,
			})
		);

		mastodonPoster = new MastodonPoster(mockLoggerFactory(), requestMock);
	});

	describe('post()', () => {
		it('should properly call the request method', async () => {
			await mastodonPoster.post(baseUrl, accessToken, wordObject, hashtag);

			strict.equal(requestMock.mock.calls.length, 1);

			const [url, options] = requestMock.mock.calls[0].arguments;

			// check arguments one by one for better readability and debug
			strict.equal(url, `${baseUrl}/api/v1/statuses`);
			strict.deepEqual(
				options.body,
				JSON.stringify({
					language: MastodonPoster.language,
					status: [
						`#WordOfTheDay ${hashtag} 13 August 2023`,
						'',
						wordObject.word,
						'',
						wordObject.url,
					].join('\n'),
					visibility: 'public',
				})
			);
			strict.deepEqual(options.headers, {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			});
			strict.equal(options.method, 'POST');
		});
	});
});
