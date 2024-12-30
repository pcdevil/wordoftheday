import { beforeEach, describe, expect, it, vi } from 'vitest';
// project imports
import { UndefinedConfigError, config } from '#src/lib/config.mjs';
import { request } from '#src/util/request.mjs';
import { fakeMastodonConfig, fakePostConfig } from '#src/vitest/fakers/config.faker.mjs';
import { fakeWordObject } from '#src/vitest/fakers/word-object.faker.mjs';
import { mockJsonResponse } from '#src/vitest/mocks/response.mock.mjs';
import { MastodonPoster } from './mastodon-poster.mjs';

vi.mock('#src/lib/config.mjs');
vi.mock('#src/util/request.mjs');
const mocks = {
	config: vi.mocked(config),
	request: vi.mocked(request),
};

function expectRequestMockToHaveBeenLastCalledWithBody(status) {
	// check body argument separately to avoid fragile assertion on the string
	const [_url, options] = mocks.request.mock.lastCall;
	const body = JSON.parse(options.body);

	expect(body).toEqual({
		language: mocks.config.post.language,
		status,
		visibility: mocks.config.post.visibility,
	});
}

describe('MastodonPoster', () => {
	let testWordObject;
	let testDateString;
	let mastodonPoster;

	beforeEach(() => {
		vi.spyOn(mocks.config, 'mastodon', 'get').mockReturnValue(fakeMastodonConfig());
		vi.spyOn(mocks.config, 'post', 'get').mockReturnValue(fakePostConfig());

		mocks.request.mockResolvedValue(mockJsonResponse());

		testWordObject = fakeWordObject();
		testDateString = new Intl.DateTimeFormat(mocks.config.post.language, { dateStyle: 'long' })
			.format(testWordObject.date);

		mastodonPoster = new MastodonPoster();
	});

	describe('post()', () => {
		it('should call the request method', async () => {
			const status = [
				`#WordOfTheDay ${mocks.config.post.hashtag} ${testDateString}`,
				'',
				testWordObject.word,
				'',
				testWordObject.url,
			].join('\n');

			await mastodonPoster.post(testWordObject);

			expect(mocks.request).toHaveBeenCalledWith(
				new URL(`${mocks.config.mastodon.baseUrl}/api/v1/statuses`),
				{
					body: expect.any(String),
					headers: {
						Authorization: `Bearer ${mocks.config.mastodon.accessToken}`,
						'Content-Type': 'application/json',
					},
					method: 'POST',
				},
				expect.any(Object)
			);
			expectRequestMockToHaveBeenLastCalledWithBody(status);
		});

		it('should handle when the source.postHashtag config is not defined', async () => {
			mocks.config.post.hashtag = undefined;
			const status = [
				`#WordOfTheDay ${testDateString}`,
				'',
				testWordObject.word,
				'',
				testWordObject.url,
			].join('\n');

			await mastodonPoster.post(testWordObject);

			expect(mocks.request).toHaveBeenCalledWith(
				expect.any(URL),
				{
					body: expect.any(String),
					headers: expect.any(Object),
					method: expect.any(String),
				},
				expect.any(Object)
			);
			expectRequestMockToHaveBeenLastCalledWithBody(status);
		});

		it('should throw an error when the mastodon.baseUrl config is not defined', async () => {
			mocks.config.mastodon.baseUrl = undefined;

			await expect(mastodonPoster.post(testWordObject)).rejects.toThrowError(
				UndefinedConfigError
			);
		});

		it('should throw an error when the mastodon.accessToken config is not defined', async () => {
			mocks.config.mastodon.accessToken = undefined;

			await expect(mastodonPoster.post(testWordObject)).rejects.toThrowError(
				UndefinedConfigError
			);
		});
	});
});
