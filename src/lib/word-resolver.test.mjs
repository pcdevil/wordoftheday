import { beforeEach, describe, expect, it, vi } from 'vitest';
// project imports
import { mockLoggerFactory } from '#src/test/mock-logger-factory.mjs';
import { FeedParserError, NoItemError, WordResolver } from './word-resolver.mjs';

function fakeItem(titleSuffix = '') {
	const link = 'https://www.merriam-webster.com/word-of-the-day/bully+pulpit-2023-07-29';
	const title = `bully pulpit${titleSuffix}`;
	const pubDate = new Date('Sat, 29 Jul 2023 01:00:01 -0400');

	return {
		link,
		pubDate,
		title,
	};
}

describe('WordResolver', () => {
	const feedUrl = 'https://example.com/rss2';
	const feedText = '<rss><channel></channel></rss>';
	let itemsMock;
	let textMock;
	let parseFeedMock;
	let requestMock;
	let wordResolver;

	beforeEach(() => {
		textMock = vi.fn().mockResolvedValue(feedText);
		requestMock = vi.fn().mockResolvedValue({
			ok: true,
			text: textMock,
		});

		itemsMock = Array.from({ length: 3 }, (_value, index) => fakeItem(index));
		parseFeedMock = vi.fn().mockReturnValue({ items: itemsMock });

		wordResolver = new WordResolver(mockLoggerFactory(), requestMock, parseFeedMock);
	});

	describe('get()', () => {
		it('should return the word object', async () => {
			const wordObject = await wordResolver.get(feedUrl, 1);

			expect(requestMock).toHaveBeenCalledWith(feedUrl, {}, expect.any(Object));
			expect(parseFeedMock).toBeCalledWith(feedText);
			expect(wordObject).toEqual({
				date: itemsMock[1].pubDate,
				url: encodeURI(itemsMock[1].link),
				word: itemsMock[1].title,
			});
		});

		it('should return the word object when the item index is negative', async () => {
			const wordObject = await wordResolver.get(feedUrl, -1);

			expect(requestMock).toHaveBeenCalledWith(feedUrl, {}, expect.any(Object));
			expect(parseFeedMock).toBeCalledWith(feedText);
			expect(wordObject).toEqual({
				date: itemsMock[2].pubDate,
				url: encodeURI(itemsMock[2].link),
				word: itemsMock[2].title,
			});
		});

		it('should throw a FeedParserError when the feed parser throws an error', async () => {
			parseFeedMock.mockImplementation(() => {
				throw new Error();
			});

			await expect(wordResolver.get(feedUrl, 0)).rejects.toThrowError(FeedParserError);
		});

		it('should throw a NoItemError when the requested item index is not available', async () => {
			await expect(wordResolver.get(feedUrl, itemsMock.length)).rejects.toThrowError(NoItemError);
		});
	});
});
