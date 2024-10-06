import { beforeEach, describe, expect, it, vi } from 'vitest';
// project imports
import { mockLoggerFactory } from '#test/mock-logger-factory.mjs';
import { WordOfTheDay } from './word-of-the-day.mjs';

const mocks = vi.hoisted(() => ({
	mastodonPoster: {
		post: vi.fn(),
	},
	wordResolver: {
		get: vi.fn(),
	},
}));
vi.mock('#lib/mastodon-poster.mjs', () => ({
	MastodonPoster: vi.fn().mockReturnValue(mocks.mastodonPoster),
}));
vi.mock('#lib/word-resolver.mjs', () => ({
	WordResolver: vi.fn().mockReturnValue(mocks.wordResolver),
}));

describe('WordOfTheDay', () => {
	const wordObject = {
		date: new Date('2023-08-16T05:00:00.000Z'),
		url: 'https://www.thefreedictionary.com/punctilious',
		word: 'punctilious',
	};
	let wordOfTheDay;

	beforeEach(() => {
		const loggerMock = mockLoggerFactory();

		mocks.wordResolver.get.mockResolvedValue(wordObject);

		wordOfTheDay = new WordOfTheDay(loggerMock);
	});

	describe('run()', () => {
		it('should post the word retrieved to the configured mastodon', async () => {
			await wordOfTheDay.run();

			expect(mocks.wordResolver.get).toHaveBeenCalled();
			expect(mocks.mastodonPoster.post).toHaveBeenCalledWith(wordObject);
		});
	});
});
