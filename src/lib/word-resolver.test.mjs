import { beforeEach, describe, expect, it, vi } from 'vitest';
// project imports
import { config } from '#lib/config.mjs';
import { mockLoggerFactory } from '#src/test/mock-logger-factory.mjs';
import { FeedParserError, NoItemError, WordResolver } from './word-resolver.mjs';

function fakeItem(suffix = '') {
	const link = `https://www.merriam-webster.com/word-of-the-day/bully+pulpit-2023-07-29_${suffix}`;
	const title = `bully pulpit${suffix}`;
	const pubDate = new Date('Sat, 29 Jul 2023 01:00:01 -0400');

	return {
		link,
		pubDate,
		title,
	};
}

describe('WordResolver', () => {
	const urlMock = 'https://example.com/rss2';
	const itemIndexMock = 1;
	const feedTextMock = '<rss><channel></channel></rss>';
	let itemsMock;
	let textMock;
	let parseFeedMock;
	let requestMock;
	let wordResolver;

	beforeEach(() => {
		vi.spyOn(config.source, 'url', 'get').mockReturnValue(urlMock);
		vi.spyOn(config.source, 'itemIndex', 'get').mockReturnValue(itemIndexMock);

		textMock = vi.fn().mockResolvedValue(feedTextMock);
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
			const wordObject = await wordResolver.get();

			expect(requestMock).toHaveBeenCalledWith(urlMock, {}, expect.any(Object));
			expect(parseFeedMock).toBeCalledWith(feedTextMock);
			expect(wordObject).toEqual({
				date: itemsMock[itemIndexMock].pubDate,
				url: encodeURI(itemsMock[itemIndexMock].link),
				word: itemsMock[itemIndexMock].title,
			});
		});

		it('should return the word object when the source.itemIndex config is negative', async () => {
			vi.spyOn(config.source, 'itemIndex', 'get').mockReturnValue(-1);

			const wordObject = await wordResolver.get();

			expect(requestMock).toHaveBeenCalledWith(urlMock, {}, expect.any(Object));
			expect(parseFeedMock).toBeCalledWith(feedTextMock);
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

			await expect(wordResolver.get()).rejects.toThrowError(FeedParserError);
		});

		it('should throw a NoItemError when the requested item index is not available', async () => {
			vi.spyOn(config.source, 'itemIndex', 'get').mockReturnValue(itemsMock.length);

			await expect(wordResolver.get()).rejects.toThrowError(NoItemError);
		});
	});
});
