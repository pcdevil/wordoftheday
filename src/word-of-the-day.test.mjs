import { beforeEach, describe, expect, it, vi } from 'vitest';
// project imports
import { MastodonPoster } from '#lib/mastodon-poster.mjs';
import { WordResolver } from '#lib/word-resolver.mjs';
import { mockLoggerFactory } from '#test/mock-logger-factory.mjs';
import { WordOfTheDay } from './word-of-the-day.mjs';

describe('WordOfTheDay', () => {
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
			source: {
				name: 'The Free Dictionary',
				url: 'https://www.thefreedictionary.com/_/WoD/rss.aspx',
				itemIndex: 0,
				postHashtag: '#TheFreeDictionary',
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
			await wordOfTheDay.run();

			expect(wordResolverMock.get).toHaveBeenCalledWith(
				configMock.source.url,
				configMock.source.itemIndex
			);
			expect(mastodonPosterMock.post).toHaveBeenCalledWith(
				configMock.mastodon.baseUrl,
				configMock.mastodon.accessToken,
				wordObject,
				configMock.source.postHashtag
			);
		});
	});
});
