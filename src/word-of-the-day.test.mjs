import { beforeEach, describe, expect, it, vi } from 'vitest';
// project imports
import { MastodonPoster } from '#lib/mastodon-poster.mjs';
import { WordResolver } from '#lib/word-resolver.mjs';
import { mockLoggerFactory } from '#test/mock-logger-factory.mjs';
import { InvalidSourceNameError, WordOfTheDay } from './word-of-the-day.mjs';

describe('WordOfTheDay', () => {
	const sourceName = 'theFreeDictionary';
	const wordObject = {
		date: new Date('2023-08-16T05:00:00.000Z'),
		url: 'https://www.thefreedictionary.com/punctilious',
		word: 'punctilious',
	};
	let configMock;
	let mastodonPosterMock;
	let wordResolverMock;
	let wordOfTheDay;

	beforeEach(() => {
		configMock = {
			mastodon: {
				accessToken: 'eSbzh2R7x5JTNqpOe9oZSFf-Uf7jJyXIqHquSSACeYo',
				baseUrl: 'https://mastodon.social',
			},
			sources: {
				[sourceName]: {
					hashtag: '#TheFreeDictionary',
					itemIndex: 0,
					url: 'https://www.thefreedictionary.com/_/WoD/rss.aspx',
				},
			},
		};

		const loggerMock = mockLoggerFactory();

		mastodonPosterMock = new MastodonPoster(loggerMock);
		vi.spyOn(mastodonPosterMock, 'post').mockResolvedValue();

		wordResolverMock = new WordResolver(loggerMock);
		vi.spyOn(wordResolverMock, 'get').mockResolvedValue(wordObject);

		wordOfTheDay = new WordOfTheDay(configMock, loggerMock, mastodonPosterMock, wordResolverMock);
	});

	describe('run()', () => {
		it('should post the word retrieved to the configured mastodon', async () => {
			await wordOfTheDay.run(sourceName);

			expect(wordResolverMock.get).toHaveBeenCalledWith(
				configMock.sources[sourceName].url,
				configMock.sources[sourceName].itemIndex
			);
			expect(mastodonPosterMock.post).toHaveBeenCalledWith(
				configMock.mastodon.baseUrl,
				configMock.mastodon.accessToken,
				wordObject,
				configMock.sources[sourceName].hashtag
			);
		});

		it('should throw an InvalidSourceNameError when the given source name is invalid', async () => {
			await expect(wordOfTheDay.run(sourceName + 'NotExisting')).rejects.toThrowError(InvalidSourceNameError);
		});
	});
});
