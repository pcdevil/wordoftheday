import { beforeEach, describe, expect, it, vi } from 'vitest';
// project imports
import { UndefinedConfigError, config } from '#src/lib/config.mjs';
import { request } from '#src/util/request.mjs';
import { MastodonPoster } from './mastodon-poster.mjs';

vi.mock('#src/lib/config.mjs');
vi.mock('#src/util/request.mjs');
const mocks = {
	config: vi.mocked(config),
	request: vi.mocked(request),
};

describe('MastodonPoster', () => {
	const wordObjectMock = {
		date: new Date('2023-08-13T01:00:00.000Z'),
		url: 'https://www.oxfordlearnersdictionaries.com/definition/english/corroborate',
		word: 'corroborate',
	};
	let jsonMock;
	let mastodonPoster;

	beforeEach(() => {
		vi.spyOn(mocks.config, 'mastodon', 'get').mockReturnValue({
			baseUrl: 'https://example.com',
			accessToken: 'generated access token',
		});
		vi.spyOn(mocks.config, 'post', 'get').mockReturnValue({
			hashtag: '#OxfordLearnersDictionaries',
			language: 'en-GB',
			visibility: 'unlisted',
		});

		jsonMock = vi.fn().mockResolvedValue({});
		mocks.request.mockResolvedValue({
			json: jsonMock,
			ok: true,
		});

		mastodonPoster = new MastodonPoster();
	});

	describe('post()', () => {
		it('should call the request method', async () => {
			await mastodonPoster.post(wordObjectMock);

			expect(mocks.request).toHaveBeenCalledWith(
				`${mocks.config.mastodon.baseUrl}/api/v1/statuses`,
				{
					body: JSON.stringify({
						language: mocks.config.post.language,
						status: [
							`#WordOfTheDay ${mocks.config.post.hashtag} 13 August 2023`,
							'',
							wordObjectMock.word,
							'',
							wordObjectMock.url,
						].join('\n'),
						visibility: mocks.config.post.visibility,
					}),
					headers: {
						Authorization: `Bearer ${mocks.config.mastodon.accessToken}`,
						'Content-Type': 'application/json',
					},
					method: 'POST',
				},
				expect.any(Object)
			);
		});

		it('should handle when the source.postHashtag config is not defined', async () => {
			mocks.config.post.hashtag = undefined;

			await mastodonPoster.post(wordObjectMock);

			expect(mocks.request).toHaveBeenCalledWith(
				expect.any(String),
				{
					body: JSON.stringify({
						language: mocks.config.post.language,
						status: [
							`#WordOfTheDay 13 August 2023`,
							'',
							wordObjectMock.word,
							'',
							wordObjectMock.url,
						].join('\n'),
						visibility: mocks.config.post.visibility,
					}),
					headers: expect.any(Object),
					method: expect.any(String),
				},
				expect.any(Object)
			);
		});

		it('should throw an error when the mastodon.baseUrl config is not defined', async () => {
			mocks.config.mastodon.baseUrl = undefined;

			await expect(mastodonPoster.post(wordObjectMock)).rejects.toThrowError(
				UndefinedConfigError
			);
		});

		it('should throw an error when the mastodon.accessToken config is not defined', async () => {
			mocks.config.mastodon.accessToken = undefined;

			await expect(mastodonPoster.post(wordObjectMock)).rejects.toThrowError(
				UndefinedConfigError
			);
		});
	});
});
