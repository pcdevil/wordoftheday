import { beforeEach, describe, expect, it, vi } from 'vitest';
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
		jsonMock = vi.fn().mockResolvedValue({});
		requestMock = vi.fn().mockResolvedValue({
			json: jsonMock,
			ok: true,
		});

		mastodonPoster = new MastodonPoster(mockLoggerFactory(), requestMock);
	});

	describe('post()', () => {
		it('should call the request method', async () => {
			await mastodonPoster.post(baseUrl, accessToken, wordObject, hashtag);

			expect(requestMock).toHaveBeenCalledWith(
				`${baseUrl}/api/v1/statuses`,
				{
					body: JSON.stringify({
						language: MastodonPoster.language,
						status: [
							`#WordOfTheDay ${hashtag} 13 August 2023`,
							'',
							wordObject.word,
							'',
							wordObject.url,
						].join('\n'),
						visibility: 'public',
					}),
					headers: {
						Authorization: `Bearer ${accessToken}`,
						'Content-Type': 'application/json',
					},
					method: 'POST',
				},
				expect.any(Object)
			);
		});
	});
});
