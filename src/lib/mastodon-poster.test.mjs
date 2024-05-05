import { strict } from 'node:assert';
import {
	beforeEach,
	describe,
	it,
	mock,
} from 'node:test';

import { MastodonPoster } from '#lib';
import { RequestError, ResponseError } from '#util';
import { mockLoggerFactory } from '#util/logger-factory.test.mjs';

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
	let requestWithMeasureMock;
	let setTimeoutMock;
	let mastodonPoster;

	beforeEach(() => {
		jsonMock = mock.fn(() => Promise.resolve({}));
		requestWithMeasureMock = mock.fn(() =>
			Promise.resolve({
				json: jsonMock,
				ok: true,
			})
		);
		setTimeoutMock = mock.fn((callback) => callback());

		mastodonPoster = new MastodonPoster(mockLoggerFactory(), requestWithMeasureMock, setTimeoutMock);
	});

	describe('post()', () => {
		it('should properly call the requestWithMeasure method', async () => {
			await mastodonPoster.post(baseUrl, accessToken, wordObject, hashtag);

			strict.equal(requestWithMeasureMock.mock.calls.length, 1);

			const [url, options] = requestWithMeasureMock.mock.calls[0].arguments;

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

		it('should re-call requestWithMeasure when the retry count is above zero and the requestWithMeasure method throws an error', async () => {
			for (let callIndex = 0; callIndex < MastodonPoster.retryCount; ++callIndex) {
				requestWithMeasureMock.mock.mockImplementationOnce(() => Promise.reject(new Error()), callIndex);
			}

			await mastodonPoster.post(baseUrl, accessToken, wordObject, hashtag);

			strict.equal(requestWithMeasureMock.mock.calls.length, MastodonPoster.retryCount + 1);
		});

		it('should wait for the retry delay before every requestWithMeasure re-call', async () => {
			for (let callIndex = 0; callIndex < MastodonPoster.retryCount; ++callIndex) {
				requestWithMeasureMock.mock.mockImplementationOnce(() => Promise.reject(new Error()), callIndex);
			}

			await mastodonPoster.post(baseUrl, accessToken, wordObject, hashtag);

			strict.equal(setTimeoutMock.mock.calls.length, MastodonPoster.retryCount);

			for (const call of setTimeoutMock.mock.calls) {
				const [_callback, delay] = call.arguments;
				strict.equal(delay, MastodonPoster.retryDelay);
			}
		});

		it('should throw a RequestError when the requestWithMeasure method throws an error even after retries', async () => {
			for (let callIndex = 0; callIndex < (MastodonPoster.retryCount + 1); ++callIndex) {
				requestWithMeasureMock.mock.mockImplementationOnce(() => Promise.reject(new Error()), callIndex);
			}

			await strict.rejects(
				async () => await mastodonPoster.post(baseUrl, accessToken, wordObject, hashtag),
				RequestError
			);
		});

		it('should throw a ResponseError without retry when the response is not ok with client error', async () => {
			const response = {
				ok: false,
				status: 404,
				statusText: 'Not Found',
			};
			requestWithMeasureMock.mock.mockImplementation(() => Promise.resolve(response));

			await strict.rejects(
				async () => await mastodonPoster.post(baseUrl, accessToken, wordObject, hashtag),
				new ResponseError(response.status, response.statusText)
			);

			strict.equal(setTimeoutMock.mock.calls.length, 0);
		});
	});
});
