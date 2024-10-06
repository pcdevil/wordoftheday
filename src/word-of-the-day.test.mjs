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
	let mastodonPosterMock;
	let wordResolverMock;
	let wordOfTheDay;

	beforeEach(() => {
		const loggerMock = mockLoggerFactory();

		mastodonPosterMock = new MastodonPoster(loggerMock);
		vi.spyOn(mastodonPosterMock, 'post').mockResolvedValue();

		wordResolverMock = new WordResolver(loggerMock);
		vi.spyOn(wordResolverMock, 'get').mockResolvedValue(wordObject);

		wordOfTheDay = new WordOfTheDay(loggerMock, mastodonPosterMock, wordResolverMock);
	});

	describe('run()', () => {
		it('should post the word retrieved to the configured mastodon', async () => {
			await wordOfTheDay.run();

			expect(wordResolverMock.get).toHaveBeenCalled();
			expect(mastodonPosterMock.post).toHaveBeenCalledWith(wordObject);
		});
	});
});
