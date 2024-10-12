import { beforeEach, describe, expect, it, vi } from 'vitest';
// project imports
import { UndefinedConfigError, config } from '#lib/config.mjs';
import { mockLoggerFactory } from '#test/mock-logger-factory.mjs';
import { request } from '#util/request.mjs';
import { MastodonPoster } from './mastodon-poster.mjs';

vi.mock('#util/request.mjs');
const mocks = {
	request: vi.mocked(request),
};

describe('MastodonPoster', () => {
	const baseUrlMock = 'https://example.com';
	const accessTokenMock = 'generated access token';
	const postHashtagMock = '#OxfordLearnersDictionaries';
	const wordObjectMock = {
		date: new Date('2023-08-13T01:00:00.000Z'),
		url: 'https://www.oxfordlearnersdictionaries.com/definition/english/corroborate',
		word: 'corroborate',
	};
	let jsonMock;
	let mastodonPoster;

	beforeEach(() => {
		vi.spyOn(config.mastodon, 'baseUrl', 'get').mockReturnValue(baseUrlMock);
		vi.spyOn(config.mastodon, 'accessToken', 'get').mockReturnValue(accessTokenMock);
		vi.spyOn(config.source, 'postHashtag', 'get').mockReturnValue(postHashtagMock);

		jsonMock = vi.fn().mockResolvedValue({});
		mocks.request.mockResolvedValue({
			json: jsonMock,
			ok: true,
		});

		mastodonPoster = new MastodonPoster(mockLoggerFactory());
	});

	describe('post()', () => {
		it('should call the request method', async () => {
			await mastodonPoster.post(wordObjectMock);

			expect(mocks.request).toHaveBeenCalledWith(
				`${baseUrlMock}/api/v1/statuses`,
				{
					body: JSON.stringify({
						language: MastodonPoster.language,
						status: [
							`#WordOfTheDay ${postHashtagMock} 13 August 2023`,
							'',
							wordObjectMock.word,
							'',
							wordObjectMock.url,
						].join('\n'),
						visibility: 'public',
					}),
					headers: {
						Authorization: `Bearer ${accessTokenMock}`,
						'Content-Type': 'application/json',
					},
					method: 'POST',
				},
				expect.any(Object)
			);
		});

		it('should handle when the source.postHashtag config is not defined', async () => {
			vi.spyOn(config.source, 'postHashtag', 'get').mockReturnValue(undefined);
			await mastodonPoster.post(wordObjectMock);

			expect(mocks.request).toHaveBeenCalledWith(
				expect.any(String),
				{
					body: JSON.stringify({
						language: MastodonPoster.language,
						status: [
							`#WordOfTheDay 13 August 2023`,
							'',
							wordObjectMock.word,
							'',
							wordObjectMock.url,
						].join('\n'),
						visibility: 'public',
					}),
					headers: expect.any(Object),
					method: expect.any(String),
				},
				expect.any(Object)
			);
		});

		it('should throw an error when the mastodon.baseUrl config is not defined', async () => {
			vi.spyOn(config.mastodon, 'baseUrl', 'get').mockReturnValue(undefined);

			await expect(mastodonPoster.post('', accessTokenMock, wordObjectMock, postHashtagMock)).rejects.toThrowError(UndefinedConfigError);
		});

		it('should throw an error when the mastodon.accessToken config is not defined', async () => {
			vi.spyOn(config.mastodon, 'accessToken', 'get').mockReturnValue(undefined);

			await expect(mastodonPoster.post(baseUrlMock, '', wordObjectMock, postHashtagMock)).rejects.toThrowError(UndefinedConfigError);
		});
	});
});
